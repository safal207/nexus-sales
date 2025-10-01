import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should register new user', async ({ page }) => {
    await page.goto('/auth/register');

    await page.fill('input[type="email"]', `test-${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'password123');

    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Should show success toast
    await expect(page.locator('text=Registration successful')).toBeVisible();
  });

  test('should login existing user', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');

    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');

    // Should show user email
    await expect(page.locator('text=test@test.com')).toBeVisible();
  });

  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');

    await page.fill('input[type="email"]', 'wrong@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Неверный e-mail или пароль')).toBeVisible();

    // Should stay on login page
    await expect(page).toHaveURL('/auth/login');
  });

  test('should logout user', async ({ page }) => {
    // First login
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Then logout
    await page.click('button:has-text("Logout")');

    // Should redirect to home
    await expect(page).toHaveURL('/');
  });
});