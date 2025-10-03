import type { NextResponse } from 'next/server';

import { createMockNextRequest, readJsonResponse } from '../test-utils/api';

describe('POST /api/public/orders', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  async function load() {
    const module = await import('@/app/api/public/orders/route');
    const db = await import('@/app/api/auth/lib/db');
    db.orders.clear();
    return { POST: module.POST, products: db.products, orders: db.orders };
  }

  it('rejects invalid payloads', async () => {
    const { POST } = await load();
    const request = createMockNextRequest({ method: 'POST', body: { email: '' } });

    const response = await POST(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(400);
    expect(payload.body).toEqual({ success: false, message: 'Product ID and email are required.' });
  });

  it('returns 404 when product is missing', async () => {
    const { POST, products } = await load();
    products.clear();

    const request = createMockNextRequest({
      method: 'POST',
      body: { productId: 123, email: 'user@example.com', name: 'User' },
    });

    const response = await POST(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(404);
    expect(payload.body).toEqual({ success: false, message: 'Product not found.' });
  });

  it('creates an order when payload is valid', async () => {
    const { POST, orders } = await load();

    const request = createMockNextRequest({
      method: 'POST',
      body: { productId: 1, email: 'buyer@example.com', name: 'Buyer' },
      headers: { 'x-forwarded-for': '10.0.0.1' },
    });

    const response = await POST(request);
    const payload = await readJsonResponse<{ success: boolean; order: { productId: number; email: string } }>(response as NextResponse);

    expect(payload.status).toBe(201);
    expect(payload.body.success).toBe(true);
    expect(payload.body.order.email).toBe('buyer@example.com');
    expect(Array.from(orders.values()).length).toBe(1);
  });

  it('rate limits repeated requests from same IP', async () => {
    const { POST } = await load();

    for (let attempt = 0; attempt < 10; attempt += 1) {
      const request = createMockNextRequest({
        method: 'POST',
        body: { productId: 1, email: `user${attempt}@example.com`, name: 'User' },
        headers: { 'x-forwarded-for': '192.168.0.1' },
      });
      const response = await POST(request);
      const payload = await readJsonResponse(response as NextResponse);
      expect(payload.status).toBe(201);
    }

    const limitedRequest = createMockNextRequest({
      method: 'POST',
      body: { productId: 1, email: 'limited@example.com', name: 'User' },
      headers: { 'x-forwarded-for': '192.168.0.1' },
    });

    const limitedResponse = await POST(limitedRequest);
    const limitedPayload = await readJsonResponse(limitedResponse as NextResponse);

    expect(limitedPayload.status).toBe(429);
    expect(limitedPayload.body).toEqual({ success: false, message: 'Too many requests' });
  });

  it('handles invalid JSON bodies gracefully', async () => {
    const { POST } = await load();
    const request = createMockNextRequest({ method: 'POST' });
    Object.defineProperty(request, 'json', {
      configurable: true,
      writable: true,
      value: jest.fn(async () => {
        throw new Error('invalid json');
      }),
    });

    const response = await POST(request);
    const payload = await readJsonResponse(response as NextResponse);

    expect(payload.status).toBe(400);
    expect(payload.body).toEqual({ success: false, message: 'Invalid request body.' });
  });
});
