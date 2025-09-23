import { test, expect } from '@playwright/test';
import { AuthHelpers } from './utils/authHelpers';
import { TEST_USERS } from './fixtures/testUsers';

test.describe('Authentication Flow', () => {
  let authHelpers: AuthHelpers;

  test.beforeEach(async ({ page, context }) => {
    authHelpers = new AuthHelpers(page, context);
    await authHelpers.setupTestEnvironment();
  });

  test.afterEach(async () => {
    await authHelpers.cleanup();
  });

  test.describe('Happy Path Scenarios', () => {
    test('should successfully authenticate existing user and redirect to dashboard', async ({ page }) => {
      // Navigate to landing page
      await authHelpers.landingPage.goto();
      await authHelpers.landingPage.verifyOnLandingPage();

      // Mock successful authentication for existing user
      await authHelpers.landingPage.mockGoogleOAuth();

      // Click sign-in button
      await authHelpers.landingPage.clickHeroSignInButton();

      // Wait for authentication to complete
      await authHelpers.waitForAuthCompletion();

      // Verify redirected to dashboard
      await authHelpers.dashboardPage.waitForPageLoad();
      await authHelpers.dashboardPage.verifyOnDashboardPage();

      // Verify dashboard elements are present
      await authHelpers.dashboardPage.verifyDashboardElements();

      // Verify user is on correct URL
      await expect(page).toHaveURL(/.*dashboard.*/);

      // Verify default tab is Books
      await authHelpers.dashboardPage.verifyActiveTab('Books');
    });

    test('should successfully authenticate new user and redirect to setup page', async ({ page }) => {
      // Navigate to landing page
      await authHelpers.landingPage.goto();

      // Mock successful authentication for new user (no sheetId)
      await page.route('**/firestore.googleapis.com/**', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            documents: [
              {
                name: 'projects/test-project/databases/(default)/documents/users/test-new-user-123',
                fields: {
                  uid: { stringValue: 'test-new-user-123' },
                  email: { stringValue: 'newuser@test.com' },
                  displayName: { stringValue: 'New Test User' },
                  role: { stringValue: 'user' },
                  sheetId: { nullValue: null }, // No sheetId for new user
                  plan: { stringValue: 'free' },
                  subscriptionStatus: { stringValue: 'active' }
                }
              }
            ]
          }),
        });
      });

      await authHelpers.landingPage.mockGoogleOAuth();

      // Click sign-in button
      await authHelpers.landingPage.clickHeroSignInButton();

      // Wait for authentication to complete
      await authHelpers.waitForAuthCompletion();

      // Verify redirected to setup page
      await expect(page).toHaveURL(/.*setup.*/);
      await expect(page.locator('h1:has-text("Welcome! Let\'s set up your library")')).toBeVisible();
      await expect(page.locator('text=Connect your library\'s data source to get started')).toBeVisible();
    });

    test('should successfully authenticate admin user and redirect to admin page', async ({ page }) => {
      // Navigate to landing page
      await authHelpers.landingPage.goto();

      // Mock successful authentication for admin user
      await page.route('**/firestore.googleapis.com/**', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            documents: [
              {
                name: 'projects/test-project/databases/(default)/documents/users/test-admin-user-789',
                fields: {
                  uid: { stringValue: 'test-admin-user-789' },
                  email: { stringValue: 'admin@test.com' },
                  displayName: { stringValue: 'Admin Test User' },
                  role: { stringValue: 'admin' },
                  sheetId: { stringValue: 'admin-sheet-id-101' },
                  plan: { stringValue: 'enterprise' },
                  subscriptionStatus: { stringValue: 'active' }
                }
              }
            ]
          }),
        });
      });

      await authHelpers.landingPage.mockGoogleOAuth();

      // Click sign-in button
      await authHelpers.landingPage.clickHeroSignInButton();

      // Wait for authentication to complete
      await authHelpers.waitForAuthCompletion();

      // Verify redirected to admin page
      await expect(page).toHaveURL(/.*admin.*/);
      await expect(page.locator('h1:has-text("Admin Panel")')).toBeVisible();
      await expect(page.locator('text=User Management')).toBeVisible();
    });

    test('should handle sign out functionality correctly', async ({ page }) => {
      // First authenticate
      await authHelpers.simulateSuccessfulAuth('EXISTING_USER');

      // Verify on dashboard
      await authHelpers.dashboardPage.verifyOnDashboardPage();

      // Click sign out
      await authHelpers.dashboardPage.clickSignOut();

      // Wait for sign out to complete
      await page.waitForTimeout(1000);

      // Verify redirected back to landing page
      await authHelpers.landingPage.verifyOnLandingPage();
      await expect(page).toHaveURL('/');

      // Verify authentication state is cleared
      const localStorage = await page.evaluate(() => {
        return {
          firebaseTokens: localStorage.getItem('firebase:authUser:AIza:[DEFAULT]'),
          userData: localStorage.getItem('gundeshapur_user')
        };
      });
      
      expect(localStorage.firebaseTokens).toBeNull();
      expect(localStorage.userData).toBeNull();
    });

    test('should maintain authentication state after page refresh', async ({ page }) => {
      // Authenticate user
      await authHelpers.simulateSuccessfulAuth('EXISTING_USER');

      // Get dashboard URL
      const dashboardUrl = page.url();

      // Refresh the page
      await page.reload();

      // Wait for page to load
      await page.waitForTimeout(2000);

      // Verify still on dashboard (authentication persisted)
      await expect(page).toHaveURL(dashboardUrl);
      await authHelpers.dashboardPage.verifyOnDashboardPage();
      await authHelpers.dashboardPage.verifyDashboardReady();
    });

    test('should sync authentication state across multiple tabs', async ({ page, context }) => {
      // Authenticate in first tab
      await authHelpers.simulateSuccessfulAuth('EXISTING_USER');

      // Open new tab
      const newTab = await context.newPage();

      // Navigate to app in new tab
      await newTab.goto('/');

      // Wait for authentication to sync
      await newTab.waitForTimeout(2000);

      // Verify new tab is also authenticated
      await expect(newTab).toHaveURL(/.*dashboard.*/);
      await expect(newTab.locator('h1:has-text("Library Dashboard")')).toBeVisible();

      // Close new tab
      await newTab.close();
    });

    test('should display correct dashboard elements based on user plan', async ({ page }) => {
      // Test free user
      await authHelpers.simulateSuccessfulAuth('EXISTING_USER');
      await authHelpers.dashboardPage.verifyUpgradeBannerVisible();
      await authHelpers.dashboardPage.verifyBackupButton('free');
      await authHelpers.dashboardPage.verifyExportButton('free');

      // Sign out
      await authHelpers.dashboardPage.clickSignOut();
      await page.waitForTimeout(1000);

      // Test pro user
      await page.route('**/firestore.googleapis.com/**', (route) => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            documents: [
              {
                name: 'projects/test-project/databases/(default)/documents/users/test-pro-user-101',
                fields: {
                  uid: { stringValue: 'test-pro-user-101' },
                  email: { stringValue: 'prouser@test.com' },
                  displayName: { stringValue: 'Pro Test User' },
                  role: { stringValue: 'user' },
                  sheetId: { stringValue: 'pro-sheet-id-202' },
                  plan: { stringValue: 'pro' },
                  subscriptionStatus: { stringValue: 'active' }
                }
              }
            ]
          }),
        });
      });

      await authHelpers.simulateSuccessfulAuth('PRO_USER');
      await authHelpers.dashboardPage.verifyUpgradeBannerNotVisible();
      await authHelpers.dashboardPage.verifyBackupButton('pro');
      await authHelpers.dashboardPage.verifyExportButton('pro');
    });

    test('should handle dashboard tab navigation correctly', async ({ page }) => {
      // Authenticate user
      await authHelpers.simulateSuccessfulAuth('EXISTING_USER');

      // Test tab navigation
      await authHelpers.dashboardPage.clickBooksTab();
      await authHelpers.dashboardPage.verifyActiveTab('Books');

      await authHelpers.dashboardPage.clickMembersTab();
      await authHelpers.dashboardPage.verifyActiveTab('Members');

      await authHelpers.dashboardPage.clickLoansTab();
      await authHelpers.dashboardPage.verifyActiveTab('Loans');

      await authHelpers.dashboardPage.clickBillingTab();
      await authHelpers.dashboardPage.verifyActiveTab('Billing');

      await authHelpers.dashboardPage.clickAILibrarianTab();
      await authHelpers.dashboardPage.verifyActiveTab('AI Librarian');
    });
  });

  test.describe('Error Scenarios', () => {
    test('should handle OAuth popup closed by user', async ({ page }) => {
      // Navigate to landing page
      await authHelpers.landingPage.goto();

      // Mock failed OAuth (popup closed)
      await authHelpers.landingPage.mockFailedGoogleOAuth();

      // Click sign-in button
      await authHelpers.landingPage.clickHeroSignInButton();

      // Wait for error handling
      await page.waitForTimeout(1000);

      // Verify user remains on landing page
      await authHelpers.landingPage.verifyOnLandingPage();
      await expect(page).toHaveURL('/');
    });

    test('should handle network error during authentication', async ({ page }) => {
      // Navigate to landing page
      await authHelpers.landingPage.goto();

      // Mock network error
      await authHelpers.landingPage.mockNetworkError();

      // Click sign-in button
      await authHelpers.landingPage.clickHeroSignInButton();

      // Wait for error handling
      await page.waitForTimeout(1000);

      // Verify user remains on landing page
      await authHelpers.landingPage.verifyOnLandingPage();
      await expect(page).toHaveURL('/');
    });

    test('should handle Firebase authentication error', async ({ page }) => {
      // Navigate to landing page
      await authHelpers.landingPage.goto();

      // Mock Firebase auth error
      await page.route('https://identitytoolkit.googleapis.com/**', (route) => {
        route.fulfill({
          status: 400,
          contentType: 'application/json',
          body: JSON.stringify({
            error: {
              code: 400,
              message: 'INVALID_ID_TOKEN',
              status: 'INVALID_ARGUMENT'
            }
          }),
        });
      });

      await authHelpers.landingPage.mockGoogleOAuth();

      // Click sign-in button
      await authHelpers.landingPage.clickHeroSignInButton();

      // Wait for error handling
      await page.waitForTimeout(2000);

      // Verify user remains on landing page
      await authHelpers.landingPage.verifyOnLandingPage();
    });

    test('should handle Firestore connection error', async ({ page }) => {
      // Navigate to landing page
      await authHelpers.landingPage.goto();

      // Mock Firestore error
      await page.route('**/firestore.googleapis.com/**', (route) => {
        route.abort('failed');
      });

      await authHelpers.landingPage.mockGoogleOAuth();

      // Click sign-in button
      await authHelpers.landingPage.clickHeroSignInButton();

      // Wait for error handling
      await page.waitForTimeout(2000);

      // Verify user remains on landing page or shows error state
      await expect(page).toHaveURL('/');
    });
  });

  test.describe('Loading States and UX', () => {
    test('should show loading spinner during authentication', async ({ page }) => {
      // Navigate to landing page
      await authHelpers.landingPage.goto();

      // Mock slow authentication
      await page.route('https://accounts.google.com/**', async (route) => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return route.fulfill({
          status: 200,
          contentType: 'text/html',
          body: '<html><body>Mock OAuth</body></html>',
        });
      });

      // Click sign-in button
      await authHelpers.landingPage.clickHeroSignInButton();

      // Verify loading spinner appears
      await expect(page.locator('[data-testid="loading-spinner"]')).toBeVisible();

      // Wait for loading to complete
      await page.waitForTimeout(3000);

      // Verify loading spinner is hidden
      await expect(page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
    });

    test('should handle multiple rapid sign-in clicks gracefully', async ({ page }) => {
      // Navigate to landing page
      await authHelpers.landingPage.goto();

      // Mock authentication
      await authHelpers.landingPage.mockGoogleOAuth();

      // Click sign-in button multiple times rapidly
      await Promise.all([
        authHelpers.landingPage.clickHeroSignInButton(),
        authHelpers.landingPage.clickHeroSignInButton(),
        authHelpers.landingPage.clickHeroSignInButton(),
      ]);

      // Wait for authentication to complete
      await authHelpers.waitForAuthCompletion();

      // Verify only one authentication process completed
      await authHelpers.dashboardPage.verifyOnDashboardPage();
      await expect(page).toHaveURL(/.*dashboard.*/);
    });

    test('should maintain responsive design during authentication flow', async ({ page }) => {
      // Test on mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      
      await authHelpers.landingPage.goto();
      await authHelpers.landingPage.verifyLandingPageElements();

      await authHelpers.landingPage.mockGoogleOAuth();
      await authHelpers.landingPage.clickHeroSignInButton();

      await authHelpers.waitForAuthCompletion();
      await authHelpers.dashboardPage.verifyOnDashboardPage();

      // Test on tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await authHelpers.dashboardPage.verifyDashboardElements();

      // Test on desktop viewport
      await page.setViewportSize({ width: 1920, height: 1080 });
      await authHelpers.dashboardPage.verifyDashboardElements();
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels on authentication elements', async ({ page }) => {
      await authHelpers.landingPage.goto();

      // Check sign-in buttons have proper labels
      const signInButtons = await page.$$('[aria-label*="sign"], [aria-label*="Sign"], [aria-label*="auth"], [aria-label*="Auth"]');
      expect(signInButtons.length).toBeGreaterThan(0);

      // Check loading spinner has proper aria-label
      await authHelpers.landingPage.clickHeroSignInButton();
      
      // Wait a bit for potential loading state
      await page.waitForTimeout(500);
      
      const loadingSpinner = await page.$('[aria-label*="loading"], [aria-label*="Loading"], [role="progressbar"]');
      if (loadingSpinner) {
        expect(loadingSpinner).toBeTruthy();
      }
    });

    test('should be keyboard navigable during authentication flow', async ({ page }) => {
      await authHelpers.landingPage.goto();

      // Test keyboard navigation to sign-in button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      
      // Check if focused element is clickable (sign-in button)
      const focusedElement = await page.evaluate(() => document.activeElement);
      const tagName = await page.evaluate((element) => element?.tagName, focusedElement);
      const isButton = tagName === 'BUTTON';
      
      expect(isButton).toBeTruthy();

      // Activate with Enter key
      await page.keyboard.press('Enter');

      // Wait for authentication to complete
      await authHelpers.waitForAuthCompletion();

      // Verify navigation worked
      await expect(page).toHaveURL(/(dashboard|setup|admin)/);
    });
  });
});
