import { test, expect } from '@playwright/test';
import percySnapshot from '@percy/playwright';

test.describe('Visual Regression Tests', () => {
  test('homepage should match baseline', async ({ page }) => {
    await page.goto('/');

    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take visual snapshot
    await percySnapshot(page, 'Homepage');
  });

  test('login page should match baseline', async ({ page }) => {
    await page.goto('/login');

    // Wait for form to load
    await expect(page.locator('input[type="email"]')).toBeVisible();

    await percySnapshot(page, 'Login Page');
  });

  test('register page should match baseline', async ({ page }) => {
    await page.goto('/register');

    // Wait for form to load
    await expect(page.locator('input[type="email"]')).toBeVisible();

    await percySnapshot(page, 'Register Page');
  });

  test('dashboard should match baseline', async ({ page }) => {
    // First login to access dashboard
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for redirect to dashboard
    await page.waitForURL(/dashboard|\/$/);

    // Take snapshot of dashboard
    await percySnapshot(page, 'Dashboard');
  });

  test('mobile homepage should match baseline', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    await percySnapshot(page, 'Homepage - Mobile', {
      widths: [375],
      minHeight: 667,
    });
  });

  test('tablet homepage should match baseline', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    await percySnapshot(page, 'Homepage - Tablet', {
      widths: [768],
      minHeight: 1024,
    });
  });

  test('checkout page should match baseline', async ({ page }) => {
    // Navigate to a product checkout (assuming product ID 1 exists)
    await page.goto('/checkout/1');

    // Wait for checkout form to load
    await page.waitForLoadState('networkidle');

    await percySnapshot(page, 'Checkout Page');
  });

  test('error page should match baseline', async ({ page }) => {
    // Navigate to non-existent page
    await page.goto('/non-existent-page');

    // Wait for error page to load
    await page.waitForLoadState('networkidle');

    await percySnapshot(page, '404 Error Page');
  });

  test('loading states should match baseline', async ({ page }) => {
    await page.goto('/');

    // Force loading state by throttling network
    await page.route('**/api/**', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    // Try to trigger some loading state
    await page.reload();

    await percySnapshot(page, 'Loading State');
  });

  test('hover states should match baseline', async ({ page }) => {
    await page.goto('/');

    // Find a button and hover over it
    const button = page.locator('button').first();
    await button.hover();

    await percySnapshot(page, 'Button Hover State');
  });
});
