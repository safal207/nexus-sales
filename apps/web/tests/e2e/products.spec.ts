import { test, expect } from '@playwright/test';

test.describe('Product Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display products list', async ({ page }) => {
    await page.goto('/dashboard/products');

    // Should show products
    await expect(page.locator('text=My First Awesome Course')).toBeVisible();
    await expect(page.locator('text=$49.99')).toBeVisible();
  });

  test('should create new product', async ({ page }) => {
    await page.goto('/dashboard/products/new');

    await page.fill('input[name="name"]', 'Test Product');
    await page.fill('textarea[name="description"]', 'Test description');
    await page.fill('input[name="price"]', '29.99');

    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('text=Product created')).toBeVisible();

    // Should redirect to products list
    await expect(page).toHaveURL('/dashboard/products');

    // Should show new product
    await expect(page.locator('text=Test Product')).toBeVisible();
  });

  test('should edit existing product', async ({ page }) => {
    await page.goto('/dashboard/products');

    // Click first product edit button
    await page.click('[data-testid="product-1-edit"]');

    // Change name
    await page.fill('input[name="name"]', 'Updated Product Name');

    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('text=Product updated')).toBeVisible();

    // Should show updated name
    await expect(page.locator('text=Updated Product Name')).toBeVisible();
  });

  test('should delete product', async ({ page }) => {
    await page.goto('/dashboard/products');

    // Click delete button
    await page.click('[data-testid="product-1-delete"]');

    // Confirm deletion
    await page.click('button:has-text("Confirm")');

    // Should show success message
    await expect(page.locator('text=Product deleted')).toBeVisible();

    // Product should be gone
    await expect(page.locator('[data-testid="product-1"]')).not.toBeVisible();
  });
});