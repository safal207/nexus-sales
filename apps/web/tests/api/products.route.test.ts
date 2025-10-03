import type { NextResponse } from 'next/server';

import { createMockNextRequest, readJsonResponse } from '../test-utils/api';

const verifyAuth = jest.fn();
const findByUserId = jest.fn();
const createProduct = jest.fn();

jest.mock('@/app/api/auth/lib/middleware', () => ({
  verifyAuth,
}));

jest.mock('@/lib/db/repositories/ProductRepository', () => ({
  productRepository: {
    findByUserId,
    create: createProduct,
    findById: jest.fn(),
  },
}));

describe('API /api/products route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('returns 401 when authentication fails', async () => {
      verifyAuth.mockResolvedValue({ ok: false, error: 'Missing authentication token', status: 401 });
      const request = createMockNextRequest({ method: 'GET' });

      const { GET } = await import('@/app/api/products/route');
      const response = await GET(request);
      const payload = await readJsonResponse(response as NextResponse);

      expect(payload.status).toBe(401);
      expect(payload.body).toEqual({ success: false, message: 'Missing authentication token' });
      expect(findByUserId).not.toHaveBeenCalled();
    });

    it('returns products for authenticated user', async () => {
      verifyAuth.mockResolvedValue({ ok: true, user: { id: 9 }, status: 200 });
      const products = [
        { id: 1, name: 'Course A', price: 5000 },
        { id: 2, name: 'Course B', price: 8000 },
      ];
      findByUserId.mockResolvedValue(products);

      const request = createMockNextRequest({ method: 'GET' });
      const { GET } = await import('@/app/api/products/route');
      const response = await GET(request);
      const payload = await readJsonResponse(response as NextResponse<{ success: boolean; products: unknown[] }>);

      expect(payload.status).toBe(200);
      expect(payload.body.success).toBe(true);
      expect(payload.body.products).toEqual(products);
      expect(findByUserId).toHaveBeenCalledWith(9);
    });
  });

  describe('POST', () => {
    it('returns auth error when verifyAuth fails', async () => {
      verifyAuth.mockResolvedValue({ ok: false, error: 'Invalid token', status: 403 });
      const request = createMockNextRequest({ method: 'POST', body: { name: 'Prod', price: 1000 } });

      const { POST } = await import('@/app/api/products/route');
      const response = await POST(request);
      const payload = await readJsonResponse(response as NextResponse);

      expect(payload.status).toBe(403);
      expect(payload.body.message).toBe('Invalid token');
      expect(createProduct).not.toHaveBeenCalled();
    });

    it('validates payload and returns 400 for missing fields', async () => {
      verifyAuth.mockResolvedValue({ ok: true, user: { id: 4 }, status: 200 });
      const request = createMockNextRequest({ method: 'POST', body: { description: 'No name' } });

      const { POST } = await import('@/app/api/products/route');
      const response = await POST(request);
      const payload = await readJsonResponse(response as NextResponse);

      expect(payload.status).toBe(400);
      expect(payload.body).toEqual({ success: false, message: 'Name and price are required.' });
      expect(createProduct).not.toHaveBeenCalled();
    });

    it('creates product for authenticated user', async () => {
      verifyAuth.mockResolvedValue({ ok: true, user: { id: 11 }, status: 200 });
      const newProduct = { id: 5, name: 'Generated', price: 1500 };
      createProduct.mockResolvedValue(newProduct);

      const request = createMockNextRequest({
        method: 'POST',
        body: { name: 'Generated', price: 1500, description: 'desc' },
      });

      const { POST } = await import('@/app/api/products/route');
      const response = await POST(request);
      const payload = await readJsonResponse<{ success: boolean; product: typeof newProduct }>(response as NextResponse);

      expect(payload.status).toBe(201);
      expect(payload.body.success).toBe(true);
      expect(payload.body.product).toEqual(newProduct);
      expect(createProduct).toHaveBeenCalledWith({
        name: 'Generated',
        description: 'desc',
        price: 1500,
        user: { connect: { id: 11 } },
      });
    });

    it('handles malformed JSON payloads', async () => {
      verifyAuth.mockResolvedValue({ ok: true, user: { id: 2 }, status: 200 });
      const request = createMockNextRequest({ method: 'POST' });
      Object.defineProperty(request, 'json', {
        configurable: true,
        writable: true,
        value: jest.fn(async () => {
          throw new Error('invalid json');
        }),
      });

      const { POST } = await import('@/app/api/products/route');
      const response = await POST(request);
      const payload = await readJsonResponse(response as NextResponse);

      expect(payload.status).toBe(400);
      expect(payload.body).toEqual({ success: false, message: 'Invalid request body.' });
    });
  });
});
