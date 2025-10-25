import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { authenticateWithEcoId } from '../_lib/auth';

const DEFAULT_DAYS = 30;
const MAX_DAYS = 365;

function normalizeDays(value: string | null): number {
  const parsed = value ? Number.parseInt(value, 10) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_DAYS;
  }
  return Math.min(parsed, MAX_DAYS);
}

export async function GET(request: NextRequest) {
  const auth = await authenticateWithEcoId(request);

  if (!auth.ok) {
    return auth.response;
  }

  const { searchParams } = new URL(request.url);
  const days = normalizeDays(searchParams.get('days'));

  const startDate = new Date();
  startDate.setUTCDate(startDate.getUTCDate() - (days - 1));

  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('eco_usage_daily')
      .select('date,total_calls,successful_calls,failed_calls,avg_response_time_ms,top_endpoints')
      .eq('eco_id', auth.ecoId)
      .gte('date', startDate.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (error) {
      console.error('[usage/history] Supabase query failed', error);
      return NextResponse.json({ success: false, message: 'Failed to fetch usage history.' }, { status: 500 });
    }

    const history = (data ?? []).map((entry) => ({
      ...entry,
      top_endpoints: Array.isArray(entry.top_endpoints) ? entry.top_endpoints : [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        eco_id: auth.ecoId,
        period_days: days,
        history,
      },
    });
  } catch (error) {
    console.error('[usage/history] unexpected error', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch usage history.' }, { status: 500 });
  }
}
