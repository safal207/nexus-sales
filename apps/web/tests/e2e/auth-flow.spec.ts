import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Start fresh for each test
    await page.goto('/');
  });

  test('should display landing page correctly', async ({ page }) => {
    await expect(page).toHaveTitle(/NEXUS.SALES|ConsciousFunnels/);

    // Should have navigation with login/register buttons
    await expect(page.locator('a[href="/login"]')).toBeVisible();
    await expect(page.locator('a[href="/register"]')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('a[href="/login"]');
    await expect(page).toHaveURL('/login');

    // Should have login form
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.click('a[href="/register"]');
    await expect(page).toHaveURL('/register');

    // Should have register form
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login with valid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill login form
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard or protected area
    await expect(page).toHaveURL(/dashboard|\/$/);

    // Should show success indicators
    await expect(page.locator('text=Welcome')).toBeVisible({ timeout: 10000 });
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill with invalid credentials
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible({ timeout: 5000 });

    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('should register new user successfully', async ({ page }) => {
    const testEmail = `test_${Date.now()}@playwright.com`;

    await page.goto('/register');

    // Fill registration form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', 'newpassword123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to login or dashboard
    await expect(page).toHaveURL(/login|dashboard|\/$/);

    // Should show success message
    await expect(page.locator('text=successfully|Welcome|registered')).toBeVisible({ timeout: 10000 });
  });

  test('should show error for duplicate email registration', async ({ page }) => {
    await page.goto('/register');

    // Try to register with existing email
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=already exists|Email already')).toBeVisible({ timeout: 5000 });

    // Should stay on register page
    await expect(page).toHaveURL('/register');
  });

  test('should validate email format', async ({ page }) => {
    await page.goto('/register');

    // Try invalid email format
    await page.fill('input[type="email"]', 'invalid-email');
    await page.fill('input[type="password"]', 'password123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show validation error or stay on page
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should validate password strength', async ({ page }) => {
    await page.goto('/register');

    // Try weak password
    await page.fill('input[type="email"]', 'weak@test.com');
    await page.fill('input[type="password"]', '123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show password validation error
    await expect(page.locator('text=at least 6 characters|Password too weak')).toBeVisible({ timeout: 5000 });
  });

  test('should navigate to forgot password page', async ({ page }) => {
    await page.goto('/login');

    // Click forgot password link
    await page.click('a[href*="forgot-password"]');

    // Should navigate to forgot password page
    await expect(page).toHaveURL(/forgot-password/);

    // Should have email input
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('should handle forgot password flow', async ({ page }) => {
    await page.goto('/auth/forgot-password');

    // Fill email
    await page.fill('input[type="email"]', 'test@test.com');

    // Submit form
    await page.click('button[type="submit"]');

    // Should show success message
    await expect(page.locator('text=reset link|email sent|check your email')).toBeVisible({ timeout: 5000 });
  });

  test('should logout user correctly', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for successful login
    await expect(page).toHaveURL(/dashboard|\/$/);

    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Logout"), button:has-text("Sign out"), a:has-text("Logout")');
    await logoutButton.click({ timeout: 10000 });

    // Should redirect to login or home page
    await expect(page).toHaveURL(/login|\/$/);

    // Should not be able to access protected routes
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login|\/$/);
  });

  test('should persist login state on page refresh', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for login success
    await expect(page).toHaveURL(/dashboard|\/$/);

    // Refresh page
    await page.reload();

    // Should still be logged in
    await expect(page).not.toHaveURL('/login');
    await expect(page.locator('text=Welcome|Dashboard')).toBeVisible({ timeout: 10000 });
  });

  test('should protect routes requiring authentication', async ({ page }) => {
    // Try to access protected route without login
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/login|\/$/);

    // Try to access API endpoints directly
    const response = await page.request.get('/api/products');
    expect(response.status()).toBe(401);
  });
});