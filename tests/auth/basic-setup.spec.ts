import { test, expect } from '@playwright/test';

test.describe('Basic Setup Verification', () => {
  test('should load landing page correctly', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Verify basic elements are present
    await expect(page.locator('h1:has-text("Simple, Powerful Library Management")')).toBeVisible();
    await expect(page.locator('text=Gundeshapur helps small libraries')).toBeVisible();
    
    // Verify URL is correct
    await expect(page).toHaveURL('/');

    // Take screenshot for verification
    await page.screenshot({ path: './test-results/basic-setup-landing-page.png' });
  });

  test('should have working navigation', async ({ page }) => {
    // Navigate to landing page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if there are navigation elements
    const navElements = await page.$$('nav, header, .nav, .navigation');
    expect(navElements.length).toBeGreaterThan(0);

    // Check if there are sign-in buttons
    const signInButtons = await page.$$('button:has-text("Start for Free"), button:has-text("Sign In"), button:has-text("Login")');
    expect(signInButtons.length).toBeGreaterThan(0);
  });

  test('should handle page responsiveness', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1:has-text("Simple, Powerful Library Management")')).toBeVisible();
    await page.screenshot({ path: './test-results/basic-setup-mobile.png' });

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    await expect(page.locator('h1:has-text("Simple, Powerful Library Management")')).toBeVisible();
    await page.screenshot({ path: './test-results/basic-setup-desktop.png' });
  });
});
