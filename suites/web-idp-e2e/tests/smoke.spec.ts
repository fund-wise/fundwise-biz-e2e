import { test, expect } from '@playwright/test';

test.describe('smoke tests', () => {
  test('should load a test page', async ({ page }) => {
    // Navigate to Playwright's test page
    await page.goto('https://playwright.dev/');
    
    // Verify the page loaded
    await expect(page).toHaveTitle(/Playwright/);
    
    // Check for main content
    const heading = page.locator('h1');
    await expect(heading).toBeVisible();
  });

  test('should perform basic interactions', async ({ page }) => {
    await page.goto('https://example.com');
    
    // Verify page loaded
    await expect(page).toHaveTitle('Example Domain');
    
    // Check for content
    const heading = page.locator('h1');
    await expect(heading).toHaveText('Example Domain');
  });
});