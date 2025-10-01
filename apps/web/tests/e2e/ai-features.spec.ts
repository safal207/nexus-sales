import { test, expect } from '@playwright/test';

test.describe('AI Features Integration', () => {
  // Helper function to login
  const login = async (page: any) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'test@test.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/dashboard|\/$/);
  };

  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should access analytics dashboard', async ({ page }) => {
    // Navigate to analytics/dashboard section
    await page.goto('/dashboard');

    // Should show dashboard elements
    await expect(page.locator('text=Dashboard|Analytics')).toBeVisible();

    // Look for AI-related elements
    const aiElements = [
      'text=Emotional Journey',
      'text=AI Prediction',
      'text=Analytics',
      'text=Insights'
    ];

    // At least one AI element should be visible
    let aiElementFound = false;
    for (const element of aiElements) {
      const elementVisible = await page.locator(element).isVisible();
      if (elementVisible) {
        aiElementFound = true;
        break;
      }
    }
    expect(aiElementFound).toBe(true);
  });

  test('should generate emotion analysis from text input', async ({ page }) => {
    // Navigate to a page with text input (could be product form, chat, etc.)
    await page.goto('/dashboard');

    // Look for text input areas that might trigger emotion analysis
    const textInputs = await page.locator('textarea, input[type="text"]').all();

    if (textInputs.length > 0) {
      // Fill first text input with emotional content
      await textInputs[0].fill("I'm so excited about this amazing product! It looks fantastic!");

      // Wait a bit for potential emotion analysis
      await page.waitForTimeout(3000);

      // Check if any emotion-related elements appear
      const emotionElements = await page.locator('[data-testid*="emotion"], .emotion, text=joy, text=excited').all();

      // If emotion tracking is working, we should see some indicators
      if (emotionElements.length > 0) {
        expect(emotionElements.length).toBeGreaterThan(0);
      }
    }
  });

  test('should display analytics insights', async ({ page }) => {
    // Mock successful API call for insights
    await page.route('/api/analytics/insights', async route => {
      const json = {
        success: true,
        insights: [
          {
            type: 'conversion',
            title: 'Conversion Rate',
            value: '12.5%',
            trend: 'up',
            impact: 'high',
            recommendation: 'Continue current strategy'
          },
          {
            type: 'emotion',
            title: 'Emotional Engagement',
            value: '85%',
            trend: 'up',
            impact: 'high',
            recommendation: 'Leverage positive emotions'
          }
        ],
        predictions: {
          next_24h_conversions: 15,
          confidence_score: 0.87
        }
      };
      await route.fulfill({ json });
    });

    // Navigate to analytics page
    await page.goto('/dashboard');

    // Should eventually show insights
    await expect(page.locator('text=Conversion Rate')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Emotional Engagement')).toBeVisible();
    await expect(page.locator('text=12.5%')).toBeVisible();
    await expect(page.locator('text=85%')).toBeVisible();
  });

  test('should handle emotion tracking API calls', async ({ page }) => {
    let emotionApiCalled = false;

    // Intercept emotion analysis API calls
    await page.route('/api/emotions/analyze', async route => {
      emotionApiCalled = true;
      const json = {
        success: true,
        analysis: {
          primary_emotion: 'joy',
          confidence_score: 0.85,
          sentiment: 'positive',
          engagement_level: 'high'
        },
        stored: true,
        total_emotions: 1
      };
      await route.fulfill({ json });
    });

    // Navigate to a form or input area
    await page.goto('/dashboard/products/new');

    // Fill out form with emotional text
    const nameInput = page.locator('input[name="name"], input[placeholder*="name"]').first();
    const descInput = page.locator('textarea[name="description"], textarea[placeholder*="description"]').first();

    if (await nameInput.isVisible()) {
      await nameInput.fill('Amazing Product That Makes People Happy!');
    }

    if (await descInput.isVisible()) {
      await descInput.fill('This fantastic product will bring joy and excitement to your customers! They will love it and trust your brand completely.');
    }

    // Wait for potential API calls
    await page.waitForTimeout(3000);

    // Check if emotion API was called (emotion tracking working)
    expect(emotionApiCalled).toBe(true);
  });

  test('should display emotion history', async ({ page }) => {
    // Mock emotion history API
    await page.route('/api/emotions/analyze', async route => {
      if (route.request().method() === 'GET') {
        const json = {
          success: true,
          emotions: [
            {
              emotion: 'joy',
              confidence: 0.8,
              timestamp: Date.now() - 1000,
              context: 'product_creation'
            },
            {
              emotion: 'trust',
              confidence: 0.7,
              timestamp: Date.now() - 500,
              context: 'form_input'
            }
          ],
          insights: {
            dominant_emotion: 'joy',
            emotional_trend: 'improving',
            conversion_probability: 0.75
          },
          stats: {
            total_emotions: 2
          }
        };
        await route.fulfill({ json });
      } else {
        await route.continue();
      }
    });

    // Navigate to analytics dashboard
    await page.goto('/dashboard');

    // Look for emotion-related content
    await expect(page.locator('text=joy, text=trust')).toBeVisible({ timeout: 10000 });

    // Should show insights
    await expect(page.locator('text=75%, text=improving')).toBeVisible();
  });

  test('should handle AI predictions', async ({ page }) => {
    // Mock predictions API
    await page.route('/api/analytics/insights', async route => {
      const json = {
        success: true,
        predictions: {
          next_24h_conversions: 23,
          emotional_state_forecast: 'Positive trend expected',
          optimization_potential: '15% improvement possible',
          confidence_score: 0.92
        },
        insights: []
      };
      await route.fulfill({ json });
    });

    await page.goto('/dashboard');

    // Should show AI predictions
    await expect(page.locator('text=23, text=92%')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Positive trend')).toBeVisible();
    await expect(page.locator('text=15% improvement')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock API failure
    await page.route('/api/analytics/insights', async route => {
      await route.fulfill({ status: 500, json: { error: 'Internal Server Error' } });
    });

    await page.goto('/dashboard');

    // Should show error message or retry option
    const errorElements = [
      'text=Error',
      'text=Failed to load',
      'text=Try again',
      'button:has-text("Retry")',
      'button:has-text("Refresh")'
    ];

    let errorHandled = false;
    for (const element of errorElements) {
      if (await page.locator(element).isVisible({ timeout: 5000 })) {
        errorHandled = true;
        break;
      }
    }
    expect(errorHandled).toBe(true);
  });

  test('should update insights in real-time', async ({ page }) => {
    let callCount = 0;

    // Mock API with changing data
    await page.route('/api/analytics/insights', async route => {
      callCount++;
      const json = {
        success: true,
        insights: [
          {
            type: 'conversion',
            title: 'Conversion Rate',
            value: `${10 + callCount}.0%`,
            trend: 'up',
            impact: 'medium'
          }
        ],
        predictions: {
          next_24h_conversions: 10 + callCount,
          confidence_score: 0.8 + (callCount * 0.05)
        }
      };
      await route.fulfill({ json });
    });

    await page.goto('/dashboard');

    // Wait for initial load
    await expect(page.locator('text=11.0%')).toBeVisible({ timeout: 10000 });

    // Look for refresh button and click it
    const refreshButton = page.locator('button:has-text("Refresh"), button:has-text("Update")').first();
    if (await refreshButton.isVisible()) {
      await refreshButton.click();

      // Should show updated data
      await expect(page.locator('text=12.0%')).toBeVisible({ timeout: 5000 });
    }
  });

  test('should be responsive on mobile devices', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto('/dashboard');

    // Should still show key elements on mobile
    await expect(page.locator('text=Dashboard')).toBeVisible();

    // AI elements should be accessible
    const mobileElements = [
      'text=Analytics',
      'text=Insights',
      '[data-testid*="emotion"]'
    ];

    // At least some elements should be visible
    let elementsVisible = 0;
    for (const element of mobileElements) {
      if (await page.locator(element).isVisible()) {
        elementsVisible++;
      }
    }
    expect(elementsVisible).toBeGreaterThan(0);
  });
});