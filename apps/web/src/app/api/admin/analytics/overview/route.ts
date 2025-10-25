import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/db/prisma';
import { requireAdminAuth } from '../../_lib/auth';

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

export async function GET(req: NextRequest) {
  try {
    await requireAdminAuth(req);
  } catch (response) {
    if (response instanceof NextResponse) {
      return response;
    }
    throw response;
  }

  const now = new Date();
  const startOfMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  try {
    const planRows = await prisma.$queryRaw<Array<{ plan: string | null; count: bigint }>>`
      SELECT plan, COUNT(*)::bigint AS count
        FROM eco_subscriptions
       WHERE status = 'active'
       GROUP BY plan;
    `;

    const usersByPlan = {
      free: toNumber(planRows.find((row) => row.plan === 'free')?.count),
      pro: toNumber(planRows.find((row) => row.plan === 'pro')?.count),
      enterprise: toNumber(planRows.find((row) => row.plan === 'enterprise')?.count),
    };

    const totalUsers = usersByPlan.free + usersByPlan.pro + usersByPlan.enterprise;

    const mrr = usersByPlan.pro * 49 + usersByPlan.enterprise * 500;

    const [{ total_api_calls: totalApiCalls }] = await prisma.$queryRaw<Array<{ total_api_calls: bigint | null }>>`
      SELECT SUM(api_calls)::bigint AS total_api_calls
        FROM eco_usage_records
       WHERE billing_period_start >= ${startOfMonth};
    `;

    const [{ overage_revenue: overageRevenueCents }] = await prisma.$queryRaw<Array<{ overage_revenue: bigint | null }>>`
      SELECT SUM(overage_cost)::bigint AS overage_revenue
        FROM eco_usage_records
       WHERE overage_invoiced = TRUE
         AND billing_period_start >= ${startOfMonth};
    `;

    const overageRevenue = toNumber(overageRevenueCents) / 100;
    const totalRevenue = mrr + overageRevenue;

    const topUsers = await prisma.$queryRaw<Array<{ eco_id: string; api_calls: number; plan: string | null }>>`
      WITH latest_usage AS (
        SELECT DISTINCT ON (eco_id)
               eco_id,
               subscription_id,
               api_calls,
               billing_period_start
          FROM eco_usage_records
         ORDER BY eco_id, billing_period_start DESC
      )
      SELECT u.eco_id,
             u.api_calls,
             s.plan
        FROM latest_usage u
        JOIN eco_subscriptions s ON s.id = u.subscription_id
       WHERE s.status = 'active'
       ORDER BY u.api_calls DESC
       LIMIT 5;
    `;

    return NextResponse.json({
      success: true,
      data: {
        total_users: totalUsers,
        users_by_plan: usersByPlan,
        total_api_calls_this_month: toNumber(totalApiCalls),
        mrr,
        overage_revenue_this_month: overageRevenue,
        total_revenue_this_month: totalRevenue,
        top_users_by_usage: topUsers.map((user) => ({
          eco_id: user.eco_id,
          api_calls: toNumber(user.api_calls),
          plan: user.plan,
        })),
        timestamp: now.toISOString(),
      },
    });
  } catch (error) {
    console.error('[admin/analytics/overview] failed to load overview', error);
    return NextResponse.json({ success: false, message: 'Failed to load admin analytics overview.' }, { status: 500 });
  }
}
