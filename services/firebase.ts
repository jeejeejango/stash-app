import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
// Fix: Import getAuth and GoogleAuthProvider to enable Firebase Authentication.
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// ====================================================================================
// CRITICAL: ACTION REQUIRED TO FIX AUTHENTICATION
// The error "Firebase: Error (auth/unauthorized-domain)" means the domain you are
// running this app on has not been whitelisted in your Firebase project.
//
// TO FIX THIS:
// 1. Go to the Firebase Console (https://console.firebase.google.com/).
// 2. Select your project.
// 3. Go to "Authentication" from the left-hand menu.
// 4. Click the "Settings" tab (or "Sign-in method" tab in older versions).
// 5. Under the "Authorized domains" section, click "Add domain".
// 6. Enter the domain where your application is hosted and click "Add".
//    (Note: 'localhost' is typically authorized by default for local development).
//
// Additionally, you MUST replace the placeholder configuration below with your
// own Firebase project's credentials. You can find these in your
// Firebase project's settings under "Project settings" > "General".
// ====================================================================================
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
  measurementId: process.env.FIREBASE_MEASUREMENT_ID,
};

if (!firebaseConfig.apiKey) {
  console.error(
    `*****************************************************************\n` +
      `*               FIREBASE CONFIGURATION IS MISSING!              *\n` +
      `* Please update the firebaseConfig object in 'services/firebase.ts' *\n` +
      `* with your project's credentials to enable authentication.     *\n` +
      `*****************************************************************`
  );
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// Fix: Initialize auth and googleProvider.
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Fix: Export auth and googleProvider.
export { app, db, auth, googleProvider };
