/**
 * Mock data factories for testing
 */

export const mockUser = {
  id: '1',
  email: 'test@test.com',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const mockProduct = {
  id: '1',
  name: 'Test Product',
  description: 'A fantastic test product that brings joy and excitement!',
  price: 99.99,
  userId: '1',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const mockOrder = {
  id: '1',
  productId: '1',
  customerEmail: 'customer@test.com',
  quantity: 1,
  total: 99.99,
  status: 'pending' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01')
};

export const mockEmotionAnalysis = {
  success: true,
  analysis: {
    primary_emotion: 'joy' as const,
    confidence_score: 0.85,
    emotions: [
      { emotion: 'joy', score: 0.85 },
      { emotion: 'excitement', score: 0.72 },
      { emotion: 'trust', score: 0.68 }
    ],
    sentiment: 'positive' as const,
    engagement_level: 'high' as const
  },
  stored: true,
  total_emotions: 1
};

export const mockAnalyticsInsights = {
  success: true,
  insights: [
    {
      type: 'conversion',
      title: 'Conversion Rate',
      value: '12.5%',
      trend: 'up' as const,
      impact: 'high' as const,
      recommendation: 'Continue current strategy'
    },
    {
      type: 'emotion',
      title: 'Emotional Engagement',
      value: '85%',
      trend: 'up' as const,
      impact: 'high' as const,
      recommendation: 'Leverage positive emotions'
    }
  ],
  predictions: {
    next_24h_conversions: 15,
    confidence_score: 0.87,
    emotional_state_forecast: 'Positive trend expected',
    optimization_potential: '15% improvement possible'
  }
};

export const mockJWTToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxIiwiZW1haWwiOiJ0ZXN0QHRlc3QuY29tIiwiaWF0IjoxNjQwOTk1MjAwLCJleHAiOjE2NDA5OTg4MDB9.test-signature';

// Factory functions for creating test data
export const createMockUser = (overrides: Partial<typeof mockUser> = {}) => ({
  ...mockUser,
  ...overrides
});

export const createMockProduct = (overrides: Partial<typeof mockProduct> = {}) => ({
  ...mockProduct,
  ...overrides
});

export const createMockOrder = (overrides: Partial<typeof mockOrder> = {}) => ({
  ...mockOrder,
  ...overrides
});

export const createMockEmotionAnalysis = (overrides: Partial<typeof mockEmotionAnalysis.analysis> = {}) => ({
  ...mockEmotionAnalysis,
  analysis: {
    ...mockEmotionAnalysis.analysis,
    ...overrides
  }
});

// Mock API responses
export const mockSuccessResponse = <T>(data: T) => ({
  ok: true,
  status: 200,
  json: async () => ({ success: true, data })
});

export const mockErrorResponse = (status: number = 500, message: string = 'Internal Server Error') => ({
  ok: false,
  status,
  json: async () => ({ success: false, error: message })
});

// Mock emotion data for various emotions
export const mockEmotionsByType = {
  joy: {
    primary_emotion: 'joy' as const,
    confidence_score: 0.92,
    emotions: [
      { emotion: 'joy', score: 0.92 },
      { emotion: 'happiness', score: 0.78 },
      { emotion: 'excitement', score: 0.65 }
    ],
    sentiment: 'positive' as const,
    engagement_level: 'high' as const
  },
  trust: {
    primary_emotion: 'trust' as const,
    confidence_score: 0.88,
    emotions: [
      { emotion: 'trust', score: 0.88 },
      { emotion: 'confidence', score: 0.74 },
      { emotion: 'security', score: 0.69 }
    ],
    sentiment: 'positive' as const,
    engagement_level: 'high' as const
  },
  fear: {
    primary_emotion: 'fear' as const,
    confidence_score: 0.79,
    emotions: [
      { emotion: 'fear', score: 0.79 },
      { emotion: 'anxiety', score: 0.66 },
      { emotion: 'uncertainty', score: 0.54 }
    ],
    sentiment: 'negative' as const,
    engagement_level: 'medium' as const
  },
  anger: {
    primary_emotion: 'anger' as const,
    confidence_score: 0.83,
    emotions: [
      { emotion: 'anger', score: 0.83 },
      { emotion: 'frustration', score: 0.71 },
      { emotion: 'irritation', score: 0.58 }
    ],
    sentiment: 'negative' as const,
    engagement_level: 'high' as const
  },
  sadness: {
    primary_emotion: 'sadness' as const,
    confidence_score: 0.76,
    emotions: [
      { emotion: 'sadness', score: 0.76 },
      { emotion: 'disappointment', score: 0.63 },
      { emotion: 'melancholy', score: 0.51 }
    ],
    sentiment: 'negative' as const,
    engagement_level: 'low' as const
  },
  surprise: {
    primary_emotion: 'surprise' as const,
    confidence_score: 0.81,
    emotions: [
      { emotion: 'surprise', score: 0.81 },
      { emotion: 'amazement', score: 0.67 },
      { emotion: 'wonder', score: 0.59 }
    ],
    sentiment: 'neutral' as const,
    engagement_level: 'medium' as const
  },
  anticipation: {
    primary_emotion: 'anticipation' as const,
    confidence_score: 0.85,
    emotions: [
      { emotion: 'anticipation', score: 0.85 },
      { emotion: 'expectation', score: 0.72 },
      { emotion: 'hope', score: 0.64 }
    ],
    sentiment: 'positive' as const,
    engagement_level: 'high' as const
  },
  disgust: {
    primary_emotion: 'disgust' as const,
    confidence_score: 0.77,
    emotions: [
      { emotion: 'disgust', score: 0.77 },
      { emotion: 'revulsion', score: 0.62 },
      { emotion: 'aversion', score: 0.55 }
    ],
    sentiment: 'negative' as const,
    engagement_level: 'low' as const
  }
};