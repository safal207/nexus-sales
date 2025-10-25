import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/admin';
import { authenticateWithEcoId } from '../_lib/auth';

const DEFAULT_DAYS = 7;
const MAX_DAYS = 90;

interface RawEndpointRecord {
  endpoint: string | null;
  method: string | null;
  status_code: number | null;
  response_time_ms: number | null;
}

interface EndpointAccumulator {
  endpoint: string;
  method: string;
  totalCalls: number;
  successCalls: number;
  failedCalls: number;
  totalResponseTime: number;
  statusCounts: Record<number, number>;
}

function normalizeDays(value: string | null): number {
  const parsed = value ? Number.parseInt(value, 10) : NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_DAYS;
  }
  return Math.min(parsed, MAX_DAYS);
}

function scoreRecord(map: Map<string, EndpointAccumulator>, record: RawEndpointRecord) {
  const endpoint = record.endpoint ?? 'unknown';
  const method = (record.method ?? 'GET').toUpperCase();
  const key = `${method} ${endpoint}`;

  let accumulator = map.get(key);
  if (!accumulator) {
    accumulator = {
      endpoint,
      method,
      totalCalls: 0,
      successCalls: 0,
      failedCalls: 0,
      totalResponseTime: 0,
      statusCounts: {},
    };
    map.set(key, accumulator);
  }

  accumulator.totalCalls += 1;

  if (typeof record.status_code === 'number') {
    accumulator.statusCounts[record.status_code] = (accumulator.statusCounts[record.status_code] ?? 0) + 1;

    if (record.status_code >= 200 && record.status_code < 300) {
      accumulator.successCalls += 1;
    }

    if (record.status_code >= 400) {
      accumulator.failedCalls += 1;
    }
  }

  if (typeof record.response_time_ms === 'number') {
    accumulator.totalResponseTime += Math.max(record.response_time_ms, 0);
  }
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
      .from('eco_api_usage')
      .select('endpoint, method, status_code, response_time_ms')
      .eq('eco_id', auth.ecoId)
      .gte('timestamp', startDate.toISOString())
      .order('timestamp', { ascending: false });

    if (error) {
      console.error('[usage/endpoints] Supabase query failed', error);
      return NextResponse.json({ success: false, message: 'Failed to fetch endpoint analytics.' }, { status: 500 });
    }

    const aggregates = new Map<string, EndpointAccumulator>();
    (data as RawEndpointRecord[] | null)?.forEach((record) => {
      scoreRecord(aggregates, record);
    });

    const endpoints = Array.from(aggregates.values())
      .map((item) => {
        const avgResponseTime = item.totalCalls === 0 ? 0 : Math.round(item.totalResponseTime / item.totalCalls);
        const successRate = item.totalCalls === 0 ? 0 : Number(((item.successCalls / item.totalCalls) * 100).toFixed(2));

        return {
          endpoint: item.endpoint,
          method: item.method,
          total_calls: item.totalCalls,
          success_rate: successRate,
          failed_calls: item.failedCalls,
          avg_response_time_ms: avgResponseTime,
          status_counts: item.statusCounts,
        };
      })
      .sort((a, b) => b.total_calls - a.total_calls);

    return NextResponse.json({
      success: true,
      data: {
        eco_id: auth.ecoId,
        period_days: days,
        endpoints,
      },
    });
  } catch (error) {
    console.error('[usage/endpoints] unexpected error', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch endpoint analytics.' }, { status: 500 });
  }
}
