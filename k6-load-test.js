import http from 'k6/http';
import { check, sleep } from 'k6';

// Test configuration
export const options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up to 100 users over 2 minutes
    { duration: '5m', target: 100 }, // Stay at 100 users for 5 minutes
    { duration: '2m', target: 200 }, // Ramp up to 200 users over 2 minutes
    { duration: '5m', target: 200 }, // Stay at 200 users for 5 minutes
    { duration: '2m', target: 0 },   // Ramp down to 0 users over 2 minutes
  ],
  thresholds: {
    http_req_duration: ['p(99)<1500'], // 99% of requests should be below 1.5s
    http_req_failed: ['rate<0.1'],    // Error rate should be below 10%
  },
};

const BASE_URL = 'http://localhost:3000';

export default function () {
  // Test health check endpoint
  const healthResponse = http.get(`${BASE_URL}/api/health`);
  check(healthResponse, {
    'health check status is 200': (r) => r.status === 200,
    'health check response time < 500ms': (r) => r.timings.duration < 500,
  });

  // Test products API (requires authentication in real scenario)
  const productsResponse = http.get(`${BASE_URL}/api/products`);
  check(productsResponse, {
    'products API responds': (r) => r.status === 200 || r.status === 401, // 401 is expected without auth
    'products API response time < 1000ms': (r) => r.timings.duration < 1000,
  });

  // Test public orders endpoint
  const ordersData = {
    productId: 1,
    email: `test${__VU}@example.com`,
    name: `Test User ${__VU}`,
  };

  const ordersResponse = http.post(
    `${BASE_URL}/api/public/orders`,
    JSON.stringify(ordersData),
    {
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  check(ordersResponse, {
    'orders API status is 201 or 400': (r) => r.status === 201 || r.status === 400,
    'orders API response time < 2000ms': (r) => r.timings.duration < 2000,
  });

  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}
