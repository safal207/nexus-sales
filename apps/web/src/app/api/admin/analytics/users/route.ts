import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAdminAuth } from '../../_lib/auth';

type PlanFilter = 'free' | 'pro' | 'enterprise';

type SortField = 'usage' | 'overage_calls' | 'overage_cost';

type OrderDirection = 'asc' | 'desc';

function parsePlan(value: string | null): PlanFilter | undefined {
  if (!value) return undefined;
  const normalized = value.toLowerCase();
  if (normalized === 'free' || normalized === 'pro' || normalized === 'enterprise') {
    return normalized;
  }
  return undefined;
}

function parseSort(value: string | null): SortField {
  if (!value) return 'usage';
  const normalized = value.toLowerCase();
  if (normalized === 'overage_calls') return 'overage_calls';
  if (normalized === 'overage_cost') return 'overage_cost';
  return 'usage';
}

function parseDirection(value: string | null): OrderDirection {
  if (value?.toLowerCase() === 'asc') {
    return 'asc';
  }
  return 'desc';
}

function getSortClause(sort: SortField, direction: OrderDirection): string {
  const column =
    sort === 'overage_calls'
      ? 'u.overage_calls'
      : sort === 'overage_cost'
        ? 'u.overage_cost'
        : 'u.api_calls';

  const dir = direction === 'asc' ? 'ASC' : 'DESC';
  return `${column} ${dir} NULLS LAST`;
}

function toNumber(value: unknown): number {
  if (value === null || value === undefined) {
    return 0;
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  if (typeof value === 'number') {
    return value;
  }
  return Number(value) || 0;
}

const DEFAULT_LIMIT = 25;
const MAX_LIMIT = 100;

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth(req);
  } catch (response) {
    if (response instanceof NextResponse) {
      return response;
    }
    throw response;
  }

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1);
  const requestedLimit = Number.parseInt(searchParams.get('limit') ?? `${DEFAULT_LIMIT}`, 10);
  const limit = Math.min(MAX_LIMIT, requestedLimit > 0 ? requestedLimit : DEFAULT_LIMIT);
  const offset = (page - 1) * limit;

  const plan = parsePlan(searchParams.get('plan'));
  const sort = parseSort(searchParams.get('sort'));
  const direction = parseDirection(searchParams.get('order'));

  const sortClause = getSortClause(sort, direction);

  const baseCte = `WITH latest_usage AS (
    SELECT DISTINCT ON (eco_id)
           eco_id,
           subscription_id,
           api_calls,
           overage_calls,
           overage_cost,
           billing_period_start,
           billing_period_end
      FROM eco_usage_records
     ORDER BY eco_id, billing_period_start DESC
  )`;

  const wherePlanFragment = plan ? ' AND s.plan = $1' : '';
  const limitPlaceholder = plan ? '$2' : '$1';
  const offsetPlaceholder = plan ? '$3' : '$2';

  const dataQuery = `${baseCte}
  SELECT u.eco_id,
         s.plan,
         u.api_calls,
         u.overage_calls,
         u.overage_cost,
         u.billing_period_start,
         u.billing_period_end
    FROM latest_usage u
    JOIN eco_subscriptions s ON s.id = u.subscription_id
   WHERE s.status = 'active'${wherePlanFragment}
   ORDER BY ${sortClause}
   LIMIT ${limitPlaceholder}
   OFFSET ${offsetPlaceholder};`;

  const countQuery = `${baseCte}
  SELECT COUNT(*)::bigint AS total
    FROM latest_usage u
    JOIN eco_subscriptions s ON s.id = u.subscription_id
   WHERE s.status = 'active'${wherePlanFragment};`;

  const params: Array<string | number> = [];
  if (plan) params.push(plan);
  params.push(limit, offset);

  const countParams: Array<string> = [];
  if (plan) countParams.push(plan);

  try {
    const rows = await prisma.$queryRawUnsafe<Array<{
      eco_id: string;
      plan: string | null;
      api_calls: number | bigint | null;
      overage_calls: number | bigint | null;
      overage_cost: number | bigint | null;
      billing_period_start: Date | string | null;
      billing_period_end: Date | string | null;
    }>>(dataQuery, ...params);

    const countRows = await prisma.$queryRawUnsafe<Array<{ total: bigint | null }>>(countQuery, ...countParams);
    const totalRecords = toNumber(countRows[0]?.total ?? 0);
    const totalPages = Math.max(1, Math.ceil(totalRecords / limit));

    const data = rows.map((row) => ({
      eco_id: row.eco_id,
      plan: row.plan,
      api_calls: toNumber(row.api_calls),
      overage_calls: toNumber(row.overage_calls),
      overage_cost_cents: toNumber(row.overage_cost),
      overage_cost_usd: toNumber(row.overage_cost) / 100,
      billing_period_start: row.billing_period_start ? new Date(row.billing_period_start).toISOString() : null,
      billing_period_end: row.billing_period_end ? new Date(row.billing_period_end).toISOString() : null,
    }));

    return NextResponse.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: totalRecords,
        total_pages: totalPages,
      },
      filters: {
        plan: plan ?? null,
        sort,
        order: direction,
      },
    });
  } catch (error) {
    console.error('[admin/analytics/users] failed to load users', error);
    return NextResponse.json({ success: false, message: 'Failed to load admin user analytics.' }, { status: 500 });
  }
}
