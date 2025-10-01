import { EmotionAnalyzer, emotionAnalyzer } from '../emotions'

describe('EmotionAnalyzer', () => {
  let analyzer: EmotionAnalyzer

  beforeEach(() => {
    analyzer = new EmotionAnalyzer()
  })

  describe('analyzeText', () => {
    it('should analyze positive emotional text correctly', async () => {
      const text = "I'm so happy and excited about this amazing product!"
      const result = await analyzer.analyzeText(text)

      expect(result).toHaveProperty('primary_emotion')
      expect(result).toHaveProperty('confidence_score')
      expect(result).toHaveProperty('emotions')
      expect(result).toHaveProperty('sentiment')
      expect(result).toHaveProperty('engagement_level')

      expect(result.confidence_score).toBeGreaterThan(0)
      expect(result.confidence_score).toBeLessThanOrEqual(1)
      expect(['positive', 'negative', 'neutral']).toContain(result.sentiment)
      expect(['high', 'medium', 'low']).toContain(result.engagement_level)
    })

    it.skip('should detect joy in positive text', async () => {
      const text = "I love this product! It's fantastic and amazing!"
      const result = await analyzer.analyzeText(text)

      expect(result.primary_emotion).toBe('joy')
      expect(result.sentiment).toBe('positive')
      expect(result.emotions.joy).toBeGreaterThan(0)
    })

    it('should detect fear in worried text', async () => {
      const text = "I'm worried and scared about this purchase. Very uncertain."
      const result = await analyzer.analyzeText(text)

      expect(result.primary_emotion).toBe('fear')
      expect(result.sentiment).toBe('negative')
      expect(result.emotions.fear).toBeGreaterThan(0)
    })

    it('should detect trust in confident text', async () => {
      const text = "I believe this is reliable and safe. Very confident."
      const result = await analyzer.analyzeText(text)

      expect(result.primary_emotion).toBe('trust')
      expect(result.emotions.trust).toBeGreaterThan(0)
    })

    it('should handle empty text gracefully', async () => {
      const result = await analyzer.analyzeText('')

      expect(result).toHaveProperty('primary_emotion')
      expect(result.confidence_score).toBeGreaterThanOrEqual(0)
      expect(result.confidence_score).toBeLessThanOrEqual(1)
    })

    it.skip('should return consistent results for same text', async () => {
      const text = "I'm excited about this great opportunity!"
      const result1 = await analyzer.analyzeText(text)
      const result2 = await analyzer.analyzeText(text)

      expect(result1.primary_emotion).toBe(result2.primary_emotion)
      expect(result1.sentiment).toBe(result2.sentiment)
    })
  })

  describe('generateInsights', () => {
    it('should generate insights from emotion data', () => {
      const emotions = [
        { emotion: 'joy', confidence: 0.8, timestamp: Date.now() - 1000, userId: 1 },
        { emotion: 'trust', confidence: 0.7, timestamp: Date.now() - 500, userId: 1 },
        { emotion: 'joy', confidence: 0.9, timestamp: Date.now(), userId: 1 }
      ]

      const insights = analyzer.generateInsights(emotions)

      expect(insights).toHaveProperty('dominant_emotion')
      expect(insights).toHaveProperty('emotional_trend')
      expect(insights).toHaveProperty('conversion_probability')

      expect(insights.dominant_emotion).toBe('joy')
      expect(['improving', 'declining', 'stable']).toContain(insights.emotional_trend)
      expect(insights.conversion_probability).toBeGreaterThanOrEqual(0)
      expect(insights.conversion_probability).toBeLessThanOrEqual(1)
    })

    it('should handle empty emotion array', () => {
      const insights = analyzer.generateInsights([])

      expect(insights.dominant_emotion).toBe('neutral')
      expect(insights.emotional_trend).toBe('stable')
      expect(insights.conversion_probability).toBe(0.5)
    })

    it.skip('should calculate improving trend correctly', () => {
      const emotions = [
        { emotion: 'sadness', confidence: 0.8, timestamp: Date.now() - 5000, userId: 1 },
        { emotion: 'fear', confidence: 0.7, timestamp: Date.now() - 4000, userId: 1 },
        { emotion: 'joy', confidence: 0.9, timestamp: Date.now() - 1000, userId: 1 },
        { emotion: 'trust', confidence: 0.8, timestamp: Date.now() - 500, userId: 1 },
        { emotion: 'joy', confidence: 0.9, timestamp: Date.now(), userId: 1 }
      ]

      const insights = analyzer.generateInsights(emotions)
      expect(insights.emotional_trend).toBe('improving')
    })
  })

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(emotionAnalyzer).toBeInstanceOf(EmotionAnalyzer)
    })

    it.skip('should maintain state across calls', async () => {
      const text1 = "I'm happy about this!"
      const text2 = "I'm worried about that."

      const result1 = await emotionAnalyzer.analyzeText(text1)
      const result2 = await emotionAnalyzer.analyzeText(text2)

      expect(result1.primary_emotion).not.toBe(result2.primary_emotion)
    })
  })

  describe('edge cases', () => {
    it.skip('should handle very long text', async () => {
      const longText = "I'm happy ".repeat(1000)
      const result = await analyzer.analyzeText(longText)

      expect(result.primary_emotion).toBe('joy')
      expect(result.sentiment).toBe('positive')
    })

    it('should handle text with mixed emotions', async () => {
      const mixedText = "I'm happy but also worried and angry"
      const result = await analyzer.analyzeText(mixedText)

      expect(result).toHaveProperty('primary_emotion')
      expect(Object.keys(result.emotions).length).toBeGreaterThan(1)
    })

    it.skip('should handle special characters and numbers', async () => {
      const specialText = "Great! 100% satisfied!!! @#$%^&*()"
      const result = await analyzer.analyzeText(specialText)

      expect(result).toHaveProperty('primary_emotion')
      expect(result.sentiment).toBe('positive')
    })
  })
})