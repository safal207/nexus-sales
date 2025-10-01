import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button:has-text("Войти")');

    // Wait for dashboard to load
    await expect(page.locator('text=Dashboard|Панель управления')).toBeVisible();
  });

  test('should display dashboard with key metrics', async ({ page }) => {
    // Check dashboard title
    await expect(page.locator('h1, h2')).toContainText(/Dashboard|Панель/);

    // Check for key metrics/cards
    await expect(page.locator('text=Пользователи|Users')).toBeVisible();
    await expect(page.locator('text=Конверсия|Conversion')).toBeVisible();
    await expect(page.locator('text=Доход|Revenue')).toBeVisible();
  });

  test('should navigate to products page', async ({ page }) => {
    await page.click('text=Продукты|Products');
    await expect(page).toHaveURL(/.*products/);
    await expect(page.locator('text=Управление продуктами|Product Management')).toBeVisible();
  });

  test('should navigate to analytics page', async ({ page }) => {
    await page.click('text=Аналитика|Analytics');
    await expect(page).toHaveURL(/.*analytics/);
    await expect(page.locator('text=Эмоциональная аналитика|Emotion Analytics')).toBeVisible();
  });

  test('should show emotion journey chart', async ({ page }) => {
    // Navigate to analytics
    await page.click('text=Аналитика|Analytics');

    // Check for chart elements
    await expect(page.locator('text=Эмоциональный путь|Emotional Journey')).toBeVisible();

    // Check for chart container (by common chart class names)
    await expect(page.locator('.recharts-wrapper, [data-testid="chart"], svg')).toBeVisible();
  });

  test('should display predictive analytics', async ({ page }) => {
    // Navigate to analytics
    await page.click('text=Аналитика|Analytics');

    // Check for predictive analytics section
    await expect(page.locator('text=Предсказательная аналитика|Predictive Analytics')).toBeVisible();

    // Check for AI insights
    await expect(page.locator('text=AI|ИИ')).toBeVisible();
  });
});
