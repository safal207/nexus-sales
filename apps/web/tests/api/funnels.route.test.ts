import type { NextResponse } from 'next/server';

import { createMockNextRequest, readJsonResponse } from '../test-utils/api';

describe('/api/funnels route', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('creates a funnel when name is provided', async () => {
    const module = await import('@/app/api/funnels/route');
    const request = createMockNextRequest({ method: 'POST', body: { name: 'Launch Funnel' } });
    const response = await module.POST(request);
    const payload = await readJsonResponse<{ success: boolean; funnel: { id: string; name: string } }>(response as NextResponse);

    expect(payload.status).toBe(201);
    expect(payload.body.success).toBe(true);
    expect(payload.body.funnel.name).toBe('Launch Funnel');
    expect(payload.body.funnel.id).toMatch(/^funnel_/);
  });

  it('validates missing name on create', async () => {
    const module = await import('@/app/api/funnels/route');
    const request = createMockNextRequest({ method: 'POST', body: {} });

    const response = await module.POST(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(400);
    expect(payload.body).toEqual({ error: 'Name is required' });
  });

  it('returns funnel by id when present', async () => {
    const module = await import('@/app/api/funnels/route');
    const createRequest = createMockNextRequest({ method: 'POST', body: { name: 'My Funnel' } });
    const createResponse = await module.POST(createRequest);
    const created = await readJsonResponse<{ funnel: { id: string } }>(createResponse as NextResponse);

    const getRequest = createMockNextRequest({
      method: 'GET',
      url: `http://localhost/api/funnels?id=${created.body.funnel.id}`,
    });
    const getResponse = await module.GET(getRequest);
    const payload = await readJsonResponse<{ funnel: { id: string } }>(getResponse as NextResponse);

    expect(payload.status).toBe(200);
    expect(payload.body.funnel.id).toBe(created.body.funnel.id);
  });

  it('returns list of funnels when id absent', async () => {
    const module = await import('@/app/api/funnels/route');
    await module.POST(createMockNextRequest({ method: 'POST', body: { name: 'Funnel A' } }));
    await module.POST(createMockNextRequest({ method: 'POST', body: { name: 'Funnel B' } }));

    const listResponse = await module.GET(createMockNextRequest({ method: 'GET' }));
    const payload = await readJsonResponse<{ funnels: Array<{ name: string }> }>(listResponse as NextResponse);

    expect(payload.status).toBe(200);
    expect(payload.body.funnels.length).toBeGreaterThanOrEqual(2);
    expect(payload.body.funnels.map((f) => f.name)).toEqual(expect.arrayContaining(['Funnel A', 'Funnel B']));
  });

  it('returns 404 for missing funnel id', async () => {
    const module = await import('@/app/api/funnels/route');
    const request = createMockNextRequest({
      method: 'GET',
      url: 'http://localhost/api/funnels?id=missing',
    });

    const response = await module.GET(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(404);
    expect(payload.body).toEqual({ error: 'Funnel not found' });
  });

  it('handles JSON parsing errors when creating funnels', async () => {
    const module = await import('@/app/api/funnels/route');
    const request = createMockNextRequest({ method: 'POST' });
    Object.defineProperty(request, 'json', {
      configurable: true,
      writable: true,
      value: jest.fn(async () => {
        throw new Error('boom');
      }),
    });

    const response = await module.POST(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(500);
    expect(payload.body).toEqual({ error: 'Failed to create funnel' });
  });
});
