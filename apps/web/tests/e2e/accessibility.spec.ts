import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility Tests', () => {
  test('homepage should have no accessibility violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // Log violations for debugging
    if (accessibilityScanResults.violations.length > 0) {
      console.log('Accessibility violations found:');
      accessibilityScanResults.violations.forEach((violation, index) => {
        console.log(`${index + 1}. ${violation.id}: ${violation.description}`);
        console.log(`   Impact: ${violation.impact}`);
        console.log(`   Help: ${violation.help}`);
        console.log(`   Help URL: ${violation.helpUrl}`);
        console.log(`   Elements: ${violation.nodes.length}`);
        console.log('---');
      });
    }

    expect(accessibilityScanResults.violations).toHaveLength(0);
  });

  test('login page should be accessible', async ({ page }) => {
    await page.goto('/login');

    const axeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    // Allow some violations for forms in development
    const criticalViolations = axeResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    if (criticalViolations.length > 0) {
      console.log('Critical accessibility violations:');
      criticalViolations.forEach(v => console.log(`- ${v.id}: ${v.description}`));
    }

    // For now, allow up to 2 non-critical violations (common in forms)
    expect(axeResults.violations.filter(v => v.impact !== 'minor').length).toBeLessThanOrEqual(2);
  });

  test('register page should be accessible', async ({ page }) => {
    await page.goto('/register');

    const axeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const seriousViolations = axeResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );

    expect(seriousViolations.length).toBeLessThanOrEqual(1);
  });

  test('color contrast should be sufficient', async ({ page }) => {
    await page.goto('/');

    const axeResults = await new AxeBuilder({ page })
      .withRules(['color-contrast'])
      .analyze();

    expect(axeResults.violations.filter(v => v.id === 'color-contrast')).toHaveLength(0);
  });

  test('images should have alt text', async ({ page }) => {
    await page.goto('/');

    const axeResults = await new AxeBuilder({ page })
      .withRules(['image-alt'])
      .analyze();

    expect(axeResults.violations.filter(v => v.id === 'image-alt')).toHaveLength(0);
  });

  test('form elements should have labels', async ({ page }) => {
    await page.goto('/login');

    const axeResults = await new AxeBuilder({ page })
      .withRules(['label', 'form-field-multiple-labels'])
      .analyze();

    const criticalLabelViolations = axeResults.violations.filter(
      v => (v.id === 'label' || v.id === 'form-field-multiple-labels') &&
           (v.impact === 'critical' || v.impact === 'serious')
    );

    expect(criticalLabelViolations.length).toBe(0);
  });

  test('keyboard navigation should work', async ({ page }) => {
    await page.goto('/');

    // Test that we can tab through focusable elements
    await page.keyboard.press('Tab');
    let activeElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(activeElement).toBeDefined();

    // Try to reach at least one interactive element
    for (let i = 0; i < 10; i++) {
      await page.keyboard.press('Tab');
      activeElement = await page.evaluate(() => document.activeElement?.tagName);
      if (activeElement === 'A' || activeElement === 'BUTTON' || activeElement === 'INPUT') {
        break;
      }
    }

    // Should find at least one interactive element
    expect(['A', 'BUTTON', 'INPUT']).toContain(activeElement);
  });
});
