import type { PrismaClient } from '@prisma/client';
import type { UsageRepository } from './repository.js';
import { PrismaUsageRepository } from './repository.js';
import { UsageLimitExceededError } from './errors.js';
import type {
  UsageRecord,
  UsageTrackerOptions,
  UsageLimitCheckResult,
  UsageTrackerDiagnostics,
  UsageSnapshot,
} from './types.js';

const DEFAULT_BATCH_SIZE = 100;
const DEFAULT_FLUSH_INTERVAL_MS = 5_000;
const DEFAULT_MAX_QUEUE_SIZE = 1_000;
const DEFAULT_FREE_LIMIT = 1_000;
const DEFAULT_PERIOD_DAYS = 30;

const DEFAULT_LOGGER = {
  error(message: string, error: unknown) {
    console.error(`[UsageTracker] ${message}`, error);
  },
  warn(message: string) {
    console.warn(`[UsageTracker] ${message}`);
  },
  info(message: string) {
    console.info(`[UsageTracker] ${message}`);
  },
};

class PersistBatchError extends Error {
  constructor(message: string, options: { cause?: unknown; shouldRequeue: boolean }) {
    super(message, options);
    this.name = 'PersistBatchError';
    this.shouldRequeue = options.shouldRequeue;
  }

  readonly shouldRequeue: boolean;
}

export class UsageTracker {
  private readonly batchSize: number;
  private readonly flushIntervalMs: number;
  private readonly maxQueueSize: number;
  private readonly logger = this.options.logger ?? DEFAULT_LOGGER;

  private queue: UsageRecord[] = [];
  private flushPromise: Promise<void> | null = null;
  private timer: NodeJS.Timeout | null = null;
  private lastFlushAt?: Date;

  constructor(
    private readonly repository: UsageRepository,
    private readonly options: UsageTrackerOptions = {},
  ) {
    this.batchSize = Math.max(1, options.batchSize ?? DEFAULT_BATCH_SIZE);
    this.flushIntervalMs = Math.max(100, options.flushIntervalMs ?? DEFAULT_FLUSH_INTERVAL_MS);
    this.maxQueueSize = Math.max(this.batchSize, options.maxQueueSize ?? DEFAULT_MAX_QUEUE_SIZE);

    if (options.autoStart !== false) {
      this.start();
    }
  }

  static createWithPrisma(prisma: PrismaClient, options?: UsageTrackerOptions): UsageTracker {
    return new UsageTracker(new PrismaUsageRepository(prisma), options);
  }

  start(): void {
    if (this.timer) {
      return;
    }

    this.timer = setInterval(() => {
      if (this.queue.length === 0 || this.flushPromise) {
        return;
      }

      void this.flush().catch((error) => {
        this.logger.error('Periodic flush failed', error);
      });
    }, this.flushIntervalMs);

    if (typeof this.timer.unref === 'function') {
      this.timer.unref();
    }
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async shutdown(): Promise<void> {
    this.stop();
    await this.flush();
  }

  getDiagnostics(): UsageTrackerDiagnostics {
    return {
      queueSize: this.queue.length,
      lastFlushAt: this.lastFlushAt,
      flushInFlight: this.flushPromise !== null,
    };
  }

  async track(record: UsageRecord): Promise<void> {
    const normalized: UsageRecord = {
      ...record,
      timestamp: record.timestamp instanceof Date ? record.timestamp : new Date(record.timestamp),
    };

    this.queue.push(normalized);

    if (this.queue.length > this.maxQueueSize) {
      const dropped = this.queue.length - this.maxQueueSize;
      this.queue.splice(0, dropped);
      this.logger.warn(`Dropped ${dropped} usage records because queue exceeded ${this.maxQueueSize}`);
    }

    if (this.queue.length >= this.batchSize) {
      await this.flush();
    }
  }

  async flush(): Promise<void> {
    if (this.flushPromise) {
      return this.flushPromise;
    }

    if (this.queue.length === 0) {
      return Promise.resolve();
    }

    const batch = this.queue;
    this.queue = [];

    this.flushPromise = this.persistBatch(batch)
      .catch((error) => {
        if (error instanceof PersistBatchError && error.shouldRequeue) {
          this.queue = [...batch, ...this.queue];
        }
        throw error;
      })
      .finally(() => {
        this.flushPromise = null;
      });

    return this.flushPromise;
  }

  private async persistBatch(batch: UsageRecord[]): Promise<void> {
    if (batch.length === 0) {
      return;
    }

    try {
      await this.repository.saveBatch(batch);
    } catch (error) {
      this.logger.error('Failed to persist usage batch', error);
      throw new PersistBatchError('Failed to persist usage batch', { cause: error, shouldRequeue: true });
    }

    const counts = batch.reduce<Record<string, number>>((acc, record) => {
      acc[record.ecoId] = (acc[record.ecoId] ?? 0) + 1;
      return acc;
    }, {});

    try {
      await this.repository.incrementUsage(counts);
    } catch (error) {
      this.logger.error('Failed to increment usage counters', error);
      throw new PersistBatchError('Failed to increment usage counters', { cause: error, shouldRequeue: false });
    }

    this.lastFlushAt = new Date();
  }

  async getCurrentUsage(ecoId: string): Promise<UsageSnapshot> {
    const snapshot = await this.repository.getCurrentUsage(ecoId);

    if (!snapshot) {
      const now = new Date();
      return {
        ecoId,
        plan: 'free',
        limit: DEFAULT_FREE_LIMIT,
        apiCalls: 0,
        overageCalls: 0,
        periodStart: now,
        periodEnd: this.addDays(now, DEFAULT_PERIOD_DAYS),
      };
    }

    return snapshot;
  }

  async checkLimit(ecoId: string): Promise<UsageLimitCheckResult> {
    const snapshot = await this.getCurrentUsage(ecoId);

    if (snapshot.limit < 0) {
      return { exceeded: false, snapshot };
    }

    const exceeded = snapshot.apiCalls >= snapshot.limit;
    return { exceeded, snapshot };
  }

  async hasExceededLimit(ecoId: string): Promise<boolean> {
    const { exceeded } = await this.checkLimit(ecoId);
    return exceeded;
  }

  async ensureWithinLimit(ecoId: string): Promise<UsageSnapshot> {
    const result = await this.checkLimit(ecoId);
    if (result.exceeded) {
      throw new UsageLimitExceededError(result.snapshot);
    }

    return result.snapshot;
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date.getTime());
    next.setUTCDate(next.getUTCDate() + days);
    return next;
  }
}
