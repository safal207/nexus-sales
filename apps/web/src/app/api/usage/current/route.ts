import { NextRequest, NextResponse } from 'next/server';
import { usageTracker } from '@/lib/usage';
import { authenticateWithEcoId } from '../_lib/auth';

export async function GET(request: NextRequest) {
  const auth = await authenticateWithEcoId(request);

  if (!auth.ok) {
    return auth.response;
  }

  try {
    const usage = await usageTracker.getCurrentUsage(auth.ecoId);
    const limit = usage.limit;
    const remaining = limit < 0 ? -1 : Math.max(0, limit - usage.apiCalls);
    const usagePercentage = limit < 0 || limit === 0 ? null : Number(((usage.apiCalls / limit) * 100).toFixed(2));

    return NextResponse.json({
      success: true,
      data: {
        eco_id: auth.ecoId,
        api_calls: usage.apiCalls,
        limit,
        remaining,
        overage_calls: usage.overageCalls,
        period_start: usage.periodStart.toISOString(),
        period_end: usage.periodEnd.toISOString(),
        usage_percentage: usagePercentage,
      },
    });
  } catch (error) {
    console.error('[usage/current] failed to fetch usage', error);
    return NextResponse.json({ success: false, message: 'Failed to load usage summary.' }, { status: 500 });
  }
}
