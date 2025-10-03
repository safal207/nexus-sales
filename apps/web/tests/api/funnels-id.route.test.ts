import type { NextResponse } from 'next/server';

import { createMockNextRequest, readJsonResponse } from '../test-utils/api';

describe('/api/funnels/[id] route', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('returns 404 when funnel is missing on PUT', async () => {
    const module = await import('@/app/api/funnels/[id]/route');
    const request = createMockNextRequest({ method: 'PUT', body: { name: 'Updated' } });

    const response = await module.PUT(request, { params: Promise.resolve({ id: 'missing' }) });
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(404);
    expect(payload.body).toEqual({ error: 'Funnel not found' });
  });

  it('updates funnel when entry exists', async () => {
    const module = await import('@/app/api/funnels/[id]/route');
    const hasSpy = jest.spyOn(Map.prototype, 'has').mockReturnValue(true);
    const originalSet = Map.prototype.set;
    const setSpy = jest.spyOn(Map.prototype, 'set').mockImplementation(function (this: Map<unknown, unknown>, key, value) {
      return originalSet.call(this, key, value);
    });

    const request = createMockNextRequest({
      method: 'PUT',
      body: {
        name: 'Updated Funnel',
        steps: [],
        settings: { theme: 'light', primaryColor: '#fff' },
        analytics: { views: 0, conversions: 0, createdAt: new Date() },
      },
    });

    const response = await module.PUT(request, { params: Promise.resolve({ id: 'funnel-1' }) });
    const payload = await readJsonResponse<{ success: boolean; funnel: { name: string } }>(response as NextResponse);

    expect(payload.status).toBe(200);
    expect(payload.body.success).toBe(true);
    expect(payload.body.funnel.name).toBe('Updated Funnel');
    expect(setSpy).toHaveBeenCalled();

    hasSpy.mockRestore();
    setSpy.mockRestore();
  });

  it('returns 404 when deleting missing funnel', async () => {
    const module = await import('@/app/api/funnels/[id]/route');
    const request = createMockNextRequest({ method: 'DELETE' });

    const response = await module.DELETE(request, { params: Promise.resolve({ id: 'missing' }) });
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(404);
    expect(payload.body).toEqual({ error: 'Funnel not found' });
  });

  it('deletes funnel when entry exists', async () => {
    const module = await import('@/app/api/funnels/[id]/route');
    const hasSpy = jest.spyOn(Map.prototype, 'has').mockReturnValue(true);
    const deleteSpy = jest.spyOn(Map.prototype, 'delete').mockReturnValue(true);

    const request = createMockNextRequest({ method: 'DELETE' });
    const response = await module.DELETE(request, { params: Promise.resolve({ id: 'funnel-123' }) });
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(200);
    expect(payload.body).toEqual({ success: true, message: 'Funnel deleted successfully' });
    expect(deleteSpy).toHaveBeenCalledWith('funnel-123');

    hasSpy.mockRestore();
    deleteSpy.mockRestore();
  });

  it('handles errors while updating funnel', async () => {
    const module = await import('@/app/api/funnels/[id]/route');
    const hasSpy = jest.spyOn(Map.prototype, 'has').mockReturnValue(true);
    const request = createMockNextRequest({ method: 'PUT' });
    Object.defineProperty(request, 'json', {
      configurable: true,
      writable: true,
      value: jest.fn(async () => {
        throw new Error('bad json');
      }),
    });

    const response = await module.PUT(request, { params: Promise.resolve({ id: 'funnel-err' }) });
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(500);
    expect(payload.body).toEqual({ error: 'Failed to update funnel' });

    hasSpy.mockRestore();
  });
});
