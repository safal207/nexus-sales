import { test, expect } from '@playwright/test';

test.describe('Simple Tests', () => {
  test('should load the homepage', async ({ page }) => {
    // Navigate to homepage
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check if page loaded successfully
    await expect(page).toHaveURL(/.*localhost:3000/);

    // Check for basic content
    const bodyContent = await page.textContent('body');
    expect(bodyContent?.length).toBeGreaterThan(100); // Basic content check
  });

  test('should have basic HTML structure', async ({ page }) => {
    await page.goto('/');

    // Check for essential HTML elements
    await expect(page.locator('html')).toBeVisible();
    await expect(page.locator('body')).toBeVisible();

    // Check that page has content
    const bodyContent = await page.textContent('body');
    expect(bodyContent?.length).toBeGreaterThan(0);
  });
});
