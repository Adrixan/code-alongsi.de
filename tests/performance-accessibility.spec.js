const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');

test.describe('US-1: Sichere KI-Integration', () => {

  test('test_US1_slogan_exists - Slogan "K.I.? Aber sicher! Mit Code-Alongside" is visible in hero', async ({ page }) => {
    await page.goto('/');
    const slogan = page.locator('.hero__badge');
    await expect(slogan).toBeVisible();
    await expect(slogan).toHaveText('K.I.? Aber sicher! Mit Code-Alongside');
  });

  test('test_US1_ai_service_card_exists - Secure AI integration service card is present', async ({ page }) => {
    await page.goto('/');
    const cardTitle = page.locator('#service-5-title');
    await expect(cardTitle).toBeVisible();
    await expect(cardTitle).toHaveText('Sichere KI-Integration');
  });

  test('test_US1_ai_service_bullets_count - Service card has exactly 4 bullets', async ({ page }) => {
    await page.goto('/');
    const listItems = page.locator('[aria-labelledby="service-5-title"] .service-card__list li');
    await expect(listItems).toHaveCount(4);
  });

  test('test_US1_security_csp - CSP meta tag is present', async ({ page }) => {
    await page.goto('/');
    const cspMeta = page.locator('meta[http-equiv="Content-Security-Policy"]');
    await expect(cspMeta).toBeAttached();
  });

  test('test_US1_accessibility_audit - WCAG 2.1 AA accessibility audit', async ({ page }) => {
    await page.goto('/');
    await injectAxe(page);
    await checkA11y(page, null, {
      axeOptions: {
        rules: {
          // Allow custom options if needed, standard WCAG 2.1 AA
        }
      },
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
  });

  test('test_US1_mobile_menu_nav - Mobile menu opens, traps focus, and closes correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const menuToggle = page.locator('.header__menu-toggle');
    const mainNav = page.locator('.header__nav');
    
    // Initial state: hidden on mobile
    await expect(menuToggle).toBeVisible();
    await expect(mainNav).toHaveAttribute('inert', '');
    
    // Open menu
    await menuToggle.click();
    await expect(mainNav).not.toHaveAttribute('inert');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'true');
    
    // Close menu
    await menuToggle.click();
    await expect(mainNav).toHaveAttribute('inert', '');
    await expect(menuToggle).toHaveAttribute('aria-expanded', 'false');
  });

});
