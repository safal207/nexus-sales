import { test, expect } from '@playwright/test';

test.describe('Checkout Flow', () => {
  test('should complete checkout process', async ({ page }) => {
    // Go to product page
    await page.goto('/checkout/1');

    // Fill checkout form
    await page.fill('input[name="email"]', 'buyer@example.com');
    await page.fill('input[name="name"]', 'John Doe');

    // Submit order
    await page.click('button:has-text("Buy Now")');

    // Should redirect to success page
    await expect(page).toHaveURL(/\/checkout\/1\/success/);

    // Should show success message
    await expect(page.locator('text=Payment successful')).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/checkout/1');

    // Try to submit without filling
    await page.click('button:has-text("Buy Now")');

    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
  });
});