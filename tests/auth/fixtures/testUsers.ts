import { User } from '../../../types';

/**
 * Test user fixtures for authentication testing
 * These fixtures represent different user scenarios for testing the authentication flow
 */

export const TEST_USERS = {
  // New user without sheetId - should be redirected to SetupPage
  NEW_USER: {
    uid: 'test-new-user-123',
    email: 'newuser@test.com',
    displayName: 'New Test User',
    role: 'user',
    sheetId: null,
    plan: 'free',
    subscriptionStatus: 'active',
  } as User,

  // Existing user with sheetId - should be redirected to DashboardPage
  EXISTING_USER: {
    uid: 'test-existing-user-456',
    email: 'existinguser@test.com',
    displayName: 'Existing Test User',
    role: 'user',
    sheetId: 'test-sheet-id-789',
    plan: 'free',
    subscriptionStatus: 'active',
  } as User,

  // Admin user - should be redirected to AdminPage
  ADMIN_USER: {
    uid: 'test-admin-user-789',
    email: 'admin@test.com',
    displayName: 'Admin Test User',
    role: 'admin',
    sheetId: 'admin-sheet-id-101',
    plan: 'enterprise',
    subscriptionStatus: 'active',
  } as User,

  // Pro user
  PRO_USER: {
    uid: 'test-pro-user-101',
    email: 'prouser@test.com',
    displayName: 'Pro Test User',
    role: 'user',
    sheetId: 'pro-sheet-id-202',
    plan: 'pro',
    subscriptionStatus: 'active',
  } as User,
};

/**
 * Mock Firebase user objects for authentication testing
 */
export const MOCK_FIREBASE_USERS = {
  NEW_USER: {
    uid: 'test-new-user-123',
    email: 'newuser@test.com',
    displayName: 'New Test User',
    emailVerified: true,
    isAnonymous: false,
    providerData: [{
      uid: 'test-new-user-123',
      email: 'newuser@test.com',
      displayName: 'New Test User',
      photoURL: null,
      providerId: 'google.com',
    }],
    refreshToken: 'mock-refresh-token',
    accessToken: 'mock-access-token',
  },

  EXISTING_USER: {
    uid: 'test-existing-user-456',
    email: 'existinguser@test.com',
    displayName: 'Existing Test User',
    emailVerified: true,
    isAnonymous: false,
    providerData: [{
      uid: 'test-existing-user-456',
      email: 'existinguser@test.com',
      displayName: 'Existing Test User',
      photoURL: null,
      providerId: 'google.com',
    }],
    refreshToken: 'mock-refresh-token',
    accessToken: 'mock-access-token',
  },

  ADMIN_USER: {
    uid: 'test-admin-user-789',
    email: 'admin@test.com',
    displayName: 'Admin Test User',
    emailVerified: true,
    isAnonymous: false,
    providerData: [{
      uid: 'test-admin-user-789',
      email: 'admin@test.com',
      displayName: 'Admin Test User',
      photoURL: null,
      providerId: 'google.com',
    }],
    refreshToken: 'mock-refresh-token',
    accessToken: 'mock-access-token',
  },
};

/**
 * Google OAuth mock responses
 */
export const MOCK_GOOGLE_OAUTH_RESPONSES = {
  SUCCESS: {
    credential: {
      accessToken: 'mock-google-access-token',
      idToken: 'mock-google-id-token',
    },
    user: {
      uid: 'test-user-123',
      email: 'testuser@gmail.com',
      displayName: 'Test User',
      photoURL: 'https://example.com/photo.jpg',
    },
  },

  ERROR: {
    error: {
      code: 'auth/popup-closed-by-user',
      message: 'The popup has been closed by the user before finalizing the sign-in.',
    },
  },

  NETWORK_ERROR: {
    error: {
      code: 'auth/network-request-failed',
      message: 'A network error occurred.',
    },
  },
};
