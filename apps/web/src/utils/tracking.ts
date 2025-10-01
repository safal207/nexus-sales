import { apiClient, type TrackingEventPayload, type TrackingMetadata } from './api';

type BrowserTrackingMetadata = TrackingMetadata;

type TrackingEvent = TrackingEventPayload & {
  metadata?: BrowserTrackingMetadata;
};

const buildMetadata = (metadata?: BrowserTrackingMetadata): BrowserTrackingMetadata => ({
  ...metadata,
  userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
  url: typeof window !== 'undefined' ? window.location.href : '',
  viewport:
    typeof window !== 'undefined'
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 0, height: 0 },
});

export const track = async (event: TrackingEvent): Promise<void> => {
  try {
    const eventData: TrackingEventPayload = {
      ...event,
      timestamp: event.timestamp ?? new Date().toISOString(),
      sessionId: event.sessionId ?? getSessionId(),
      referrer: event.referrer ?? (typeof document !== 'undefined' ? document.referrer : ''),
      metadata: buildMetadata(event.metadata),
    };

    await apiClient.trackEvent(eventData);
  } catch (error) {
    console.error('Failed to track event:', error);
  }
};

export const trackBatch = async (events: TrackingEvent[]): Promise<void> => {
  try {
    const payload = events.map<TrackingEventPayload>((event) => ({
      ...event,
      timestamp: event.timestamp ?? new Date().toISOString(),
      sessionId: event.sessionId ?? getSessionId(),
      referrer: event.referrer ?? (typeof document !== 'undefined' ? document.referrer : ''),
      metadata: buildMetadata(event.metadata),
    }));

    await apiClient.trackBatchEvents(payload);
  } catch (error) {
    console.error('Failed to track batch events:', error);
  }
};

export const trackEmotion = async (emotionData: {
  type: string;
  intensity: number;
  confidence: number;
  metadata?: BrowserTrackingMetadata;
  action?: string;
}): Promise<void> => {
  try {
    await apiClient.trackEmotion({
      ...emotionData,
      metadata: buildMetadata(emotionData.metadata),
    });
  } catch (error) {
    console.error('Failed to track emotion:', error);
  }
};

type TrackingEventName =
  | 'page_view'
  | 'product_view'
  | 'checkout_start'
  | 'order_created'
  | 'upsell_view'
  | 'upsell_click'
  | 'page_visible'
  | 'page_hidden'
  | 'page_unload';

const trackSimpleEvent = (name: TrackingEventName, metadata?: BrowserTrackingMetadata, extra?: Partial<TrackingEvent>) => {
  void track({
    name,
    metadata,
    ...extra,
  });
};

export const trackPageView = (page: string, metadata?: BrowserTrackingMetadata) =>
  trackSimpleEvent('page_view', { page, ...metadata });

export const trackProductView = (productId: string, metadata?: BrowserTrackingMetadata) =>
  trackSimpleEvent('product_view', metadata, { productId });

export const trackCheckoutStart = (productId: string, metadata?: BrowserTrackingMetadata) =>
  trackSimpleEvent('checkout_start', metadata, { productId });

export const trackOrderCreated = (orderId: string, productId: string, metadata?: BrowserTrackingMetadata) =>
  trackSimpleEvent('order_created', metadata, { orderId, productId });

export const trackUpsellView = (productId: string, metadata?: BrowserTrackingMetadata) =>
  trackSimpleEvent('upsell_view', metadata, { productId });

export const trackUpsellClick = (productId: string, metadata?: BrowserTrackingMetadata) =>
  trackSimpleEvent('upsell_click', metadata, { productId });

const getSessionId = (): string => {
  if (typeof window === 'undefined') {
    return generateSessionId();
  }

  let sessionId = sessionStorage.getItem('session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('session_id', sessionId);
  }
  return sessionId;
};

const generateSessionId = (): string => `session_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

export const initTracking = () => {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return;
  }

  trackPageView(window.location.pathname);

  document.addEventListener('visibilitychange', () => {
    const eventName: TrackingEventName = document.visibilityState === 'visible' ? 'page_visible' : 'page_hidden';
    trackSimpleEvent(eventName, { page: window.location.pathname });
  });

  window.addEventListener('beforeunload', () => {
    trackSimpleEvent('page_unload', { page: window.location.pathname });
  });
};
