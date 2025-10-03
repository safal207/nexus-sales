import type { User } from '@prisma/client';

import { createJsonRequest, createMockNextRequest, readJsonResponse } from '../test-utils/api';

const users = new Map<string, User>();
const products: Array<{ id: number; userId: number; name: string; description: string | null; price: number; createdAt: Date; updatedAt: Date }> = [];
let userIdCounter = 0;
let productIdCounter = 0;
const jwtStore = new Map<string, { id: number; email: string }>();

jest.mock('@/lib/db/repositories/UserRepository', () => ({
  userRepository: {
    findByEmail: jest.fn(async (email: string) => users.get(email) ?? null),
    create: jest.fn(async (data: { email: string; password: string }) => {
      const user: User = {
        id: ++userIdCounter,
        email: data.email,
        password: data.password,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      users.set(user.email, user);
      return user;
    }),
  },
}));

jest.mock('@/lib/db/repositories/ProductRepository', () => ({
  productRepository: {
    findByUserId: jest.fn(async (userId: number) => products.filter((product) => product.userId === userId)),
    findById: jest.fn(),
    create: jest.fn(async (data: { name: string; description?: string | null; price: number; user: { connect: { id: number } } }) => {
      const product = {
        id: ++productIdCounter,
        userId: data.user.connect.id,
        name: data.name,
        description: data.description ?? null,
        price: data.price,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      products.push(product);
      return product;
    }),
  },
}));

jest.mock('bcrypt', () => ({
  hash: jest.fn(async (password: string) => `hashed:${password}`),
  compare: jest.fn(async (password: string, stored: string) => stored === `hashed:${password}`),
  hashSync: jest.fn((value: string) => `hashed:${value}`),
}));

jest.mock('jose', () => ({
  SignJWT: jest.fn().mockImplementation((payload: { id: number; email: string }) => ({
    setProtectedHeader: jest.fn().mockReturnThis(),
    setIssuedAt: jest.fn().mockReturnThis(),
    setExpirationTime: jest.fn().mockReturnThis(),
    sign: jest.fn().mockImplementation(async () => {
      const token = `token-${payload.id}`;
      jwtStore.set(token, payload);
      return token;
    }),
  })),
  jwtVerify: jest.fn(async (token: string) => {
    const payload = jwtStore.get(token);
    if (!payload) {
      throw new Error('invalid token');
    }
    return { payload };
  }),
}));

describe('User Journey Integration', () => {
  beforeEach(() => {
    users.clear();
    products.length = 0;
    jwtStore.clear();
    userIdCounter = 0;
    productIdCounter = 0;
  });

  it('registers, logs in, creates a product, and submits an order', async () => {
    const registerModule = await import('@/app/api/auth/register/route');

    const registerResponse = await registerModule.POST(
      createJsonRequest({ method: 'POST', body: { email: 'flow@example.com', password: 'securepass' } }),
    );
    const registerPayload = await readJsonResponse(registerResponse);

    expect(registerPayload.status).toBe(201);
    expect(registerPayload.body.success).toBe(true);
    expect(users.has('flow@example.com')).toBe(true);

    const loginModule = await import('@/app/api/auth/login/route');
    const loginResponse = await loginModule.POST(
      createJsonRequest({ method: 'POST', body: { email: 'flow@example.com', password: 'securepass' } }),
    );
    const loginPayload = await readJsonResponse(loginResponse);

    expect(loginPayload.status).toBe(200);
    const authToken = loginPayload.cookies.token;
    expect(authToken).toMatch(/^token-/);

    const productsModule = await import('@/app/api/products/route');
    const productResponse = await productsModule.POST(
      createMockNextRequest({
        method: 'POST',
        cookies: { token: authToken },
        body: { name: 'Integration Product', price: 4200, description: 'Flow product' },
      }),
    );
    const productPayload = await readJsonResponse(productResponse);

    expect(productPayload.status).toBe(201);
    expect(productPayload.body.product.name).toBe('Integration Product');

    const { products: productMap } = await import('@/app/api/auth/lib/db');
    productMap.set(productPayload.body.product.id, {
      id: productPayload.body.product.id,
      userId: productPayload.body.product.userId,
      name: productPayload.body.product.name,
      description: productPayload.body.product.description ?? '',
      price: productPayload.body.product.price,
    });

    const ordersModule = await import('@/app/api/public/orders/route');
    const orderResponse = await ordersModule.POST(
      createMockNextRequest({
        method: 'POST',
        headers: { 'x-forwarded-for': '10.0.0.2' },
        body: {
          productId: productPayload.body.product.id,
          email: 'buyer@example.com',
          name: 'Buyer',
        },
      }),
    );
    const orderPayload = await readJsonResponse(orderResponse);

    expect(orderPayload.status).toBe(201);
    expect(orderPayload.body.order.amount).toBe(4200);
    expect(orderPayload.body.order.productId).toBe(productPayload.body.product.id);
  });
});
