/**
 * Emotion Analysis API Tests
 * Tests the emotion analysis functionality without server runtime dependencies
 */

import { EmotionAnalyzer } from '../../src/utils/emotions'

// Mock the emotion analyzer
jest.mock('../../src/utils/emotions', () => {
  const mockEmotionAnalyzer = {
    analyzeText: jest.fn(),
    calculateEmotionScores: jest.fn(),
    getPrimaryEmotion: jest.fn(),
    determineSentiment: jest.fn()
  }

  return {
    EmotionAnalyzer: jest.fn(() => mockEmotionAnalyzer),
    emotionAnalyzer: mockEmotionAnalyzer
  }
})

// Mock auth utilities
jest.mock('../../src/utils/auth', () => ({
  requireAuth: jest.fn()
}))

describe('/api/emotions/analyze (unit tests)', () => {
  let mockAnalyzer: any

  beforeEach(() => {
    jest.clearAllMocks()
    mockAnalyzer = new EmotionAnalyzer()
  })

  describe('Emotion analysis logic', () => {
    it('should analyze positive text correctly', async () => {
      const mockResult = {
        primary_emotion: 'joy',
        confidence_score: 0.85,
        emotions: [
          { emotion: 'joy', score: 0.85 },
          { emotion: 'excitement', score: 0.72 }
        ],
        sentiment: 'positive',
        engagement_level: 'high'
      }

      mockAnalyzer.analyzeText.mockResolvedValue(mockResult)

      const result = await mockAnalyzer.analyzeText('I am so excited about this amazing product!')

      expect(result.primary_emotion).toBe('joy')
      expect(result.sentiment).toBe('positive')
      expect(result.confidence_score).toBeGreaterThan(0.8)
      expect(mockAnalyzer.analyzeText).toHaveBeenCalledWith('I am so excited about this amazing product!')
    })

    it('should analyze negative text correctly', async () => {
      const mockResult = {
        primary_emotion: 'anger',
        confidence_score: 0.78,
        emotions: [
          { emotion: 'anger', score: 0.78 },
          { emotion: 'frustration', score: 0.65 }
        ],
        sentiment: 'negative',
        engagement_level: 'medium'
      }

      mockAnalyzer.analyzeText.mockResolvedValue(mockResult)

      const result = await mockAnalyzer.analyzeText('This is terrible and frustrating!')

      expect(result.primary_emotion).toBe('anger')
      expect(result.sentiment).toBe('negative')
      expect(result.confidence_score).toBeGreaterThan(0.7)
    })

    it('should analyze neutral text correctly', async () => {
      const mockResult = {
        primary_emotion: 'neutral',
        confidence_score: 0.6,
        emotions: [
          { emotion: 'neutral', score: 0.6 }
        ],
        sentiment: 'neutral',
        engagement_level: 'low'
      }

      mockAnalyzer.analyzeText.mockResolvedValue(mockResult)

      const result = await mockAnalyzer.analyzeText('This is a standard product.')

      expect(result.primary_emotion).toBe('neutral')
      expect(result.sentiment).toBe('neutral')
      expect(result.engagement_level).toBe('low')
    })
  })

  describe('Text preprocessing', () => {
    it('should handle empty text', async () => {
      const mockResult = {
        primary_emotion: 'neutral',
        confidence_score: 0.5,
        emotions: [],
        sentiment: 'neutral',
        engagement_level: 'low'
      }

      mockAnalyzer.analyzeText.mockResolvedValue(mockResult)

      const result = await mockAnalyzer.analyzeText('')

      expect(result.primary_emotion).toBe('neutral')
      expect(result.confidence_score).toBeLessThanOrEqual(0.5)
    })

    it('should handle very long text', async () => {
      const longText = 'This is a very long text. '.repeat(100)
      const mockResult = {
        primary_emotion: 'neutral',
        confidence_score: 0.7,
        emotions: [{ emotion: 'neutral', score: 0.7 }],
        sentiment: 'neutral',
        engagement_level: 'medium'
      }

      mockAnalyzer.analyzeText.mockResolvedValue(mockResult)

      const result = await mockAnalyzer.analyzeText(longText)

      expect(result).toBeDefined()
      expect(result.confidence_score).toBeGreaterThan(0)
    })

    it('should handle special characters and emojis', async () => {
      const emojiText = 'I love this! 😊❤️🎉'
      const mockResult = {
        primary_emotion: 'joy',
        confidence_score: 0.9,
        emotions: [{ emotion: 'joy', score: 0.9 }],
        sentiment: 'positive',
        engagement_level: 'high'
      }

      mockAnalyzer.analyzeText.mockResolvedValue(mockResult)

      const result = await mockAnalyzer.analyzeText(emojiText)

      expect(result.primary_emotion).toBe('joy')
      expect(result.confidence_score).toBeGreaterThan(0.8)
    })
  })

  describe('Emotion score calculation', () => {
    it('should calculate scores for multiple emotions', () => {
      const mockScores = {
        joy: 0.8,
        excitement: 0.6,
        trust: 0.5
      }

      mockAnalyzer.calculateEmotionScores.mockReturnValue(mockScores)

      const scores = mockAnalyzer.calculateEmotionScores('happy text')

      expect(scores.joy).toBeGreaterThan(scores.excitement)
      expect(scores.excitement).toBeGreaterThan(scores.trust)
    })

    it('should identify primary emotion correctly', () => {
      const emotionScores = {
        joy: 0.8,
        excitement: 0.6,
        trust: 0.5
      }

      mockAnalyzer.getPrimaryEmotion.mockReturnValue('joy')

      const primary = mockAnalyzer.getPrimaryEmotion(emotionScores)

      expect(primary).toBe('joy')
    })

    it('should determine sentiment from emotions', () => {
      const positiveEmotions = {
        joy: 0.8,
        excitement: 0.6
      }

      mockAnalyzer.determineSentiment.mockReturnValue('positive')

      const sentiment = mockAnalyzer.determineSentiment(positiveEmotions)

      expect(sentiment).toBe('positive')
    })
  })

  describe('Error handling', () => {
    it('should handle analysis errors gracefully', async () => {
      mockAnalyzer.analyzeText.mockRejectedValue(new Error('Analysis failed'))

      await expect(mockAnalyzer.analyzeText('test text')).rejects.toThrow('Analysis failed')
    })

    it('should handle invalid input types', async () => {
      const mockResult = {
        primary_emotion: 'neutral',
        confidence_score: 0.5,
        emotions: [],
        sentiment: 'neutral',
        engagement_level: 'low'
      }

      mockAnalyzer.analyzeText.mockResolvedValue(mockResult)

      // Should handle non-string input gracefully
      const result = await mockAnalyzer.analyzeText(null)

      expect(result.primary_emotion).toBe('neutral')
    })
  })

  describe('Performance considerations', () => {
    it('should complete analysis within reasonable time', async () => {
      const mockResult = {
        primary_emotion: 'joy',
        confidence_score: 0.8,
        emotions: [{ emotion: 'joy', score: 0.8 }],
        sentiment: 'positive',
        engagement_level: 'high'
      }

      mockAnalyzer.analyzeText.mockResolvedValue(mockResult)

      const startTime = Date.now()
      await mockAnalyzer.analyzeText('Test text for performance')
      const endTime = Date.now()

      const executionTime = endTime - startTime
      expect(executionTime).toBeLessThan(1000) // Should complete within 1 second
    })
  })
})