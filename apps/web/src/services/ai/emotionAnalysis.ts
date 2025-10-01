/**
 * 🤖 Emotion Analysis Service
 * Интеграция с Hugging Face для анализа эмоционального состояния
 */

export interface EmotionResult {
  emotions: Array<{
    label: string;
    score: number;
  }>;
  dominantEmotion: string;
  confidence: number;
  intensity: number;
  recommendations: string[];
}

export interface EmotionAnalysisInput {
  text: string;
  context?: string;
  userId?: string;
}

interface HuggingFaceEmotion {
  label: string;
  score: number;
}

type HuggingFaceAPIResponse = HuggingFaceEmotion[][];

class EmotionAnalysisService {
  private hfApiKey: string;
  private modelId: string = 'cardiffnlp/twitter-roberta-base-emotion-multilabel-latest';

  constructor() {
    this.hfApiKey = process.env.NEXT_PUBLIC_HUGGINGFACE_API_KEY || '';
  }

  async analyzeEmotion(input: EmotionAnalysisInput): Promise<EmotionResult> {
    try {
      // 2025-09-29 - Gemini: Switching to real Hugging Face API call
      // If API key is not available, use mock data as a fallback.
      if (!this.hfApiKey) {
        console.warn('Hugging Face API key not found. Using mock emotion analysis.');
        const mockResult = await this.getMockEmotionAnalysis(input);
        this.trackEmotionEvent(input, mockResult);
        return mockResult;
      }

      const result = await this.analyzeWithHuggingFace(input);

      // Track emotion detection
      this.trackEmotionEvent(input, result);

      return result;

    } catch (error) {
      console.error('Error in emotion analysis service:', error);

      // Fallback to neutral emotion in case of any error
      return {
        emotions: [{ label: 'neutral', score: 0.5 }],
        dominantEmotion: 'neutral',
        confidence: 0.5,
        intensity: 0.3,
        recommendations: ['Произошла ошибка при анализе. Попробуйте позже.']
      };
    }
  }

  private async getMockEmotionAnalysis(input: EmotionAnalysisInput): Promise<EmotionResult> {
    // Mock emotion analysis based on text content
    const text = input.text.toLowerCase();

    let emotions = [];
    let dominantEmotion = 'neutral';
    let confidence = 0.6;
    let intensity = 0.5;

    // Simple keyword-based emotion detection
    if (text.includes('отлично') || text.includes('супер') || text.includes('класс')) {
      dominantEmotion = 'joy';
      emotions = [
        { label: 'joy', score: 0.8 },
        { label: 'optimism', score: 0.6 }
      ];
      confidence = 0.8;
      intensity = 0.7;
    } else if (text.includes('проблем') || text.includes('ошибк') || text.includes('не работа')) {
      dominantEmotion = 'sadness';
      emotions = [
        { label: 'sadness', score: 0.7 },
        { label: 'anger', score: 0.4 }
      ];
      confidence = 0.7;
      intensity = 0.6;
    } else if (text.includes('спасибо') || text.includes('благодар') || text.includes('помогл')) {
      dominantEmotion = 'gratitude';
      emotions = [
        { label: 'joy', score: 0.6 },
        { label: 'love', score: 0.5 }
      ];
      confidence = 0.8;
      intensity = 0.6;
    } else if (text.includes('не понимаю') || text.includes('сложно') || text.includes('запутан')) {
      dominantEmotion = 'confusion';
      emotions = [
        { label: 'fear', score: 0.5 },
        { label: 'sadness', score: 0.4 }
      ];
      confidence = 0.6;
      intensity = 0.5;
    } else {
      // Default neutral response
      emotions = [{ label: 'neutral', score: 0.6 }];
    }

    const recommendations = this.generateRecommendations(dominantEmotion, input.context);

    return {
      emotions,
      dominantEmotion,
      confidence,
      intensity,
      recommendations
    };
  }

  private generateRecommendations(emotion: string, _context?: string): string[] {
    const recommendations: Record<string, string[]> = {
      joy: [
        'Поддерживайте позитивный настрой',
        'Предложите поделиться опытом',
        'Рекомендуйте похожие продукты'
      ],
      sadness: [
        'Предложите помощь и поддержку',
        'Упростите процесс покупки',
        'Дайте больше времени на размышление'
      ],
      anger: [
        'Извинитесь за неудобства',
        'Предложите альтернативное решение',
        'Обеспечьте быструю поддержку'
      ],
      confusion: [
        'Дайте четкие инструкции',
        'Предложите демо или туториал',
        'Упростите интерфейс'
      ],
      fear: [
        'Успокойте пользователя',
        'Дайте гарантии качества',
        'Предложите тестовый период'
      ],
      neutral: [
        'Предоставьте больше информации',
        'Задайте уточняющие вопросы',
        'Предложите персональную консультацию'
      ]
    };

    return recommendations[emotion] || recommendations.neutral || [];
  }

  private trackEmotionEvent(input: EmotionAnalysisInput, result: EmotionResult) {
    // Track emotion detection event
    if (typeof window !== 'undefined') {
      // In real app, this would send to analytics service
      console.log('Emotion detected:', {
        userId: input.userId,
        context: input.context,
        dominantEmotion: result.dominantEmotion,
        confidence: result.confidence,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Public method for real Hugging Face integration
  async analyzeWithHuggingFace(input: EmotionAnalysisInput): Promise<EmotionResult> {
    if (!this.hfApiKey) {
      throw new Error('Hugging Face API key not configured');
    }

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${this.modelId}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.hfApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: input.text,
          options: { wait_for_model: true }
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Hugging Face API error: ${response.status}`);
    }

    const data = (await response.json()) as HuggingFaceAPIResponse;

    // Process Hugging Face response
    const emotions: HuggingFaceEmotion[] = data[0] || [];
    const dominantEmotion = emotions.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    );

    const recommendations = this.generateRecommendations(dominantEmotion.label);

    return {
      emotions,
      dominantEmotion: dominantEmotion.label,
      confidence: dominantEmotion.score,
      intensity: Math.min(dominantEmotion.score * 1.5, 1), // Scale intensity
      recommendations
    };
  }
}

// Export singleton instance
export const emotionAnalysisService = new EmotionAnalysisService();
