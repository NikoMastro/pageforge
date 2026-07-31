import { initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAnalytics, type Analytics, isSupported } from "firebase/analytics";

// Firebase is only used when running against the original Firestore/IAP stack.
// The public showcase runs auth-free on MongoDB, so these are env-driven placeholders.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? "your-firebase-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? "your-gcp-project.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? "your-gcp-project",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? "your-gcp-project.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? "000000000000",
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? "1:000000000000:web:0000000000000000000000",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID ?? "G-XXXXXXXXXX",
} as const;

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let analytics: Analytics | undefined;
const googleProvider = new GoogleAuthProvider();
const FIRESTORE_DATABASE_ID = "pageforge-metadata" as const;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export function getFirestoreDb(): Firestore {
  if (!db) {
    // Use the named Firestore database configured in firebase.json
    db = getFirestore(getFirebaseApp(), FIRESTORE_DATABASE_ID);
  }
  return db;
}

export async function getFirebaseAnalytics(): Promise<Analytics | undefined> {
  if (analytics) return analytics;
  try {
    if (await isSupported()) {
      analytics = getAnalytics(getFirebaseApp());
      return analytics;
    }
  } catch {
    // no-op on environments without analytics support
  }
  return undefined;
}

export { googleProvider };
