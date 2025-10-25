export type UsagePlan = 'free' | 'pro' | 'enterprise' | string;

export interface UsageRecord {
  ecoId: string;
  endpoint: string;
  method: string;
  timestamp: Date;
  responseTimeMs: number;
  statusCode: number;
  apiKeyId?: string;
  userAgent?: string;
  ipAddress?: string;
}

export interface UsageSnapshot {
  ecoId: string;
  plan: UsagePlan;
  limit: number;
  apiCalls: number;
  overageCalls: number;
  periodStart: Date;
  periodEnd: Date;
}

export interface UsageTrackerOptions {
  batchSize?: number;
  flushIntervalMs?: number;
  maxQueueSize?: number;
  autoStart?: boolean;
  logger?: {
    error: (message: string, error: unknown) => void;
    warn?: (message: string) => void;
    info?: (message: string) => void;
  };
}

export interface UsageContext {
  ecoId: string;
  apiKeyId?: string;
}

export interface UsageLimitCheckResult {
  exceeded: boolean;
  snapshot: UsageSnapshot;
}

export interface UsageTrackerDiagnostics {
  queueSize: number;
  lastFlushAt?: Date;
  flushInFlight: boolean;
}
