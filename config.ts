
// This file centralizes all API keys and configuration.
// IMPORTANT: API keys are now stored in environment variables for security.

// --- FIREBASE CONFIGURATION ---
// You can get this from the Firebase Console:
// Project Settings > General > Your apps > Firebase SDK snippet > Config
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};


// --- GOOGLE API CONFIGURATION ---
// You can get these from the Google Cloud Console:
// APIs & Services > Credentials
export const googleApiConfig = {
    // This API key is used for non-authenticated API calls.
    apiKey: import.meta.env.VITE_GOOGLE_API_KEY,
    // This Client ID is for the OAuth 2.0 flow.
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    // The scopes define the permissions our app requests from the user.
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
    ],
};
