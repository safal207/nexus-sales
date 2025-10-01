import type { EmotionAnalysisResult } from './emotions';

export interface TrackingEvent {
  type: 'page_view' | 'form_input' | 'button_click' | 'scroll' | 'time_spent';
  element?: string;
  text?: string;
  timestamp: number;
  userId?: number;
  context: string;
}

type EmotionAnalysisResponse = {
  success?: boolean;
  analysis?: EmotionAnalysisResult;
  message?: string;
};

type EmotionTrackedEventSource = 'text_input' | 'interaction';

type EmotionTrackedEventDetail = EmotionAnalysisResponse & {
  context: string;
  userId?: number;
  source: EmotionTrackedEventSource;
};

export class EmotionTracker {
  private readonly apiUrl = '/api/emotions/analyze';
  private isEnabled = true;
  private debugMode = false;

  constructor(options?: { debug?: boolean; enabled?: boolean }) {
    this.debugMode = options?.debug ?? false;
    this.isEnabled = options?.enabled !== false;
  }

  async trackTextInput(
    text: string,
    context: string = 'input',
    userId?: number,
    source: EmotionTrackedEventSource = 'text_input',
  ): Promise<void> {
    if (!this.isEnabled || !text || text.length < 3) {
      return;
    }

    try {
      this.log(`📝 Tracking emotion for text: "${text.substring(0, 30)}..."`);

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: JSON.stringify({ text, context, userId }),
      });

      if (!response.ok) {
        this.log(`❌ Failed to track emotion: ${response.status} ${response.statusText}`);
        return;
      }

      const result = (await response.json()) as EmotionAnalysisResponse;
      const analysis = result.analysis;

      if (analysis) {
        this.log(`✅ Emotion tracked: ${analysis.primary_emotion}`, analysis);
      } else {
        this.log('⚠️ Emotion tracking response did not include analysis payload', result);
      }

      if (typeof window !== 'undefined') {
        const detail: EmotionTrackedEventDetail = {
          ...result,
          context,
          userId,
          source,
          success: result.success ?? Boolean(analysis),
        };
        window.dispatchEvent(new CustomEvent<EmotionTrackedEventDetail>('emotionTracked', { detail }));
      }
    } catch (error) {
      this.log('💥 Emotion tracking error', error);
    }
  }

  async trackPageInteraction(event: TrackingEvent): Promise<void> {
    if (!this.isEnabled) {
      return;
    }

    let emotionalText = '';

    switch (event.type) {
      case 'page_view':
        emotionalText = `User visited ${event.context} page`;
        break;
      case 'button_click':
        emotionalText = `User clicked ${event.element || 'button'} on ${event.context}`;
        break;
      case 'form_input':
        emotionalText = event.text ?? '';
        break;
      case 'time_spent':
        emotionalText = `User spent extended time on ${event.context}`;
        break;
      default:
        emotionalText = `User interacted with ${event.context}`;
    }

    if (emotionalText) {
      await this.trackTextInput(emotionalText, event.context, event.userId, 'interaction');
    }
  }

  setupAutoTracking(): void {
    if (!this.isEnabled || typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    this.log('🎯 Setting up automatic emotion tracking');

    this.trackFormInputs();
    this.trackButtonClicks();
    this.trackPageEngagement();
    this.trackScrollBehavior();
  }

  private trackFormInputs(): void {
    let inputTimer: ReturnType<typeof setTimeout> | undefined;

    document.addEventListener('input', (event) => {
      const target = event.target as HTMLInputElement | HTMLTextAreaElement | null;

      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        if (inputTimer) {
          clearTimeout(inputTimer);
        }

        inputTimer = setTimeout(() => {
          if (target.value.length > 10) {
            void this.trackTextInput(target.value, `form_${target.name || target.type}`);
          }
        }, 2000);
      }
    });
  }

  private trackButtonClicks(): void {
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement | null;

      if (target && (target.tagName === 'BUTTON' || (target as HTMLButtonElement).type === 'submit')) {
        const buttonText = target.textContent?.trim() || target.getAttribute('aria-label') || 'Unknown button';

        void this.trackPageInteraction({
          type: 'button_click',
          element: buttonText,
          timestamp: Date.now(),
          context: window.location.pathname,
        });
      }
    });
  }

  private trackPageEngagement(): void {
    let startTime = Date.now();
    let isActive = true;

    const markInactive = () => {
      isActive = false;
    };

    const markActive = () => {
      if (!isActive) {
        isActive = true;
        startTime = Date.now();
      }
    };

    ['blur', 'visibilitychange'].forEach((eventName) => {
      document.addEventListener(eventName, markInactive);
    });

    ['focus', 'visibilitychange'].forEach((eventName) => {
      document.addEventListener(eventName, markActive);
    });

    setInterval(() => {
      if (isActive && Date.now() - startTime > 30000) {
        void this.trackPageInteraction({
          type: 'time_spent',
          timestamp: Date.now(),
          context: `engaged_${window.location.pathname}`,
        });
        startTime = Date.now();
      }
    }, 30000);
  }

  private trackScrollBehavior(): void {
    let scrollTimer: ReturnType<typeof setTimeout> | undefined;
    let lastScrollPosition = 0;

    window.addEventListener('scroll', () => {
      if (scrollTimer) {
        clearTimeout(scrollTimer);
      }

      scrollTimer = setTimeout(() => {
        const currentPosition = window.scrollY;
        const totalHeight = document.body.scrollHeight - window.innerHeight;
        const scrollPercentage = totalHeight <= 0 ? 0 : Math.round((currentPosition / totalHeight) * 100);
        const scrollDirection = currentPosition > lastScrollPosition ? 'down' : 'up';

        if (scrollPercentage > 75 && scrollDirection === 'down') {
          void this.trackPageInteraction({
            type: 'scroll',
            timestamp: Date.now(),
            context: `deep_scroll_${window.location.pathname}_${scrollPercentage}%`,
          });
        }

        lastScrollPosition = currentPosition;
      }, 1000);
    });
  }

  private buildHeaders(): HeadersInit {
    const token = this.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private getAuthToken(): string | null {
    if (typeof window === 'undefined') {
      return null;
    }

    return (
      localStorage.getItem('authToken') ||
      sessionStorage.getItem('authToken') ||
      null
    );
  }

  private log(message: string, data?: unknown): void {
    if (!this.debugMode) {
      return;
    }

    if (typeof data !== 'undefined') {
      console.log(`[EmotionTracker] ${message}`, data);
    } else {
      console.log(`[EmotionTracker] ${message}`);
    }
  }

  setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.log(`Emotion tracking ${enabled ? 'enabled' : 'disabled'}`);
  }

  setDebugMode(debug: boolean): void {
    this.debugMode = debug;
    this.log(`Debug mode ${debug ? 'enabled' : 'disabled'}`);
  }
}

export const emotionTracker = new EmotionTracker({ debug: true });

if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  const setup = () => {
    emotionTracker.setupAutoTracking();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setup, { once: true });
  } else {
    setup();
  }
}
