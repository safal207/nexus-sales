import type { NextResponse } from 'next/server';

import { createMockNextRequest, readJsonResponse } from '../test-utils/api';

const verifyAuth = jest.fn();

jest.mock('@/app/api/auth/lib/middleware', () => ({
  verifyAuth,
}));

describe('API /api/products/[id] route', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  async function loadRoute() {
    const route = await import('@/app/api/products/[id]/route');
    const db = await import('@/app/api/auth/lib/db');
    return { route, db };
  }

  it('returns 400 when product id is invalid', async () => {
    const { route } = await loadRoute();
    const request = createMockNextRequest({ method: 'GET' });

    const response = await route.GET(request, { params: Promise.resolve({ id: 'abc' }) });
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(400);
    expect(payload.body).toEqual({ success: false, message: 'Invalid product id.' });
    expect(verifyAuth).not.toHaveBeenCalled();
  });

  it('enforces authentication on GET', async () => {
    const { route } = await loadRoute();
    verifyAuth.mockResolvedValue({ ok: false, error: 'Missing token', status: 401 });

    const request = createMockNextRequest({ method: 'GET' });
    const response = await route.GET(request, { params: Promise.resolve({ id: '1' }) });
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(401);
    expect(payload.body).toEqual({ success: false, message: 'Missing token' });
  });

  it('returns product when owned by user', async () => {
    const { route, db } = await loadRoute();
    verifyAuth.mockResolvedValue({ ok: true, user: { id: 1 }, status: 200 });

    const request = createMockNextRequest({ method: 'GET' });
    const response = await route.GET(request, { params: Promise.resolve({ id: '1' }) });
    const payload = await readJsonResponse<{ success: boolean; product: unknown }>(response as NextResponse);

    expect(payload.status).toBe(200);
    expect(payload.body.success).toBe(true);
    expect(payload.body.product).toEqual(db.products.get(1));
  });

  it('fails GET when product belongs to another user', async () => {
    const { route, db } = await loadRoute();
    const product = db.products.get(1);
    if (!product) {
      throw new Error('Seed product missing');
    }
    product.userId = 999;

    verifyAuth.mockResolvedValue({ ok: true, user: { id: 1 }, status: 200 });

    const request = createMockNextRequest({ method: 'GET' });
    const response = await route.GET(request, { params: Promise.resolve({ id: '1' }) });
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(404);
    expect(payload.body).toEqual({ success: false, message: 'Product not found.' });
  });

  it('validates payload on PUT', async () => {
    const { route } = await loadRoute();
    verifyAuth.mockResolvedValue({ ok: true, user: { id: 1 }, status: 200 });

    const request = createMockNextRequest({ method: 'PUT', body: { price: 'invalid' } });
    const response = await route.PUT(request, { params: Promise.resolve({ id: '1' }) });
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(400);
    expect(payload.body).toEqual({ success: false, message: 'Invalid request body.' });
  });

  it('updates product data with PUT', async () => {
    const { route, db } = await loadRoute();
    verifyAuth.mockResolvedValue({ ok: true, user: { id: 1 }, status: 200 });

    const request = createMockNextRequest({
      method: 'PUT',
      body: { name: 'Updated', price: 1234 },
    });

    const response = await route.PUT(request, { params: Promise.resolve({ id: '1' }) });
    const payload = await readJsonResponse<{ success: boolean; product: unknown }>(response as NextResponse);

    expect(payload.status).toBe(200);
    expect(payload.body.success).toBe(true);
    expect(payload.body.product).toMatchObject({ name: 'Updated', price: 1234 });
    expect(db.products.get(1)).toMatchObject({ name: 'Updated', price: 1234 });
  });

  it('deletes product for owner', async () => {
    const { route, db } = await loadRoute();
    verifyAuth.mockResolvedValue({ ok: true, user: { id: 1 }, status: 200 });

    const request = createMockNextRequest({ method: 'DELETE' });
    const response = await route.DELETE(request, { params: Promise.resolve({ id: '1' }) });
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(200);
    expect(payload.body).toEqual({ success: true, message: 'Product deleted successfully.' });
    expect(db.products.has(1)).toBe(false);
  });
});
