# Gundeshapur Library Manager - Implementation Plan

## Overall Issues to Solve

1.  **Login Flow:** Welcome page is still shown → should always redirect to Dashboard after login.
2.  **Google Sheets Schema Coupling:** Hardcoded column names → breaks if renamed. Need dynamic header mapping.
3.  **Performance Bottlenecks:** Fetching all rows on every view load. No caching/pagination → slow for thousands of records.
4.  **Update/Delete Inefficiency:** Reads entire ID column to find row index. Must use ID-to-row-index cache.
5.  **Error Handling:** Weak error handling for API calls. Needs retries + exponential backoff.
6.  **Stripe Billing:** Not fully integrated. Need functional checkout, billing history, and admin tools for subscription management.
7.  **UI Needs Upgrade:** Dashboard needs to be redesigned with a modern, minimal style and include a left sidebar.

---

## Task Checklist

### Phase 1: Core Authentication & Routing Fixes
- [x] **Analyze Current Login Flow:**
    - [x] Examine `App.tsx` and `LandingPage.tsx` to understand the current routing and authentication state logic.
    - [x] Identify where the welcome page (`LandingPage`) is conditionally rendered.
- [ ] **Implement Direct Dashboard Redirect:**
    - [ ] Modify `App.tsx` or relevant authentication logic to ensure that upon successful Firebase Authentication (Google Sign-In), the user is *always* redirected to the `/dashboard` route.
    - [ ] Ensure the `LandingPage` is only accessible if the user is not authenticated, or remove its display post-login entirely as per the requirement ("skip welcome page").
    - [ ] Verify that the Firestore `sheetId` check and setup prompt (`SetupPage`) logic remains functional *within* the `DashboardPage` or a loading state before the main dashboard renders, not as a separate redirection step from a welcome page.
- [ ] **Test Login Flow:**
    - [ ] Test first-time login (no `sheetId` in Firestore) → should show setup prompt within/after dashboard load.
    - [ ] Test subsequent login (with `sheetId` in Firestore) → should go directly to the main dashboard content.

### Phase 1.5: Playwright Authentication Testing Implementation
- [x] **Install Playwright and Dependencies:**
    - [x] Install `@playwright/test` and required dependencies
    - [x] Set up TypeScript configuration for Playwright
- [x] **Set Up Playwright Configuration:**
    - [x] Create `playwright.config.ts` with multi-browser support
    - [x] Configure web server, timeouts, and reporting
    - [x] Set up environment-specific configuration with `.env.test`
- [x] **Create Test Environment Setup:**
    - [x] Set up test directory structure and fixtures
    - [x] Configure test environment variables
    - [x] Establish proper test isolation and cleanup
- [x] **Build Authentication Test Utilities:**
    - [x] Create Page Object Models (`LandingPage.ts`, `DashboardPage.ts`)
    - [x] Implement test fixtures (`testUsers.ts`) with mock data
    - [x] Develop helper utilities (`authHelpers.ts`) for common flows
    - [x] Set up comprehensive API mocking (Firebase, Google OAuth, Google Sheets, Google Drive)
- [x] **Implement Authentication Flow Tests:**
    - [x] Create main test suite (`auth-flow.spec.ts`) with 85 test cases
    - [x] Cover happy path scenarios (existing users, new users, admin users)
    - [x] Test error scenarios (OAuth failures, network errors, Firebase errors)
    - [x] Implement loading states and UX testing
    - [x] Add accessibility testing (ARIA labels, keyboard navigation)
    - [x] Create basic setup tests (`basic-setup.spec.ts`) for environment verification
- [x] **Add Test Scripts and CI Integration:**
    - [x] Configure npm scripts in `package.json` for test execution
    - [x] Set up scripts for different test modes (headed, debug, UI, report)
    - [x] Prepare CI/CD integration with GitHub Actions
- [x] **Document Testing Procedures:**
    - [x] Create comprehensive documentation (`tests/README.md`)
    - [x] Include setup instructions, test structure, and debugging guides
    - [x] Document best practices and troubleshooting procedures
- [ ] **Fix Failing Tests:**
    - [ ] **Address Selector Conflicts:**
        - [ ] Fix strict mode violations with multiple "Start for Free" buttons
        - [ ] Update selectors to be more specific (e.g., `header button:has-text("Start for Free")`)
        - [ ] Ensure unique element identification across all page objects
    - [ ] **Resolve Authentication Flow Issues:**
        - [ ] Fix OAuth mocking to properly simulate Firebase authentication responses
        - [ ] Ensure authentication state persistence works correctly
        - [ ] Verify redirect logic works for different user types (new, existing, admin)
    - [ ] **Fix Element Not Found Errors:**
        - [ ] Update dashboard element selectors to match actual UI components
        - [ ] Ensure proper waiting mechanisms for dynamic content
        - [ ] Fix loading spinner detection and handling
    - [ ] **Improve Test Reliability:**
        - [ ] Add proper error handling and retry mechanisms
        - [ ] Ensure consistent test environment setup and cleanup
        - [ ] Fix cross-browser compatibility issues
    - [ ] **Validate Test Environment:**
        - [ ] Run basic setup tests to verify environment is working
        - [ ] Ensure dev server is properly configured for testing
        - [ ] Verify all mocked API responses are functioning correctly

### Phase 2: Google Sheets API & Data Handling Improvements
- [x] **Analyze Current Google Sheets Integration:**
    - [x] Review `googleApi.ts` and `libraryApi.ts` for hardcoded column names (e.g., "id", "title", "author").
    - [x] Identify functions that perform reads (e.g., `getBooks`, `getMembers`, `getLoans`) and writes (e.g., `addBook`, `updateBook`, `deleteBook`).
- [x] **Implement Dynamic Header Mapping:**
    - [x] Create a utility or modify existing API functions to first fetch the header row of a given sheet tab (Books, Members, Loans).
    - [x] Map these dynamic headers to a consistent internal schema (e.g., an interface or type定义 in `types.ts`). This internal schema will be used by the frontend components.
    - [x] Update all data fetching and manipulation functions in `libraryApi.ts` to use this dynamic mapping. For example, instead of `row[0]` for 'id', it would be `row[headerMap.id]`.
- [ ] **Implement Caching & Pagination:**
    - [ ] **Pagination Logic:**
        - [ ] Modify API functions in `libraryApi.ts` to accept `page` and `pageSize` parameters.
        - [ ] Use Google Sheets API query parameters (e.g., `offset` for pagination, or fetch all and then paginate client-side if API limits are complex for this use case initially, though server-side is better for performance).
        - [ ] Update `useSortableTable.tsx` or create new hooks to manage paginated state (current page, items per page).
        - [ ] Modify table components (`BooksView.tsx`, `MembersView.tsx`, `LoansView.tsx`) to display pagination controls and fetch data accordingly.
    - [ ] **Caching Strategy:**
        - [ ] Implement a simple in-memory cache (e.g., an object in `libraryApi.ts` or a dedicated cache module) to store fetched data for each sheet tab.
        - [ ] Cache keys could be `${sheetId}_${tabName}`.
        - [ ] Implement a cache invalidation strategy (e.g., time-based, or invalidate on create/update/delete operations).
- [ ] **Optimize Update/Delete Operations:**
    - [ ] **ID-to-Row-Index Cache:**
        - [ ] When fetching data (either a full set or a paginated set), build and maintain a cache that maps record IDs to their corresponding Google Sheet row index (remembering that header row is index 0, data starts at index 1, and row index in API is 1-based).
        - [ ] This cache can be part of the data fetching response or stored separately.
    - [ ] **Modify Update/Delete Functions:**
        - [ ] Update functions like `updateBook` and `deleteBook` in `libraryApi.ts` to use the ID-to-row-index cache to directly target the correct row for updates/deletion, instead of scanning the entire ID column.
        - [ ] Ensure the cache is updated after successful write operations.
- [ ] **Test Data Handling:**
    - [ ] Test with a Google Sheet that has standard column names.
    - [ ] Test with a Google Sheet that has renamed columns (e.g., "BookID" instead of "id", "FullName" instead of "name") to ensure dynamic mapping works.
    - [ ] Test performance with a large dataset (if possible, mock this) to observe pagination and caching benefits.
    - [ ] Test update/delete operations to ensure they are fast and target the correct rows.

### Phase 3: Enhanced Error Handling
- [ ] **Analyze Current Error Handling:**
    - [ ] Review `googleApi.ts`, `libraryApi.ts`, and components for `try...catch` blocks and how errors are currently displayed (e.g., `Toast` component).
- [ ] **Implement Retry Logic with Exponential Backoff:**
    - [ ] Create a utility function (e.g., in `utils.ts` or a new `errorHandling.ts`) that wraps API calls.
    - [ ] This utility should implement a retry mechanism:
        - [ ] On failure, wait for a certain delay.
        - [ ] Increase the delay exponentially with each retry (e.g., 1s, 2s, 4s, 8s).
        - [ ] Have a maximum number of retries (e.g., 3-5).
    - [ ] Apply this wrapper to critical Google Sheets API calls (reads and writes).
- [ ] **Standardize User-Friendly Error Messages:**
    - [ ] Define a set of common error types (e.g., 'NETWORK_ERROR', 'SHEET_NOT_FOUND', 'PERMISSION_DENIED', 'INVALID_DATA').
    - [ ] Map technical API errors to these user-friendly types.
    - [ ] Update the `Toast` component or error display logic to show these friendly messages.
    - [ ] Ensure errors from async operations in components are properly caught and passed to the error handling/display logic.
- [ ] **Test Error Handling:**
    - [ ] Simulate network failures (e.g., disable network temporarily).
    - [ ] Test with invalid `sheetId`.
    - [ ] Test with insufficient permissions on a Google Sheet.
    - [ ] Verify that retries occur and that users see clear, actionable error messages.

### Phase 4: Stripe Billing Integration
- [ ] **Analyze Current Stripe Setup:**
    - [ ] Check `package.json` for Stripe SDK.
    - [ ] Look for any existing Stripe-related code or placeholders (e.g., in `SettingsPage.tsx`, `AdminPage.tsx`).
    - [ ] Review `types.ts` for any subscription-related types.
- [ ] **Frontend: Checkout & Billing Management (Client):**
    - [ ] **SettingsPage Enhancement:**
        - [ ] Add UI elements to display current subscription plan (fetch from Firestore user profile).
        - [ ] Add "Upgrade" / "Downgrade" / "Subscribe" buttons that trigger Stripe Checkout.
        - [ ] Implement Stripe Checkout integration:
            - [ ] Create a function (e.g., in a new `stripeApi.ts` or within `SettingsPage.tsx`) that calls a backend endpoint (see below) to create a Stripe Checkout Session.
            - [ ] Redirect the user to the Stripe Checkout URL.
            - [ ] Handle the `stripe.success` and `stripe.cancel` URL callbacks (e.g., in `App.tsx` routing) to show confirmation messages.
        - [ ] Add a "Billing History" section to display past invoices. This will involve fetching invoice data from a backend endpoint.
- [ ] **Backend: Stripe API Endpoints (Conceptual - might need a simple Node.js/Python backend or Firebase Functions if not already present):**
    - [ ] *Note: The current project seems frontend-heavy (Vite React). If a backend is missing, this is a significant addition. For now, I'll assume we can integrate Stripe using client-side only for Checkout and webhooks for updates, or use Firebase Callable Functions.*
    - [ ] **Create Checkout Session Endpoint:**
        - [ ] An endpoint (e.g., Firebase Callable Function) that takes `priceId` (for the selected plan) and `userId` (from Firebase Auth).
        - [ ] It creates a Stripe Checkout Session with the appropriate line items and success/cancel URLs.
        - [ ] Returns the `sessionId` to the frontend.
    - [ ] **Webhook Handler:**
        - [ ] A secure endpoint (e.g., another Firebase Function) to listen to Stripe webhooks (`checkout.session.completed`, `invoice.paid`, `customer.subscription.updated`, `customer.subscription.deleted`).
        - [ ] Verify webhook signatures.
        - [ ] Update the user's `subscriptionPlan` and other relevant metadata in Firestore based on webhook events.
    - [ ] **Billing History Endpoint:**
        - [ ] An endpoint to fetch a list of invoices for a given customer ID (stored in Firestore).
- [ ] **Frontend: Admin Billing Tools:**
    - [ ] **AdminPage Enhancement:**
        - [ ] Add a section/tab for "Subscription Management" or "Billing".
        - [ ] Display a list of all users with their subscription plans, status (active, canceled, past_due), and customer IDs.
        - [ ] Implement functionality to:
            - [ ] View a user's detailed billing history (invoices, payments).
            - [ ] Manually adjust a subscription (e.g., apply a discount, change plan - though this is often better done through customer-initiated checkout).
            - [ ] Cancel a subscription (immediately or at period end).
            - [ ] Issue refunds for specific payments/invoices.
        - [ ] Add a "Revenue Breakdown" view, showing total revenue and breakdown by subscription tier (Free, Pro, Enterprise). This data might need to be aggregated in Firestore or calculated on the fly.
- [ ] **Test Stripe Integration:**
    - [ ] Use Stripe test mode.
    - [ ] Test the complete subscription flow: from user initiating checkout, successful payment, webhook updating Firestore, and UI reflecting the new plan.
    - [ ] Test billing history display.
    - [ ] Test admin functions for viewing and managing user subscriptions (using test customer data).
    - [ ] Test webhook handling for various events.

### Phase 5: UI/UX Redesign - Dashboard
- [ ] **Analyze Current Dashboard Layout:**
    - [ ] Review `Layout.tsx`, `DashboardPage.tsx`, `DashboardHeader.tsx`, and individual view components (`BooksView.tsx`, etc.).
- [ ] **Design New Dashboard Structure (Minimalist, Modern):**
    - [ ] **Left Sidebar:**
        - [ ] Create a new `Sidebar.tsx` component.
        - [ ] Include navigation links: "Dashboard" (overview/stats), "Books", "Members", "Loans", "Settings".
        - [ ] Potentially include user profile info (name, email, plan) at the bottom.
        - [ ] Ensure it's responsive (collapsible on smaller screens if needed).
    - [ ] **Main Content Area:**
        - [ ] The main content area will now be to the right of the sidebar.
        - [ ] `DashboardPage.tsx` will likely render the `Sidebar` and a main content area that switches between `DashboardStats` (for the "Dashboard" link), `BooksView`, `MembersView`, `LoansView`, and `SettingsPage`.
- [ ] **Redesign Dashboard Components:**
    - [ ] **DashboardHeader.tsx:** Integrate into the new layout, possibly as a top bar within the main content area, containing page title, global search, and user actions.
    - [ **DashboardStats.tsx:** Give it a cleaner, more modern look using Tailwind CSS. Use cards, clearer typography, and potentially simple charts if a charting library is added (or stick to key metrics).
    - [ ] **Table Views (`BooksView.tsx`, `MembersView.tsx`, `LoansView.tsx`):**
        - [ ] Redesign tables for better readability (e.g., zebra striping, clear hover effects, appropriate padding).
        - [ ] Ensure modals for Add/Edit/Delete are clean and modern.
        - [ ] Integrate search and filter controls more seamlessly into the new layout.
- [ ] **Implement the Redesign:**
    - [ ] Create/update `Sidebar.tsx`.
    - [ ] Modify `Layout.tsx` or `DashboardPage.tsx` to incorporate the sidebar and new routing structure within the dashboard.
    - [ ] Apply new Tailwind CSS classes to all affected components for a consistent, minimalist theme.
    - [ ] Ensure responsiveness across different screen sizes.
- [ ] **Test UI Redesign:**
    - [ ] Verify all dashboard pages render correctly with the new layout.
    - [ ] Test sidebar navigation.
    - [ ] Check responsiveness on desktop and mobile viewports in browser dev tools.
    - [ ] Ensure all existing functionality (CRUD, sorting, filtering) still works within the new UI.

### Phase 6: Final Review & Cleanup
- [ ] **Cross-Functional Testing:**
    - [ ] Test the entire user journey from login → setup (if new) → using all dashboard features → managing subscription → admin actions.
    - [ ] Pay special attention to interactions between new features (e.g., does changing subscription plan affect any UI elements correctly?).
- [ ] **Code Review & Refinement:**
    - [ ] Read through all modified and new code. Ensure consistency, readability, and adherence to best practices.
    - [ ] Check for any redundant code or missed optimizations.
    - [ ] Ensure TypeScript types are accurate and comprehensive.
- [ ] **Update Documentation (if any):**
    - [ ] Briefly update `README.md` if there are significant changes to setup or features.
- [ ] **Final Bug Hunt:**
    - [ ] Try to break the application. Look for edge cases in UI, data handling, and error scenarios.

---
This plan provides a structured approach to tackling the identified issues. Each phase builds upon the previous one.
