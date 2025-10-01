import { NextRequest, NextResponse } from 'next/server';
import { emotionAnalysisService } from '../../../../services/ai/emotionAnalysis';
import { verifyToken } from '../../../../utils/auth';

// Mock databases - replace with real implementation
const emotionDatabase = new Map<number, unknown[]>();
const emotionAnalyzer = {
  generateInsights: (_emotions: unknown[]) => ({
    dominant_emotion: 'neutral',
    emotional_trend: 'stable',
    conversion_probability: 0.5
  })
};

type EmotionHistoryPayload = {
  success: true;
  emotions: unknown[];
  insights: {
    dominant_emotion: string;
    emotional_trend: string;
    conversion_probability: number;
  };
  stats: {
    total_emotions: number;
    dominant_emotion: string;
    emotional_trend: string;
    conversion_probability: number;
  };
};

type EmotionCacheEntry = {
  ts: number;
  payload: EmotionHistoryPayload;
};

declare global {
  var __emotionHistoryCache: Map<number, EmotionCacheEntry> | undefined;
}

export async function POST(request: NextRequest) {
  console.log('🧠 Emotion analysis API called');

  try {
    const { text, context, userId } = await request.json();

    if (!text) {
      return NextResponse.json(
        { success: false, message: 'Text is required for analysis' },
        { status: 400 }
      );
    }

    console.log(`📝 Analyzing text: "${text.substring(0, 50)}..."`);

    // Perform emotion analysis
    const analysis = await emotionAnalysisService.analyzeEmotion({
      text,
      context,
      userId,
    });

    console.log(`✅ Emotion detected: ${analysis.dominantEmotion} (${Math.round(analysis.confidence * 100)}% confidence)`);

    return NextResponse.json({
      success: true,
      analysis,
    });

  } catch (error) {
    console.error('💥 Emotion analysis error:', error);
    return NextResponse.json(
      { success: false, message: 'Analysis failed' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  console.log('📊 Emotion history API called');

  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const user = verifyToken(token);
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // In-memory per-user TTL cache to speed up repeated reads
    const now = Date.now();
    const ttlMs = 15_000;
    if (!globalThis.__emotionHistoryCache) {
      globalThis.__emotionHistoryCache = new Map<number, EmotionCacheEntry>();
    }
    const cache = globalThis.__emotionHistoryCache;

    const cached = cache.get(user.userId);
    if (cached && now - cached.ts < ttlMs) {
      return NextResponse.json(cached.payload);
    }

    const userEmotions = emotionDatabase.get(user.userId) || [];

    // Generate insights
    const insights = emotionAnalyzer.generateInsights(userEmotions);

    console.log(`📈 Retrieved ${userEmotions.length} emotions for user ${user.userId}`);

    const payload: EmotionHistoryPayload = {
      success: true,
      emotions: userEmotions,
      insights,
      stats: {
        total_emotions: userEmotions.length,
        dominant_emotion: insights.dominant_emotion,
        emotional_trend: insights.emotional_trend,
        conversion_probability: Math.round(insights.conversion_probability * 100)
      }
    };

    cache.set(user.userId, { ts: now, payload });

    return NextResponse.json(payload);

  } catch (error) {
    console.error('💥 Emotion history error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve emotions' },
      { status: 500 }
    );
  }
}
