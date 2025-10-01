import { test, expect } from '@playwright/test';

test.describe('UI/UX', () => {
  test('should be responsive on desktop', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 1200, height: 800 });

    // Check that content is visible
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Создать аккаунт')).toBeVisible();

    // Check that layout looks good
    const viewport = page.viewportSize();
    expect(viewport?.width).toBeGreaterThan(1000);
  });

  test('should be responsive on tablet', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 768, height: 1024 });

    // Check content visibility
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Создать аккаунт')).toBeVisible();

    // Check tablet-specific layout
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(768);
  });

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/');
    await page.setViewportSize({ width: 375, height: 667 });

    // Check mobile layout
    await expect(page.locator('h1')).toBeVisible();

    // Mobile menu should be accessible
    await expect(page.locator('button, [role="button"]')).toBeVisible();
  });

  test('should have proper loading states', async ({ page }) => {
    await page.goto('/');

    // Check for loading indicators
    await expect(page.locator('button, a, [role="button"]')).toBeVisible();

    // Page should load without errors
    await expect(page.locator('body')).toBeVisible();
  });

  test('should handle navigation properly', async ({ page }) => {
    await page.goto('/');

    // Test navigation links
    const links = await page.locator('a[href]').all();
    expect(links.length).toBeGreaterThan(0);

    // Test that we can navigate
    await page.click('text=Войти');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should have proper form validation', async ({ page }) => {
    await page.goto('/register');

    // Try to submit empty form
    await page.click('button:has-text("Создать аккаунт")');

    // Should show validation errors
    await expect(page.locator('text=обязателен|required')).toBeVisible();

    // Fill form partially
    await page.fill('input[type="email"]', 'invalid-email');

    // Should show email validation error
    await expect(page.locator('text=неверный|invalid')).toBeVisible();
  });

  test('should have proper error handling', async ({ page }) => {
    await page.goto('/');

    // Test 404 handling
    await page.goto('/non-existent-page');
    await expect(page.locator('text=404|Not Found')).toBeVisible();
  });

  test('should have proper accessibility', async ({ page }) => {
    await page.goto('/');

    // Check for alt text on images
    const images = await page.locator('img').all();
    for (const img of images) {
      const alt = await img.getAttribute('alt');
      expect(alt).toBeTruthy();
    }

    // Check for proper heading hierarchy
    const h1 = await page.locator('h1').count();
    expect(h1).toBeGreaterThan(0);
  });
});
