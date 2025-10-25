import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import type { UsageContext, UsageSnapshot } from './types.js';
import type { UsageTracker } from './usage-tracker.js';

export type UsageRequestHandler = (req: NextRequest) => Promise<NextResponse>;

export interface UsageMiddlewareOptions {
  tracker?: UsageTracker;
  failOpen?: boolean;
}

let sharedTracker: UsageTracker | null = null;

export function configureUsageTracker(tracker: UsageTracker): void {
  sharedTracker = tracker;
}

export function getConfiguredUsageTracker(): UsageTracker {
  if (!sharedTracker) {
    throw new Error('Usage tracker has not been configured. Call configureUsageTracker first or pass a tracker in options.');
  }

  return sharedTracker;
}

export function createUsageTrackingMiddleware(
  tracker: UsageTracker,
  defaultOptions: Omit<UsageMiddlewareOptions, 'tracker'> = {},
) {
  return async function withUsageTrackingFactory(
    req: NextRequest,
    context: UsageContext,
    handler: UsageRequestHandler,
    options: Omit<UsageMiddlewareOptions, 'tracker'> = {},
  ): Promise<NextResponse> {
    return withUsageTracking(req, context, handler, {
      tracker,
      ...defaultOptions,
      ...options,
    });
  };
}

export async function withUsageTracking(
  req: NextRequest,
  context: UsageContext,
  handler: UsageRequestHandler,
  options: UsageMiddlewareOptions = {},
): Promise<NextResponse> {
  const tracker = options.tracker ?? sharedTracker;

  if (!tracker) {
    throw new Error('Usage tracker has not been configured.');
  }

  if (!context?.ecoId) {
    console.warn('[UsageTracker] Missing ecoId in context. Skipping usage tracking for this request.');
    return handler(req);
  }

  const failOpen = options.failOpen ?? true;
  const startedAt = Date.now();
  const ecoId = context.ecoId;

  let limitSnapshot: UsageSnapshot | null = null;
  let limitExceeded = false;

  try {
    const result = await tracker.checkLimit(ecoId);
    limitSnapshot = result.snapshot;
    limitExceeded = result.exceeded;
  } catch (error) {
    if (!failOpen) {
      throw error;
    }

    console.error('[UsageTracker] Failed to evaluate usage limit. Allowing request because failOpen=true.', error);
  }

  if (limitExceeded && limitSnapshot && limitSnapshot.limit >= 0) {
    if (limitSnapshot.plan === 'free') {
      const response = NextResponse.json(
        {
          error: 'API limit exceeded',
          message: `You have exceeded your ${limitSnapshot.limit} API calls per month limit`,
          current_usage: limitSnapshot.apiCalls,
          limit: limitSnapshot.limit,
          period_end: limitSnapshot.periodEnd.toISOString(),
          upgrade_url: '/dashboard/billing',
        },
        { status: 429 },
      );

      await recordUsage(tracker, req, context, 429, startedAt);
      applyRateLimitHeaders(response, limitSnapshot);
      return response;
    }

    console.warn(
      `[UsageTracker] ecoId=${ecoId} exceeded plan limit (${limitSnapshot.apiCalls}/${limitSnapshot.limit}) but request allowed (plan=${limitSnapshot.plan}).`,
    );
  }

  let response: NextResponse;

  try {
    response = await handler(req);
  } catch (error) {
    await recordUsage(tracker, req, context, 500, startedAt);
    throw error;
  }

  await recordUsage(tracker, req, context, response.status, startedAt);

  try {
    const updatedSnapshot = await tracker.getCurrentUsage(ecoId);
    applyRateLimitHeaders(response, updatedSnapshot);
  } catch (error) {
    if (!failOpen) {
      throw error;
    }

    console.error('[UsageTracker] Failed to load updated usage snapshot after handler.', error);
  }

  return response;
}

async function recordUsage(
  tracker: UsageTracker,
  req: NextRequest,
  context: UsageContext,
  statusCode: number,
  startedAt: number,
): Promise<void> {
  try {
    await tracker.track({
      ecoId: context.ecoId,
      endpoint: getRequestPath(req),
      method: req.method,
      timestamp: new Date(),
      responseTimeMs: Math.max(0, Date.now() - startedAt),
      statusCode,
      apiKeyId: context.apiKeyId,
      userAgent: req.headers.get('user-agent') ?? undefined,
      ipAddress: extractClientIp(req),
    });
  } catch (error) {
    console.error('[UsageTracker] Failed to enqueue usage record.', error);
  }
}

function getRequestPath(req: NextRequest): string {
  if (req.nextUrl) {
    return req.nextUrl.pathname;
  }

  try {
    const url = new URL(req.url);
    return url.pathname;
  } catch {
    return req.url;
  }
}

function extractClientIp(req: NextRequest): string | undefined {
  if (req.ip) {
    return req.ip;
  }

  const forwarded = req.headers.get('x-forwarded-for');
  if (!forwarded) {
    return undefined;
  }

  return forwarded.split(',')[0]?.trim();
}

function applyRateLimitHeaders(response: NextResponse, snapshot: UsageSnapshot): void {
  const limitHeader = snapshot.limit < 0 ? 'unlimited' : snapshot.limit.toString();
  const remainingHeader = snapshot.limit < 0
    ? 'unlimited'
    : Math.max(0, snapshot.limit - snapshot.apiCalls).toString();

  response.headers.set('X-RateLimit-Limit', limitHeader);
  response.headers.set('X-RateLimit-Remaining', remainingHeader);
  response.headers.set('X-RateLimit-Reset', snapshot.periodEnd.toISOString());
  response.headers.set('X-Usage-Plan', snapshot.plan);
}
