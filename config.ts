
// This file centralizes all API keys and configuration.
// IMPORTANT: In a real production app, these keys should be stored in environment variables, not committed to source control.

// --- FIREBASE CONFIGURATION ---
// You can get this from the Firebase Console:
// Project Settings > General > Your apps > Firebase SDK snippet > Config
export const firebaseConfig = {
  // apiKey: "YOUR_FIREBASE_API_KEY",
  // authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  // projectId: "YOUR_PROJECT_ID",
  // storageBucket: "YOUR_PROJECT_ID.appspot.com",
  // messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  // appId: "YOUR_APP_ID"
  apiKey: "AIzaSyBbtKVoZ7pc6Ka0zjE9VhODiibilwfrYds",
  authDomain: "gundeshapurapp.firebaseapp.com",
  projectId: "gundeshapurapp",
  storageBucket: "gundeshapurapp.firebasestorage.app",
  messagingSenderId: "712479653466",
  appId: "1:712479653466:web:6401892af1c5ce66c42263",
  measurementId: "G-VQHYVSRPG3"
};


// --- GOOGLE API CONFIGURATION ---
// You can get these from the Google Cloud Console:
// APIs & Services > Credentials
export const googleApiConfig = {
    // This API key is used for non-authenticated API calls.
    apiKey: "AIzaSyAfqF7H7zu_jF5H7fuCFox-1AkgYqJp7Dw",
    // This Client ID is for the OAuth 2.0 flow.
    clientId: "839939125126-juive3cpl9im1fstav11pgpr40nbt0fu.apps.googleusercontent.com",
    // The scopes define the permissions our app requests from the user.
    scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive.file'
    ],
};
