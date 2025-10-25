import { Prisma, PrismaClient } from '@prisma/client';
import { UsageRepositoryError } from './errors.js';
import type { UsagePlan, UsageRecord, UsageSnapshot } from './types.js';

export interface UsageRepository {
  saveBatch(records: UsageRecord[]): Promise<void>;
  incrementUsage(countsByEcoId: Record<string, number>): Promise<void>;
  getCurrentUsage(ecoId: string): Promise<UsageSnapshot | null>;
}

const DEFAULT_PLAN_LIMITS: Record<string, number> = {
  free: 1000,
  pro: 100000,
  enterprise: -1,
};

const FALLBACK_PERIOD_DAYS = 30;

export class PrismaUsageRepository implements UsageRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async saveBatch(records: UsageRecord[]): Promise<void> {
    if (records.length === 0) {
      return;
    }

    try {
      const rows = records.map((record) =>
        Prisma.sql`(${record.ecoId}, ${record.endpoint}, ${record.method}, ${record.timestamp}, ${record.responseTimeMs}, ${record.statusCode}, ${record.apiKeyId ?? null}, ${record.userAgent ?? null}, ${record.ipAddress ?? null})`,
      );

      await this.prisma.$executeRaw(
        Prisma.sql`
          INSERT INTO eco_api_usage (
            eco_id,
            endpoint,
            method,
            timestamp,
            response_time_ms,
            status_code,
            api_key_id,
            user_agent,
            ip_address
          ) VALUES ${Prisma.join(rows)}
        `,
      );
    } catch (error) {
      throw new UsageRepositoryError('Failed to persist usage batch', { cause: error });
    }
  }

  async incrementUsage(countsByEcoId: Record<string, number>): Promise<void> {
    const entries = Object.entries(countsByEcoId);
    if (entries.length === 0) {
      return;
    }

    try {
      await Promise.all(
        entries.map(([ecoId, count]) =>
          this.prisma.$executeRaw`SELECT increment_api_calls(${ecoId}::text, ${count}::int);`,
        ),
      );
    } catch (error) {
      throw new UsageRepositoryError('Failed to increment usage counters', { cause: error });
    }
  }

  async getCurrentUsage(ecoId: string): Promise<UsageSnapshot | null> {
    try {
      const subscriptions = await this.prisma.$queryRaw<Array<{
        plan: string;
        current_period_start: Date;
        current_period_end: Date;
      }>>`
        SELECT plan, current_period_start, current_period_end
        FROM eco_subscriptions
        WHERE eco_id = ${ecoId}
        ORDER BY current_period_start DESC
        LIMIT 1;
      `;

      const subscription = subscriptions[0];

      const plan = subscription?.plan ?? 'free';
      const periodStart = subscription?.current_period_start ?? this.defaultPeriodStart();
      const periodEnd = subscription?.current_period_end ?? this.defaultPeriodEnd(periodStart);

      const usageRows = await this.prisma.$queryRaw<Array<{
        api_calls: number;
        overage_calls: number;
      }>>`
        SELECT api_calls, overage_calls
        FROM eco_usage_records
        WHERE eco_id = ${ecoId}
          AND billing_period_start = ${periodStart}
        LIMIT 1;
      `;

      const usage = usageRows[0];

      return {
        ecoId,
        plan,
        limit: resolvePlanLimit(plan),
        apiCalls: usage?.api_calls ?? 0,
        overageCalls: usage?.overage_calls ?? 0,
        periodStart,
        periodEnd,
      };
    } catch (error) {
      throw new UsageRepositoryError('Failed to fetch current usage snapshot', { cause: error });
    }
  }

  private defaultPeriodStart(): Date {
    const start = new Date();
    start.setUTCDate(start.getUTCDate() - FALLBACK_PERIOD_DAYS);
    return start;
  }

  private defaultPeriodEnd(start: Date): Date {
    const end = new Date(start);
    end.setUTCDate(end.getUTCDate() + FALLBACK_PERIOD_DAYS);
    return end;
  }
}

export function resolvePlanLimit(plan: UsagePlan): number {
  return DEFAULT_PLAN_LIMITS[plan] ?? DEFAULT_PLAN_LIMITS.pro;
}
