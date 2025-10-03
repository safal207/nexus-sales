import type { NextResponse } from 'next/server';

import { createMockNextRequest, readJsonResponse } from '../test-utils/api';

const requireAuth = jest.fn();

jest.mock('@/utils/auth', () => ({
  requireAuth,
}));

describe('GET /api/analytics/insights', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
    delete (globalThis as { __insightsCache?: unknown }).__insightsCache;
  });

  it('returns 401 when user is not authenticated', async () => {
    requireAuth.mockReturnValue(null);
    const module = await import('@/app/api/analytics/insights/route');
    const request = createMockNextRequest({ method: 'GET' });

    const response = await module.GET(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(401);
    expect(payload.body).toEqual({ success: false, message: 'Unauthorized' });
  });

  it('returns analytics insights and caches the response', async () => {
    requireAuth.mockReturnValue({ userId: 99 });
    const module = await import('@/app/api/analytics/insights/route');
    const request = createMockNextRequest({ method: 'GET', headers: { authorization: 'Bearer token' } });

    const randomSpy = jest.spyOn(global.Math, 'random').mockReturnValue(0.42);

    const response = await module.GET(request);
    const payload = await readJsonResponse<{
      success: boolean;
      data: { user_id: number };
      predictions: { next_24h_conversions: number };
    }>(response as NextResponse);

    expect(payload.status).toBe(200);
    expect(payload.body.success).toBe(true);
    expect(payload.body.data.user_id).toBe(99);
    expect(payload.body.predictions.next_24h_conversions).toBeGreaterThanOrEqual(0);

    randomSpy.mockClear();

    const cachedResponse = await module.GET(createMockNextRequest({ method: 'GET', headers: { authorization: 'Bearer token' } }));
    const cachedPayload = await readJsonResponse(cachedResponse as NextResponse);

    expect(cachedPayload.status).toBe(200);
    expect(cachedPayload.body).toEqual(payload.body);
    expect(randomSpy).not.toHaveBeenCalled();

    randomSpy.mockRestore();
  });
});
