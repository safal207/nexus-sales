// Emotion Analysis Utilities for NEXUS.SALES
export interface EmotionData {
  emotion: string;
  confidence: number;
  timestamp: number;
  context?: string;
  userId?: number;
}

export interface EmotionAnalysisResult {
  primary_emotion: string;
  confidence_score: number;
  emotions: {
    [key: string]: number;
  };
  sentiment: 'positive' | 'negative' | 'neutral';
  engagement_level: 'high' | 'medium' | 'low';
}

export interface EmotionJourney {
  user_id: number;
  journey_id: string;
  emotions: EmotionData[];
  conversion_events: {
    event: string;
    timestamp: number;
    emotion_at_event: string;
  }[];
  insights: {
    dominant_emotion: string;
    emotional_trend: 'improving' | 'declining' | 'stable';
    conversion_probability: number;
  };
}

// Mock emotion analysis for development
export class EmotionAnalyzer {
  private emotions = [
    'joy', 'trust', 'fear', 'surprise',
    'sadness', 'disgust', 'anger', 'anticipation'
  ];

  private sentiments = ['positive', 'negative', 'neutral'] as const;

  async analyzeText(text: string): Promise<EmotionAnalysisResult> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 100));

    // Simple keyword-based emotion detection for demo
    const emotionScores = this.calculateEmotionScores(text);
    const primaryEmotion = this.getPrimaryEmotion(emotionScores);
    const sentiment = this.determineSentiment(emotionScores);
    const engagement = this.calculateEngagement(emotionScores);

    return {
      primary_emotion: primaryEmotion,
      confidence_score: emotionScores[primaryEmotion] || 0.5,
      emotions: emotionScores,
      sentiment,
      engagement_level: engagement
    };
  }

  private calculateEmotionScores(text: string): { [key: string]: number } {
    const lowerText = text.toLowerCase();
    const scores: { [key: string]: number } = {};

    // Keywords for each emotion
    const emotionKeywords = {
      joy: ['happy', 'excited', 'great', 'amazing', 'love', 'fantastic', 'wonderful'],
      trust: ['reliable', 'safe', 'secure', 'confident', 'believe', 'faith'],
      fear: ['worried', 'scared', 'afraid', 'nervous', 'uncertain', 'doubt'],
      surprise: ['unexpected', 'wow', 'surprised', 'shocking', 'sudden'],
      sadness: ['sad', 'disappointed', 'frustrated', 'upset', 'down'],
      disgust: ['hate', 'terrible', 'awful', 'disgusting', 'horrible'],
      anger: ['angry', 'furious', 'mad', 'irritated', 'annoyed'],
      anticipation: ['excited', 'eager', 'looking forward', 'expect', 'hope']
    };

    // Calculate scores based on keyword matches
    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      let score = 0;
      keywords.forEach(keyword => {
        if (lowerText.includes(keyword)) {
          score += 0.2;
        }
      });
      scores[emotion] = Math.min(score, 1.0);
    });

    // Add some randomness for demo purposes
    this.emotions.forEach(emotion => {
      if (!scores[emotion]) {
        scores[emotion] = Math.random() * 0.3;
      }
    });

    return scores;
  }

  private getPrimaryEmotion(scores: { [key: string]: number }): string {
    const entries = Object.entries(scores);
    if (entries.length === 0) return 'neutral';

    let maxScore = -1;
    let primaryEmotion = 'neutral';

    for (const [emotion, score] of entries) {
      if (score > maxScore) {
        maxScore = score;
        primaryEmotion = emotion;
      }
    }

    return primaryEmotion;
  }

  private determineSentiment(scores: { [key: string]: number }): 'positive' | 'negative' | 'neutral' {
    const positiveEmotions = ['joy', 'trust', 'anticipation'];
    const negativeEmotions = ['fear', 'sadness', 'disgust', 'anger'];

    const positiveScore = positiveEmotions.reduce((sum, emotion) => sum + (scores[emotion] || 0), 0);
    const negativeScore = negativeEmotions.reduce((sum, emotion) => sum + (scores[emotion] || 0), 0);

    if (positiveScore > negativeScore + 0.2) return 'positive';
    if (negativeScore > positiveScore + 0.2) return 'negative';
    return 'neutral';
  }

  private calculateEngagement(scores: { [key: string]: number }): 'high' | 'medium' | 'low' {
    const totalEmotionalIntensity = Object.values(scores).reduce((sum, score) => sum + score, 0);

    if (totalEmotionalIntensity > 2.0) return 'high';
    if (totalEmotionalIntensity > 1.0) return 'medium';
    return 'low';
  }

  // Generate insights based on emotion data
  generateInsights(emotions: EmotionData[]): EmotionJourney['insights'] {
    if (emotions.length === 0) {
      return {
        dominant_emotion: 'neutral',
        emotional_trend: 'stable',
        conversion_probability: 0.5
      };
    }

    // Find dominant emotion
    const emotionCounts: { [key: string]: number } = {};
    emotions.forEach(({ emotion }) => {
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;
    });

    const dominantEmotion = Object.entries(emotionCounts).reduce((a, b) =>
      a[1] > b[1] ? a : b
    )[0];

    // Analyze emotional trend
    const recentEmotions = emotions.slice(-5);
    const positiveEmotions = ['joy', 'trust', 'anticipation'];
    const recentPositivity = recentEmotions.filter(e =>
      positiveEmotions.includes(e.emotion)
    ).length / recentEmotions.length;

    const earlyEmotions = emotions.slice(0, 5);
    const earlyPositivity = earlyEmotions.filter(e =>
      positiveEmotions.includes(e.emotion)
    ).length / earlyEmotions.length;

    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentPositivity > earlyPositivity + 0.2) trend = 'improving';
    else if (earlyPositivity > recentPositivity + 0.2) trend = 'declining';

    // Calculate conversion probability
    const conversionProbability = Math.min(
      0.3 + (recentPositivity * 0.7), // Base conversion + emotional positivity
      0.95
    );

    return {
      dominant_emotion: dominantEmotion,
      emotional_trend: trend,
      conversion_probability: conversionProbability
    };
  }
}

// Singleton instance
export const emotionAnalyzer = new EmotionAnalyzer();