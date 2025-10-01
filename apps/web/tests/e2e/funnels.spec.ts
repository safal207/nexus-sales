import { test, expect } from '@playwright/test';

test.describe('Sales Funnels', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/auth/login');
    await page.fill('input[type="email"]', 'demo@nexus-sales.com');
    await page.fill('input[type="password"]', 'DemoPassword123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should display sales funnel metrics', async ({ page }) => {
    await page.goto('/dashboard/funnels');

    // Should show funnel metrics
    await expect(page.locator('text=Sales Funnel Report')).toBeVisible();
    await expect(page.locator('text=Conversion Rate')).toBeVisible();
    await expect(page.locator('text=Order Status')).toBeVisible();
    
    // Should show charts
    await expect(page.locator('svg')).toBeVisible(); // Chart container
    await expect(page.locator('text=Created')).toBeVisible();
    await expect(page.locator('text=Processing')).toBeVisible();
    await expect(page.locator('text=Paid')).toBeVisible();
  });

  test('should filter orders by status', async ({ page }) => {
    await page.goto('/dashboard/funnels');
    
    // Should show all orders initially
    await expect(page.locator('.order-item')).toHaveCount(5); // From the 5 demo orders
    
    // Filter by status
    await page.click('select[name="status-filter"]');
    await page.selectOption('select[name="status-filter"]', 'paid');
    
    // Should show only paid orders
    await expect(page.locator('text=Status: paid')).toBeVisible();
  });

  test('should create and track new order', async ({ page }) => {
    await page.goto('/dashboard/products');
    
    // Click first product
    await page.click('text=Test Product'); // Using a product from our seed data
    
    // Create an order
    await page.fill('input[name="customer-email"]', 'customer@example.com');
    await page.fill('input[name="customer-name"]', 'John Doe');
    await page.click('button:has-text("Create Order")');
    
    // Should redirect to order confirmation
    await expect(page.locator('text=Order Created Successfully')).toBeVisible();
    
    // Check if order appears in funnels
    await page.goto('/dashboard/funnels');
    await expect(page.locator('text=customer@example.com')).toBeVisible();
  });

  test('should show conversion metrics', async ({ page }) => {
    await page.goto('/dashboard/funnels');
    
    // Should show conversion rate metrics
    await expect(page.locator('text=Total Orders')).toBeVisible();
    await expect(page.locator('text=Conversion Rate')).toBeVisible();
    await expect(page.locator('text=Average Order Value')).toBeVisible();
    
    // Metrics should be visible
    await expect(page.locator('[data-testid="conversion-rate"]')).toBeVisible();
    await expect(page.locator('[data-testid="avg-order-value"]')).toBeVisible();
    await expect(page.locator('[data-testid="total-orders"]')).toBeVisible();
  });
});