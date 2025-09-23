import { Page, BrowserContext, expect } from '@playwright/test';
import { LandingPage } from '../pages/LandingPage';
import { DashboardPage } from '../pages/DashboardPage';
import { TEST_USERS } from '../fixtures/testUsers';

/**
 * Authentication helper utilities for testing
 * Provides common authentication flows and verification methods
 */
export class AuthHelpers {
  readonly page: Page;
  readonly context: BrowserContext;
  readonly landingPage: LandingPage;
  readonly dashboardPage: DashboardPage;

  constructor(page: Page, context: BrowserContext) {
    this.page = page;
    this.context = context;
    this.landingPage = new LandingPage(page);
    this.dashboardPage = new DashboardPage(page);
  }

  /**
   * Set up test environment with mocked APIs
   */
  async setupTestEnvironment() {
    // Mock Firebase APIs
    await this.mockFirebaseAPIs();
    
    // Mock Google APIs
    await this.mockGoogleAPIs();
    
    // Set up test environment variables
    await this.page.addInitScript((env) => {
      Object.assign(window, env);
    }, {
      VITE_FIREBASE_API_KEY: 'test_firebase_api_key',
      VITE_FIREBASE_AUTH_DOMAIN: 'test-auth-domain.firebaseapp.com',
      VITE_FIREBASE_PROJECT_ID: 'test-project-id',
      VITE_GOOGLE_API_KEY: 'test_google_api_key',
      VITE_GOOGLE_CLIENT_ID: 'test-client-id.apps.googleusercontent.com',
    });
  }

  /**
   * Mock Firebase APIs for testing
   */
  async mockFirebaseAPIs() {
    // Mock Firebase Auth
    await this.page.route('https://identitytoolkit.googleapis.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          kind: 'identitytoolkit#GetAccountInfoResponse',
          users: [
            {
              localId: 'test-user-123',
              email: 'testuser@gmail.com',
              displayName: 'Test User',
              emailVerified: true,
              providerUserInfo: [
                {
                  providerId: 'google.com',
                  displayName: 'Test User',
                  email: 'testuser@gmail.com',
                }
              ]
            }
          ]
        }),
      });
    });

    // Mock Firestore
    await this.page.route('**/firestore.googleapis.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          documents: [
            {
              name: 'projects/test-project/databases/(default)/documents/users/test-user-123',
              fields: {
                uid: { stringValue: 'test-user-123' },
                email: { stringValue: 'testuser@gmail.com' },
                displayName: { stringValue: 'Test User' },
                role: { stringValue: 'user' },
                sheetId: { stringValue: 'test-sheet-id-789' },
                plan: { stringValue: 'free' },
                subscriptionStatus: { stringValue: 'active' }
              }
            }
          ]
        }),
      });
    });
  }

  /**
   * Mock Google OAuth for testing
   */
  async mockGoogleAPIs() {
    // Mock Google OAuth with Firebase integration
    await this.page.route('https://accounts.google.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <script>
                // Mock Firebase Google Auth response
                window.opener.postMessage({
                  type: 'auth_response',
                  data: {
                    user: {
                      uid: 'test-user-123',
                      email: 'testuser@gmail.com',
                      displayName: 'Test User',
                      photoURL: 'https://example.com/photo.jpg',
                      emailVerified: true,
                      isAnonymous: false,
                      providerData: [{
                        uid: 'test-user-123',
                        email: 'testuser@gmail.com',
                        displayName: 'Test User',
                        photoURL: 'https://example.com/photo.jpg',
                        providerId: 'google.com'
                      }]
                    },
                    credential: {
                      accessToken: 'mock-google-access-token',
                      idToken: 'mock-google-id-token'
                    },
                    operationType: 'signIn',
                    additionalUserInfo: {
                      providerId: 'google.com',
                      profile: {
                        email: 'testuser@gmail.com',
                        name: 'Test User',
                        picture: 'https://example.com/photo.jpg'
                      }
                    }
                  }
                }, '*');
                window.close();
              </script>
            </body>
          </html>
        `,
      });
    });

    // Mock Google Sheets API
    await this.page.route('**/sheets.googleapis.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          spreadsheetId: 'test-sheet-id-789',
          sheets: [
            {
              properties: { title: 'Books' },
              data: [
                {
                  rowData: [
                    { values: [{ userEnteredValue: { stringValue: 'id' } }, { userEnteredValue: { stringValue: 'title' } }] },
                    { values: [{ userEnteredValue: { stringValue: '1' } }, { userEnteredValue: { stringValue: 'Test Book' } }] }
                  ]
                }
              ]
            }
          ]
        }),
      });
    });

    // Mock Google Drive API
    await this.page.route('**/drive.googleapis.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          files: [
            {
              id: 'test-sheet-id-789',
              name: 'Test Library Sheet',
              mimeType: 'application/vnd.google-apps.spreadsheet'
            }
          ]
        }),
      });
    });
  }

  /**
   * Simulate successful authentication flow
   */
  async simulateSuccessfulAuth(userType: keyof typeof TEST_USERS = 'EXISTING_USER') {
    // Navigate to landing page
    await this.landingPage.goto();
    
    // Mock successful OAuth
    await this.landingPage.mockGoogleOAuth();
    
    // Click sign-in button
    await this.landingPage.clickHeroSignInButton();
    
    // Wait for authentication to complete
    await this.page.waitForTimeout(2000);
    
    // Verify user is redirected based on user type
    if (userType === 'NEW_USER') {
      await this.verifyRedirectedToSetup();
    } else if (userType === 'ADMIN_USER') {
      await this.verifyRedirectedToAdmin();
    } else {
      await this.dashboardPage.waitForPageLoad();
      await this.dashboardPage.verifyOnDashboardPage();
    }
  }

  /**
   * Simulate failed authentication flow
   */
  async simulateFailedAuth(errorType: 'popup-closed' | 'network-error' = 'popup-closed') {
    // Navigate to landing page
    await this.landingPage.goto();
    
    // Mock failed OAuth
    if (errorType === 'popup-closed') {
      await this.landingPage.mockFailedGoogleOAuth();
    } else {
      await this.landingPage.mockNetworkError();
    }
    
    // Click sign-in button
    await this.landingPage.clickHeroSignInButton();
    
    // Wait for error handling
    await this.page.waitForTimeout(1000);
    
    // Verify user remains on landing page
    await this.landingPage.verifyOnLandingPage();
  }

  /**
   * Verify user is redirected to setup page
   */
  async verifyRedirectedToSetup() {
    await expect(this.page).toHaveURL(/.*setup.*/);
    await expect(this.page.locator('h1:has-text("Welcome! Let\'s set up your library")')).toBeVisible();
  }

  /**
   * Verify user is redirected to admin page
   */
  async verifyRedirectedToAdmin() {
    await expect(this.page).toHaveURL(/.*admin.*/);
    await expect(this.page.locator('h1:has-text("Admin Panel")')).toBeVisible();
  }

  /**
   * Verify user is redirected to dashboard
   */
  async verifyRedirectedToDashboard() {
    await this.dashboardPage.waitForPageLoad();
    await this.dashboardPage.verifyOnDashboardPage();
  }

  /**
   * Test sign out functionality
   */
  async testSignOut() {
    // Ensure user is on dashboard
    await this.dashboardPage.verifyOnDashboardPage();
    
    // Click sign out
    await this.dashboardPage.clickSignOut();
    
    // Wait for sign out to complete
    await this.page.waitForTimeout(1000);
    
    // Verify redirected to landing page
    await this.landingPage.verifyOnLandingPage();
  }

  /**
   * Test authentication state persistence
   */
  async testAuthPersistence() {
    // First, authenticate
    await this.simulateSuccessfulAuth();
    
    // Get current URL (should be dashboard)
    const dashboardUrl = this.page.url();
    
    // Refresh page
    await this.page.reload();
    
    // Wait for page to load
    await this.page.waitForTimeout(2000);
    
    // Verify still on dashboard (auth persisted)
    await expect(this.page).toHaveURL(dashboardUrl);
    await this.dashboardPage.verifyOnDashboardPage();
  }

  /**
   * Test authentication across tabs
   */
  async testAuthAcrossTabs() {
    // Authenticate in first tab
    await this.simulateSuccessfulAuth();
    
    // Open new tab
    const newTab = await this.context.newPage();
    
    // Navigate to app in new tab
    await newTab.goto('/');
    
    // Wait for authentication to sync
    await newTab.waitForTimeout(2000);
    
    // Verify new tab is also authenticated (should be on dashboard)
    await expect(newTab).toHaveURL(/.*dashboard.*/);
    await expect(newTab.locator('h1:has-text("Library Dashboard")')).toBeVisible();
    
    // Close new tab
    await newTab.close();
  }

  /**
   * Test loading states during authentication
   */
  async testLoadingStates() {
    // Navigate to landing page
    await this.landingPage.goto();
    
    // Mock slow authentication
    await this.page.route('https://accounts.google.com/**', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      return route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: '<html><body>Mock OAuth</body></html>',
      });
    });
    
    // Click sign-in button
    await this.landingPage.clickHeroSignInButton();
    
    // Verify loading spinner appears
    await expect(this.page.locator('[data-testid="loading-spinner"]')).toBeVisible();
    
    // Wait for loading to complete
    await this.page.waitForTimeout(3000);
    
    // Verify loading spinner is hidden
    await expect(this.page.locator('[data-testid="loading-spinner"]')).not.toBeVisible();
  }

  /**
   * Clean up test data and reset state
   */
  async cleanup() {
    // Clear browser storage
    await this.context.clearCookies();
    await this.context.clearPermissions();
    
    // Clear localStorage and sessionStorage
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Reset any mocked routes
    await this.page.unroute('**/firestore.googleapis.com/**');
    await this.page.unroute('**/identitytoolkit.googleapis.com/**');
    await this.page.unroute('https://accounts.google.com/**');
    await this.page.unroute('**/sheets.googleapis.com/**');
    await this.page.unroute('**/drive.googleapis.com/**');
  }

  /**
   * Take screenshot on test failure
   */
  async takeScreenshotOnFailure(testName: string) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await this.page.screenshot({
      path: `./test-results/failures/${testName}-${timestamp}.png`,
      fullPage: true
    });
  }

  /**
   * Get console logs for debugging
   */
  async getConsoleLogs() {
    const logs = await this.page.evaluate(() => {
      // Store console logs during test execution
      return (window as any).testConsoleLogs || [];
    });
    return logs;
  }

  /**
   * Wait for authentication to complete
   */
  async waitForAuthCompletion() {
    // Wait for URL change or loading spinner to disappear
    await Promise.race([
      this.page.waitForURL(/(dashboard|setup|admin)/, { timeout: 10000 }),
      this.page.waitForSelector('[data-testid="loading-spinner"]', { state: 'hidden', timeout: 10000 })
    ]);
  }
}
