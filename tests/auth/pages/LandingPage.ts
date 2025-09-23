import { Page, expect } from '@playwright/test';

/**
 * Page Object Model for the Landing Page
 * Handles interactions with the login/authentication elements
 */
export class LandingPage {
  readonly page: Page;

  // Locators for authentication elements
  readonly headerSignInButton: string = 'header button:has-text("Start for Free")';
  readonly heroSignInButton: string = '.hero-section button:has-text("Start for Free Today")';
  readonly pricingSignInButtons: string = '#pricing button:has-text("Start for Free"), #pricing button:has-text("Start Pro Plan"), #pricing button:has-text("Contact Us")';
  readonly logo: string = '[data-testid="logo"]';
  readonly loadingSpinner: string = '[data-testid="loading-spinner"]';

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to the landing page
   */
  async goto() {
    await this.page.goto('/');
    await this.waitForPageLoad();
  }

  /**
   * Wait for the landing page to fully load
   */
  async waitForPageLoad() {
    await this.page.waitForSelector(this.headerSignInButton, { state: 'visible' });
    await this.page.waitForSelector(this.heroSignInButton, { state: 'visible' });
  }

  /**
   * Click the main "Start for Free" sign-in button in the hero section
   */
  async clickHeroSignInButton() {
    await this.page.click(this.heroSignInButton);
  }

  /**
   * Click the header "Start for Free" sign-in button
   */
  async clickHeaderSignInButton() {
    await this.page.click(this.headerSignInButton);
  }

  /**
   * Click any sign-in button (useful for different scenarios)
   */
  async clickAnySignInButton() {
    const buttons = await this.page.$$(this.pricingSignInButtons);
    if (buttons.length > 0) {
      await buttons[0].click();
    } else {
      await this.clickHeroSignInButton();
    }
  }

  /**
   * Verify that the landing page is displayed correctly
   */
  async verifyLandingPageElements() {
    await expect(this.page.locator(this.headerSignInButton)).toBeVisible();
    await expect(this.page.locator(this.heroSignInButton)).toBeVisible();
    
    // Verify hero section content
    await expect(this.page.locator('h1:has-text("Simple, Powerful Library Management")')).toBeVisible();
    await expect(this.page.locator('text=Gundeshapur helps small libraries')).toBeVisible();
    
    // Verify features section
    await expect(this.page.locator('h2:has-text("A Modern Toolkit for Your Community Library")')).toBeVisible();
    
    // Verify pricing section
    await expect(this.page.locator('h2:has-text("Choose Your Plan")')).toBeVisible();
  }

  /**
   * Verify that the user is on the landing page
   */
  async verifyOnLandingPage() {
    await expect(this.page).toHaveURL('/');
    await this.verifyLandingPageElements();
  }

  /**
   * Check if loading spinner is visible
   */
  async isLoading() {
    return await this.page.isVisible(this.loadingSpinner);
  }

  /**
   * Wait for loading to complete
   */
  async waitForLoadingComplete() {
    await this.page.waitForSelector(this.loadingSpinner, { state: 'hidden', timeout: 10000 });
  }

  /**
   * Get the current URL
   */
  async getCurrentUrl() {
    return this.page.url();
  }

  /**
   * Take a screenshot for debugging
   */
  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `./test-results/${name}-${Date.now()}.png` });
  }

  /**
   * Mock Google OAuth popup for testing
   * This method sets up route handlers to mock the Google OAuth flow
   */
  async mockGoogleOAuth() {
    // Mock the Google OAuth popup
    await this.page.route('https://accounts.google.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <script>
                // Mock successful OAuth response
                window.opener.postMessage({
                  type: 'auth_response',
                  data: {
                    credential: {
                      accessToken: 'mock-access-token',
                      idToken: 'mock-id-token'
                    },
                    user: {
                      uid: 'test-user-123',
                      email: 'testuser@gmail.com',
                      displayName: 'Test User',
                      photoURL: 'https://example.com/photo.jpg'
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
  }

  /**
   * Mock failed Google OAuth popup
   */
  async mockFailedGoogleOAuth() {
    await this.page.route('https://accounts.google.com/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'text/html',
        body: `
          <html>
            <body>
              <script>
                // Mock failed OAuth response (user closed popup)
                window.opener.postMessage({
                  type: 'auth_error',
                  error: {
                    code: 'auth/popup-closed-by-user',
                    message: 'The popup has been closed by the user before finalizing the sign-in.'
                  }
                }, '*');
                window.close();
              </script>
            </body>
          </html>
        `,
      });
    });
  }

  /**
   * Mock network error during OAuth
   */
  async mockNetworkError() {
    await this.page.route('https://accounts.google.com/**', (route) => {
      route.abort('failed');
    });
  }
}
