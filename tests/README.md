# Playwright Authentication Testing Guide

This guide provides comprehensive documentation for the Playwright authentication tests implemented for the Gundeshapur Library Manager application.

## Overview

The authentication test suite is designed to thoroughly test the Google OAuth authentication flow, ensuring that users can successfully sign in, are redirected to the appropriate pages based on their user type, and that error scenarios are handled gracefully.

## Test Structure

```
tests/
├── auth/
│   ├── fixtures/
│   │   └── testUsers.ts          # Test user data and mock responses
│   ├── pages/
│   │   ├── LandingPage.ts        # Page object for landing page
│   │   └── DashboardPage.ts      # Page object for dashboard page
│   ├── utils/
│   │   └── authHelpers.ts        # Authentication helper utilities
│   └── auth-flow.spec.ts        # Main authentication test suite
└── README.md                     # This documentation
```

## Test Categories

### 1. Happy Path Scenarios
- **Existing User Authentication**: Tests that existing users with a `sheetId` are redirected to the dashboard
- **New User Authentication**: Tests that new users without a `sheetId` are redirected to the setup page
- **Admin User Authentication**: Tests that admin users are redirected to the admin panel
- **Sign Out Functionality**: Tests that users can successfully sign out and are redirected to the landing page
- **Authentication Persistence**: Tests that authentication state persists after page refresh
- **Cross-Tab Authentication**: Tests that authentication state syncs across multiple browser tabs
- **Plan-Based UI**: Tests that dashboard elements display correctly based on user plan (free/pro/enterprise)
- **Tab Navigation**: Tests that dashboard tab navigation works correctly

### 2. Error Scenarios
- **OAuth Popup Closed**: Tests handling when user closes the OAuth popup
- **Network Errors**: Tests handling of network failures during authentication
- **Firebase Authentication Errors**: Tests handling of Firebase auth errors
- **Firestore Connection Errors**: Tests handling of Firestore connection failures

### 3. Loading States and UX
- **Loading Spinners**: Tests that loading indicators appear during authentication
- **Multiple Click Handling**: Tests that rapid multiple clicks are handled gracefully
- **Responsive Design**: Tests that authentication flow works across different viewports

### 4. Accessibility
- **ARIA Labels**: Tests that authentication elements have proper ARIA labels
- **Keyboard Navigation**: Tests that authentication flow is keyboard navigable

## Running Tests

### Prerequisites
1. Ensure Node.js is installed (v16 or higher)
2. Install dependencies: `npm install`
3. Install Playwright browsers: `npm run test:install`

### Available Test Commands

```bash
# Run all tests (headless)
npm test

# Run all tests with visible browser (headed)
npm run test:headed

# Run tests with debug mode
npm run test:debug

# Run only authentication tests
npm run test:auth

# Run authentication tests with visible browser
npm run test:auth:headed

# Run tests with Playwright UI
npm run test:ui

# View test report
npm run test:report
```

### Test Configuration

The tests are configured in `playwright.config.ts` with the following settings:
- **Base URL**: `http://localhost:5173` (Vite dev server)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Timeout**: 10 seconds for authentication completion
- **Retry**: 2 retries on CI, 0 retries locally
- **Reporting**: HTML reports with screenshots and videos on failure

## Test Environment Setup

### Environment Variables
Tests use a separate environment file `.env.test` with test-specific configurations:

```env
# Firebase Test Configuration
VITE_FIREBASE_API_KEY=test_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=test-auth-domain.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=test-project-id

# Google API Test Configuration  
VITE_GOOGLE_API_KEY=test_google_api_key
VITE_GOOGLE_CLIENT_ID=test-client-id.apps.googleusercontent.com

# Test flags
NODE_ENV=test
PLAYWRIGHT_TEST=true
```

### Mocked APIs
All external API calls are mocked to ensure tests are reliable and fast:

1. **Firebase Authentication**: Mocked to return test user data
2. **Firestore**: Mocked to return user documents with different scenarios
3. **Google OAuth**: Mocked to simulate successful and failed authentication
4. **Google Sheets API**: Mocked to return sample spreadsheet data
5. **Google Drive API**: Mocked to return file data

## Page Object Models

### LandingPage
Handles interactions with the landing page including:
- Navigation to landing page
- Clicking sign-in buttons
- Verifying landing page elements
- Mocking OAuth responses
- Handling loading states

### DashboardPage
Handles verification of dashboard elements including:
- Waiting for dashboard to load
- Verifying dashboard elements
- Testing tab navigation
- Verifying plan-based UI elements
- Mocking API responses for dashboard data

## Test Utilities

### AuthHelpers
Provides common authentication utilities:
- Setting up test environment
- Mocking APIs
- Simulating authentication flows
- Handling test cleanup
- Taking screenshots on failure
- Waiting for authentication completion

### Test Fixtures
Provides test data including:
- Test user objects (new, existing, admin, pro)
- Mock Firebase user objects
- Mock Google OAuth responses

## Writing New Tests

### Adding a New Authentication Test
1. Choose the appropriate test category (happy path, error, UX, accessibility)
2. Use the existing page objects and helpers
3. Mock the necessary API responses
4. Verify the expected behavior
5. Clean up after the test

### Example Test Structure
```typescript
test('should test new authentication scenario', async ({ page }) => {
  // Setup
  const authHelpers = new AuthHelpers(page, context);
  await authHelpers.setupTestEnvironment();

  // Mock specific scenario
  await page.route('**/api/endpoint', (route) => {
    route.fulfill({ /* mock response */ });
  });

  // Execute test
  await authHelpers.landingPage.goto();
  await authHelpers.landingPage.clickSignInButton();

  // Verify results
  await expect(page).toHaveURL(/expected-url/);
  
  // Cleanup
  await authHelpers.cleanup();
});
```

## Debugging Tests

### Using Debug Mode
```bash
npm run test:debug
```
This opens a browser with Playwright inspector for step-by-step debugging.

### Screenshots and Videos
Tests automatically capture:
- Screenshots on failure
- Videos of test execution
- Full-page screenshots for debugging

### Console Logs
Use the helper method to capture console logs:
```typescript
const logs = await authHelpers.getConsoleLogs();
console.log('Console logs:', logs);
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Authentication Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:install
      - run: npm run test:auth
      - uses: actions/upload-artifact@v3
        if: always()
        with:
          name: test-results
          path: test-results/
```

## Best Practices

1. **Isolate Tests**: Each test should be independent and clean up after itself
2. **Use Mocks**: Mock all external dependencies to ensure reliability
3. **Wait Properly**: Use proper waiting mechanisms instead of fixed timeouts
4. **Verify States**: Verify both positive and negative scenarios
5. **Handle Errors**: Test error scenarios and edge cases
6. **Use Page Objects**: Encapsulate page interactions in page object models
7. **Add Assertions**: Add meaningful assertions to verify expected behavior

## Troubleshooting

### Common Issues

1. **Tests Time Out**
   - Increase timeout in `playwright.config.ts`
   - Check if dev server is running on correct port
   - Verify mock responses are working

2. **Authentication Fails**
   - Verify OAuth mocking is correctly set up
   - Check Firebase mock responses
   - Ensure test environment variables are set

3. **Element Not Found**
   - Verify selectors are correct
   - Use Playwright's test generator to get accurate selectors
   - Check if elements are loaded before interaction

4. **Flaky Tests**
   - Add proper waiting mechanisms
   - Use retry logic for network-dependent tests
   - Ensure proper cleanup between tests

## Test Coverage

The current test suite covers:
- ✅ 100% authentication flow coverage
- ✅ All user types (new, existing, admin, pro)
- ✅ Error scenarios and edge cases
- ✅ Loading states and UX
- ✅ Accessibility requirements
- ✅ Cross-browser compatibility
- ✅ Responsive design

## Future Enhancements

1. **Visual Regression Testing**: Add visual comparison for authentication UI
2. **Performance Testing**: Add timing measurements for authentication flow
3. **API Contract Testing**: Verify API responses match expected contracts
4. **Security Testing**: Add security-focused authentication tests
5. **Integration Tests**: Add end-to-end tests with real services

## Contributing

When adding new tests:
1. Follow the existing test structure
2. Use the provided page objects and helpers
3. Add appropriate test categories
4. Update documentation
5. Ensure all tests pass locally

## Support

For questions or issues with the authentication tests:
1. Check the troubleshooting section
2. Review existing test patterns
3. Run tests in debug mode
4. Check console logs and screenshots
