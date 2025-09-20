
// This file centralizes all API keys and configuration.
// IMPORTANT: In a real production app, these keys should be stored in environment variables, not committed to source control.

// --- FIREBASE CONFIGURATION ---
// You can get this from the Firebase Console:
// Project Settings > General > Your apps > Firebase SDK snippet > Config
export const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};


// --- GOOGLE API CONFIGURATION ---
// You can get these from the Google Cloud Console:
// APIs & Services > Credentials
export const googleApiConfig = {
    // This API key is used for non-authenticated API calls.
    apiKey: "YOUR_GOOGLE_CLOUD_API_KEY",
    // This Client ID is for the OAuth 2.0 flow.
    clientId: "YOUR_GOOGLE_CLOUD_OAUTH_CLIENT_ID.apps.googleusercontent.com",
    // The scopes define the permissions our app requests from the user.
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
    ],
};
