import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../../utils/auth';

// Mock analytics data structure
interface AnalyticsInsight {
  type: 'emotion' | 'behavior' | 'conversion' | 'engagement';
  title: string;
  description: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  impact: 'high' | 'medium' | 'low';
  recommendation: string;
}

interface AnalyticsData {
  user_id: number;
  funnel_performance: {
    total_visitors: number;
    conversion_rate: number;
    emotional_engagement: number;
    bounce_rate: number;
  };
  emotional_insights: {
    dominant_emotions: string[];
    emotional_trend: 'improving' | 'declining' | 'stable';
    engagement_score: number;
    conversion_correlation: number;
  };
  recommendations: string[];
}

type PredictionsSummary = {
  next_24h_conversions: number;
  emotional_state_forecast: string;
  optimization_potential: string;
  confidence_score: number;
};

type InsightsResponsePayload = {
  success: true;
  data: AnalyticsData;
  insights: AnalyticsInsight[];
  predictions: PredictionsSummary;
  generated_at: string;
  ai_powered: true;
};

type InsightsCacheEntry = {
  ts: number;
  payload: InsightsResponsePayload;
};

declare global {
  var __insightsCache: Map<number, InsightsCacheEntry> | undefined;
}

// Mock data generator
function generateAnalyticsData(userId: number): AnalyticsData {
  return {
    user_id: userId,
    funnel_performance: {
      total_visitors: Math.floor(Math.random() * 1000) + 100,
      conversion_rate: Math.round((Math.random() * 0.15 + 0.05) * 100) / 100, // 5-20%
      emotional_engagement: Math.round((Math.random() * 0.4 + 0.6) * 100) / 100, // 60-100%
      bounce_rate: Math.round((Math.random() * 0.3 + 0.2) * 100) / 100 // 20-50%
    },
    emotional_insights: {
      dominant_emotions: ['joy', 'trust', 'anticipation'],
      emotional_trend: 'improving',
      engagement_score: Math.round((Math.random() * 0.3 + 0.7) * 100) / 100, // 70-100%
      conversion_correlation: Math.round((Math.random() * 0.2 + 0.75) * 100) / 100 // 75-95%
    },
    recommendations: [
      'Optimize emotional triggers in your call-to-action buttons',
      'Add more trust signals to reduce visitor anxiety',
      'Implement personalized content based on emotional state',
      'Use positive emotional language in product descriptions'
    ]
  };
}

function generateInsights(data: AnalyticsData): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = [];

  // Conversion rate insight
  insights.push({
    type: 'conversion',
    title: 'Conversion Rate',
    description: 'Current funnel conversion performance',
    value: `${(data.funnel_performance.conversion_rate * 100).toFixed(1)}%`,
    trend: data.funnel_performance.conversion_rate > 0.1 ? 'up' : 'stable',
    impact: data.funnel_performance.conversion_rate > 0.15 ? 'high' : 'medium',
    recommendation: data.funnel_performance.conversion_rate < 0.1
      ? 'Focus on emotional triggers to improve conversion'
      : 'Maintain current emotional optimization strategy'
  });

  // Emotional engagement insight
  insights.push({
    type: 'emotion',
    title: 'Emotional Engagement',
    description: 'How emotionally connected visitors are to your content',
    value: `${(data.emotional_insights.engagement_score * 100).toFixed(0)}%`,
    trend: data.emotional_insights.emotional_trend === 'improving' ? 'up' : 'stable',
    impact: data.emotional_insights.engagement_score > 0.8 ? 'high' : 'medium',
    recommendation: 'Use more emotional storytelling to increase engagement'
  });

  // Bounce rate insight
  insights.push({
    type: 'behavior',
    title: 'Bounce Rate',
    description: 'Percentage of visitors leaving without interaction',
    value: `${(data.funnel_performance.bounce_rate * 100).toFixed(1)}%`,
    trend: data.funnel_performance.bounce_rate < 0.3 ? 'down' : 'stable',
    impact: data.funnel_performance.bounce_rate > 0.4 ? 'high' : 'low',
    recommendation: data.funnel_performance.bounce_rate > 0.4
      ? 'Improve emotional hook in first 3 seconds'
      : 'Maintain current engagement strategy'
  });

  // AI-powered recommendation
  insights.push({
    type: 'engagement',
    title: 'AI Recommendation',
    description: 'Top AI-suggested improvement based on emotional analysis',
    value: 'Optimize Trust Signals',
    trend: 'up',
    impact: 'high',
    recommendation: 'Add customer testimonials with emotional language to build trust and reduce anxiety'
  });

  return insights;
}

export async function GET(request: NextRequest) {
  console.log('📊 Analytics insights API called');

  const user = requireAuth(request);
  if (!user) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Lightweight per-user in-memory cache (hot endpoint, short TTL)
    const now = Date.now();
    const ttlMs = 15_000;
    if (!globalThis.__insightsCache) {
      globalThis.__insightsCache = new Map<number, InsightsCacheEntry>();
    }
    const cache = globalThis.__insightsCache;

    const cached = cache.get(user.userId);
    if (cached && now - cached.ts < ttlMs) {
      return NextResponse.json(cached.payload);
    }

    console.log(`📈 Generating analytics insights for user ${user.userId}`);

    // Generate analytics data
    const analyticsData = generateAnalyticsData(user.userId);
    const insights = generateInsights(analyticsData);

    // AI-powered predictions
    const predictions: PredictionsSummary = {
      next_24h_conversions: Math.floor(analyticsData.funnel_performance.total_visitors * analyticsData.funnel_performance.conversion_rate * 0.1),
      emotional_state_forecast: 'Positive trend expected',
      optimization_potential: `${Math.round((1 - analyticsData.funnel_performance.conversion_rate) * 50)}% improvement possible`,
      confidence_score: 0.87
    };

    console.log(`✅ Generated ${insights.length} insights for user ${user.userId}`);

    const payload: InsightsResponsePayload = {
      success: true,
      data: analyticsData,
      insights,
      predictions,
      generated_at: new Date().toISOString(),
      ai_powered: true
    };

    cache.set(user.userId, { ts: now, payload });

    return NextResponse.json(payload);

  } catch (error) {
    console.error('💥 Analytics insights error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate insights' },
      { status: 500 }
    );
  }
}
