/**
 * Server-side Firebase Admin & Firestore Accessor
 * 
 * Safe for Next.js App Router API Routes & Vitest.
 * Authenticates via environment variables in production (Vercel / Cloud Run).
 * Falls back gracefully to in-memory simulated persistence when credentials
 * are pending configuration by the network owner.
 */

import admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';
import type { Auth } from 'firebase-admin/auth';

let adminApp: App | null = null;

export function getAdminApp(): App | null {
  if (adminApp) return adminApp;

  try {
    const adminObj = admin as any;
    const apps = adminObj?.apps || adminObj?.default?.apps;

    if (apps && Array.isArray(apps) && apps.length > 0 && apps[0]) {
      adminApp = apps[0];
      return adminApp;
    }

    const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    const projectId =
      process.env.FIREBASE_PROJECT_ID ||
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
      'talqanet-cf3e1';

    if (serviceAccountJson) {
      let parsed;
      if (serviceAccountJson.trim().startsWith('{')) {
        parsed = JSON.parse(serviceAccountJson);
      } else {
        const decoded = Buffer.from(serviceAccountJson, 'base64').toString('utf-8');
        parsed = JSON.parse(decoded);
      }
      adminApp = (adminObj?.initializeApp || adminObj?.default?.initializeApp)({
        credential: (adminObj?.credential || adminObj?.default?.credential)?.cert(parsed),
        projectId: parsed.project_id || projectId,
      });
      return adminApp;
    }

    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey) {
      adminApp = (adminObj?.initializeApp || adminObj?.default?.initializeApp)({
        credential: (adminObj?.credential || adminObj?.default?.credential)?.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        projectId,
      });
      return adminApp;
    }

    // In local dev/testing without service account, do not throw, return null
    return null;
  } catch (error) {
    console.warn('[firebaseAdmin] Firebase Admin fallback mode:', (error as Error).message);
    return null;
  }
}

export function getAdminFirestore(): Firestore | null {
  const app = getAdminApp();
  if (!app) return null;
  try {
    const adminObj = admin as any;
    return (adminObj?.firestore || adminObj?.default?.firestore)?.(app) || null;
  } catch {
    return null;
  }
}

export function getAdminAuth(): Auth | null {
  const app = getAdminApp();
  if (!app) return null;
  try {
    const adminObj = admin as any;
    return (adminObj?.auth || adminObj?.default?.auth)?.(app) || null;
  } catch {
    return null;
  }
}
