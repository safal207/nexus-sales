import { test, expect } from '@playwright/test';

test.describe('API Integration', () => {
  test('should have working health endpoint', async ({ request }) => {
    const response = await request.get('/api/health');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('status');
  });

  test('should have working products endpoint', async ({ request }) => {
    const response = await request.get('/api/products');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(Array.isArray(data)).toBeTruthy();
  });

  test('should handle authentication endpoints', async ({ request }) => {
    // Test login
    const loginResponse = await request.post('/api/auth/login', {
      data: {
        email: 'test@test.com',
        password: 'password123'
      }
    });
    expect(loginResponse.ok()).toBeTruthy();

    const loginData = await loginResponse.json();
    expect(loginData).toHaveProperty('success');

    // Test register
    const registerResponse = await request.post('/api/auth/register', {
      data: {
        email: `test_${Date.now()}@example.com`,
        password: 'password123'
      }
    });
    expect(registerResponse.status()).toBe(201);

    const registerData = await registerResponse.json();
    expect(registerData).toHaveProperty('success');

    // Test forgot password
    const forgotResponse = await request.post('/api/auth/forgot-password', {
      data: {
        email: 'test@example.com'
      }
    });
    expect(forgotResponse.ok()).toBeTruthy();
  });

  test('should handle product creation', async ({ request }) => {
    const productData = {
      name: 'Test Product',
      description: 'Test product description',
      price: 29.99,
      category: 'test'
    };

    const response = await request.post('/api/products', {
      data: productData
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(201);

    const data = await response.json();
    expect(data).toHaveProperty('id');
    expect(data.name).toBe(productData.name);
  });

  test('should handle emotion tracking', async ({ request }) => {
    const emotionData = {
      type: 'joy',
      intensity: 0.8,
      confidence: 0.9,
      metadata: {
        userId: 'test-user',
        sessionId: 'test-session'
      }
    };

    const response = await request.post('/api/emotions/track', {
      data: emotionData
    });

    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('id');
  });

  test('should handle analytics insights', async ({ request }) => {
    const response = await request.get('/api/analytics/insights');
    expect(response.ok()).toBeTruthy();
    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('insights');
  });
});
