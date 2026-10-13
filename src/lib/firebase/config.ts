import { initializeApp, getApps, getApp, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';
import { getAuth, type Auth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyDa0ez5KUBarGRXp5_iB21yI9nS5BDInsw',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'talqanet-cf3e1.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'talqanet-cf3e1',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'talqanet-cf3e1.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '980039658611',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:980039658611:web:01c5062c080ee345efce06',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-M28S36PY09',
};

// Singleton initialization safe for Next.js App Router (SSR & Client)
let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!app) {
    app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  }
  return app;
}

export function getFirebaseFirestore(): Firestore {
  if (!db) {
    db = getFirestore(getFirebaseApp());
  }
  return db;
}

export function getFirebaseAuth(): Auth {
  if (!auth) {
    auth = getAuth(getFirebaseApp());
  }
  return auth;
}

export { firebaseConfig };
