import { Page, expect } from '@playwright/test';

/**
 * Page Object Model for the Dashboard Page
 * Handles verification of dashboard elements after successful authentication
 */
export class DashboardPage {
  readonly page: Page;

  // Locators for dashboard elements
  readonly dashboardHeader: string = 'h1:has-text("Library Dashboard")';
  readonly booksTab: string = 'button:has-text("Books")';
  readonly membersTab: string = 'button:has-text("Members")';
  readonly loansTab: string = 'button:has-text("Loans")';
  readonly billingTab: string = 'button:has-text("Billing")';
  readonly aiLibrarianTab: string = 'button:has-text("AI Librarian")';
  readonly loadingSpinner: string = '[data-testid="loading-spinner"]';
  readonly signOutButton: string = 'button:has-text("Sign Out")';
  readonly upgradeBanner: string = '[data-testid="upgrade-banner"]';
  readonly backupButton: string = 'button:has-text("Backup Data")';
  readonly exportButton: string = 'button:has-text("Export Data")';

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Wait for the dashboard page to fully load
   */
  async waitForPageLoad() {
    await this.page.waitForSelector(this.dashboardHeader, { state: 'visible', timeout: 15000 });
    await this.page.waitForSelector(this.booksTab, { state: 'visible' });
    await this.waitForLoadingComplete();
  }

  /**
   * Verify that the user is on the dashboard page
   */
  async verifyOnDashboardPage() {
    await expect(this.page.locator(this.dashboardHeader)).toBeVisible();
    await expect(this.page.locator(this.booksTab)).toBeVisible();
    await expect(this.page.locator(this.membersTab)).toBeVisible();
    await expect(this.page.locator(this.loansTab)).toBeVisible();
    await expect(this.page.locator(this.billingTab)).toBeVisible();
    await expect(this.page.locator(this.aiLibrarianTab)).toBeVisible();
  }

  /**
   * Verify all dashboard elements are present
   */
  async verifyDashboardElements() {
    await this.verifyOnDashboardPage();
    
    // Verify tabs are clickable
    await expect(this.page.locator(this.booksTab)).toBeEnabled();
    await expect(this.page.locator(this.membersTab)).toBeEnabled();
    await expect(this.page.locator(this.loansTab)).toBeEnabled();
    await expect(this.page.locator(this.billingTab)).toBeEnabled();
    await expect(this.page.locator(this.aiLibrarianTab)).toBeEnabled();
    
    // Verify sign out button is present
    await expect(this.page.locator(this.signOutButton)).toBeVisible();
  }

  /**
   * Click on the Books tab
   */
  async clickBooksTab() {
    await this.page.click(this.booksTab);
    await this.waitForLoadingComplete();
  }

  /**
   * Click on the Members tab
   */
  async clickMembersTab() {
    await this.page.click(this.membersTab);
    await this.waitForLoadingComplete();
  }

  /**
   * Click on the Loans tab
   */
  async clickLoansTab() {
    await this.page.click(this.loansTab);
    await this.waitForLoadingComplete();
  }

  /**
   * Click on the Billing tab
   */
  async clickBillingTab() {
    await this.page.click(this.billingTab);
    await this.waitForLoadingComplete();
  }

  /**
   * Click on the AI Librarian tab
   */
  async clickAILibrarianTab() {
    await this.page.click(this.aiLibrarianTab);
    await this.waitForLoadingComplete();
  }

  /**
   * Click sign out button
   */
  async clickSignOut() {
    await this.page.click(this.signOutButton);
  }

  /**
   * Verify that upgrade banner is visible (for free users)
   */
  async verifyUpgradeBannerVisible() {
    await expect(this.page.locator(this.upgradeBanner)).toBeVisible();
  }

  /**
   * Verify that upgrade banner is not visible (for pro/enterprise users)
   */
  async verifyUpgradeBannerNotVisible() {
    await expect(this.page.locator(this.upgradeBanner)).not.toBeVisible();
  }

  /**
   * Verify backup button state based on user plan
   */
  async verifyBackupButton(plan: 'free' | 'pro' | 'enterprise') {
    if (plan === 'free') {
      await expect(this.page.locator('button:has-text("Backup Data (Free)")')).not.toBeVisible();
      await expect(this.page.locator('button:has-text("Backup Data")')).toBeVisible();
    } else {
      await expect(this.page.locator(this.backupButton)).toBeVisible();
    }
  }

  /**
   * Verify export button state based on user plan
   */
  async verifyExportButton(plan: 'free' | 'pro' | 'enterprise') {
    if (plan === 'enterprise') {
      await expect(this.page.locator('button:has-text("Export Data (Ent)")')).toBeVisible();
    } else if (plan === 'pro') {
      await expect(this.page.locator('button:has-text("Export Data")')).toBeVisible();
    } else {
      await expect(this.page.locator(this.exportButton)).not.toBeVisible();
    }
  }

  /**
   * Get current active tab
   */
  async getActiveTab() {
    const activeTab = await this.page.locator('button[aria-selected="true"]').textContent();
    return activeTab?.trim() || '';
  }

  /**
   * Verify that a specific tab is active
   */
  async verifyActiveTab(tabName: string) {
    const activeTab = await this.getActiveTab();
    expect(activeTab).toBe(tabName);
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
    await this.page.waitForSelector(this.loadingSpinner, { state: 'hidden', timeout: 10000 })
      .catch(() => {
        // Loading spinner might not be present, which is okay
      });
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
   * Verify user information is displayed (if available)
   */
  async verifyUserInfo() {
    // Look for user info in the header or sidebar
    const userElements = await this.page.$$('[data-testid="user-info"], .user-info, .user-name, .user-email');
    expect(userElements.length).toBeGreaterThan(0);
  }

  /**
   * Verify dashboard is fully loaded and interactive
   */
  async verifyDashboardReady() {
    await this.verifyDashboardElements();
    await this.verifyActiveTab('Books'); // Default tab should be Books
    await expect(this.page.locator(this.booksTab)).toHaveAttribute('aria-selected', 'true');
  }

  /**
   * Mock Google Sheets API responses for dashboard data
   */
  async mockGoogleSheetsAPI() {
    await this.page.route('**/spreadsheets/**', (route) => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          spreadsheetId: 'test-sheet-id',
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
            },
            {
              properties: { title: 'Members' },
              data: [
                {
                  rowData: [
                    { values: [{ userEnteredValue: { stringValue: 'id' } }, { userEnteredValue: { stringValue: 'name' } }] },
                    { values: [{ userEnteredValue: { stringValue: '1' } }, { userEnteredValue: { stringValue: 'Test Member' } }] }
                  ]
                }
              ]
            },
            {
              properties: { title: 'Loans' },
              data: [
                {
                  rowData: [
                    { values: [{ userEnteredValue: { stringValue: 'id' } }, { userEnteredValue: { stringValue: 'bookId' } }] },
                    { values: [{ userEnteredValue: { stringValue: '1' } }, { userEnteredValue: { stringValue: '1' } }] }
                  ]
                }
              ]
            }
          ]
        }),
      });
    });
  }

  /**
   * Mock Firestore API responses for user data
   */
  async mockFirestoreAPI() {
    await this.page.route('**/firestore/**', (route) => {
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
}
