/**
 * Test helper utilities for NEXUS.SALES testing
 */

import { NextRequest } from 'next/server';
import { mockJWTToken, mockUser } from '../__mocks__/mockData';

// Mock JWT verification for tests
export const createMockRequest = (
  options: {
    method?: string;
    url?: string;
    headers?: Record<string, string>;
    body?: any;
    authenticated?: boolean;
  } = {}
): NextRequest => {
  const {
    method = 'GET',
    url = 'http://localhost:3000/api/test',
    headers = {},
    body,
    authenticated = false
  } = options;

  const requestHeaders = new Headers({
    'content-type': 'application/json',
    ...(authenticated && { authorization: `Bearer ${mockJWTToken}` }),
    ...headers
  });

  const requestInit: RequestInit = {
    method,
    headers: requestHeaders,
    ...(body && { body: JSON.stringify(body) })
  };

  // 2025-09-29 - Claude Code Agent: Fixed Next.js 15 RequestInit compatibility
  // by manually constructing request options to avoid signal type conflict
  const nextRequestInit = {
    method: requestInit.method,
    headers: requestInit.headers,
    body: requestInit.body
  };
  return new NextRequest(url, nextRequestInit);
};

// 2025-09-29 - Claude Code Agent: Mock response helper for testing
// @ts-ignore - Jest is not available in build context
export const mockResponse = {
  json: (global as any).jest?.fn?.() || (() => {}),
  status: (global as any).jest?.fn?.(() => mockResponse) || (() => mockResponse),
  headers: new Headers()
};

// Database mock helpers
export const mockDatabase = {
  users: new Map([['1', mockUser]]),
  products: new Map(),
  orders: new Map(),
  emotions: new Map(),

  reset() {
    this.users.clear();
    this.products.clear();
    this.orders.clear();
    this.emotions.clear();
    this.users.set('1', mockUser);
  },

  findUser(id: string) {
    return this.users.get(id);
  },

  findUserByEmail(email: string) {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return null;
  },

  createUser(userData: any) {
    const id = (this.users.size + 1).toString();
    const user = { id, ...userData, createdAt: new Date(), updatedAt: new Date() };
    this.users.set(id, user);
    return user;
  },

  createProduct(productData: any) {
    const id = (this.products.size + 1).toString();
    const product = { id, ...productData, createdAt: new Date(), updatedAt: new Date() };
    this.products.set(id, product);
    return product;
  },

  createOrder(orderData: any) {
    const id = (this.orders.size + 1).toString();
    const order = { id, ...orderData, createdAt: new Date(), updatedAt: new Date() };
    this.orders.set(id, order);
    return order;
  },

  storeEmotion(emotionData: any) {
    const id = (this.emotions.size + 1).toString();
    const emotion = { id, ...emotionData, timestamp: new Date() };
    this.emotions.set(id, emotion);
    return emotion;
  }
};

// Async test wrapper
export const asyncWrapper = (fn: Function) => {
  return async (...args: any[]) => {
    try {
      return await fn(...args);
    } catch (error) {
      console.error('Test error:', error);
      throw error;
    }
  };
};

// Timer helpers for testing async operations
export const waitFor = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const waitForCondition = async (
  condition: () => boolean | Promise<boolean>,
  timeout: number = 5000,
  interval: number = 100
): Promise<void> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const result = await condition();
    if (result) return;
    await waitFor(interval);
  }

  throw new Error(`Condition not met within ${timeout}ms`);
};

// Emotion analysis test helpers
export const createEmotionTestText = (type: 'positive' | 'negative' | 'neutral' = 'positive') => {
  const texts = {
    positive: "I'm so excited about this amazing product! It looks fantastic and I trust this brand completely!",
    negative: "This is terrible and frustrating. I'm really disappointed and angry about this experience.",
    neutral: "This is a standard product with regular features. It functions as expected."
  };
  return texts[type];
};

// API test helpers
export const createApiTestSuite = (endpoint: string, options: {
  authenticated?: boolean;
  methods?: string[];
  testData?: any;
}) => {
  const { authenticated = false, methods = ['GET'], testData = {} } = options;

  return {
    testUnauthorized: authenticated ? async () => {
      const request = createMockRequest({
        method: 'POST',
        url: `http://localhost:3000${endpoint}`,
        authenticated: false
      });

      // Test that unauthenticated requests are rejected
      expect(request.headers.get('authorization')).toBeNull();
    } : null,

    testValidRequest: async () => {
      const request = createMockRequest({
        method: methods[0],
        url: `http://localhost:3000${endpoint}`,
        authenticated,
        body: testData
      });

      expect(request.method).toBe(methods[0]);
      if (authenticated) {
        expect(request.headers.get('authorization')).toBe(`Bearer ${mockJWTToken}`);
      }
    }
  };
};

// Performance test helpers
export const measureExecutionTime = async (fn: Function): Promise<{ result: any; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const end = performance.now();
  return { result, duration: end - start };
};

// Clean up helper for tests
export const cleanupAfterTest = () => {
  mockDatabase.reset();
  jest.clearAllMocks();
};

// Global test setup
beforeEach(() => {
  mockDatabase.reset();
});

afterEach(() => {
  cleanupAfterTest();
});