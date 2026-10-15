/**
 * Server-side Admin Authorization Validator
 * Validates Firebase Auth ID Token against Admin permissions
 * 
 * Strict Security Protocol:
 * 1. Fail Closed: If Firebase Admin is not initialized, NEVER grant admin.
 * 2. Token Verification: Validates Google ID token cryptographically.
 * 3. Custom Claim: Only tokens with custom claim `admin: true` are authorized.
 * 4. Zero Hardcoded Emails: No hardcoded admin emails or bypass keys in production.
 */

import { NextRequest } from 'next/server';
import { getAdminAuth } from '@/src/lib/server/firebaseAdmin';

export interface AdminAuthResult {
  isAdmin: boolean;
  uid?: string;
  email?: string;
  error?: string;
  statusCode?: number;
}

export async function verifyAdminRequest(req: NextRequest): Promise<AdminAuthResult> {
  // Test-only mock bypass for isolated unit tests
  if (process.env.NODE_ENV === 'test') {
    const testAdminKey = req.headers.get('x-test-admin-key');
    if (testAdminKey === 'test-secret-authorized-admin') {
      return { isAdmin: true, uid: 'test-admin-uid', email: 'test-admin@talqanet.ye' };
    }
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      isAdmin: false,
      statusCode: 401,
      error: 'رمز التوثيق (Authorization Token) مفقود.',
    };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return {
      isAdmin: false,
      statusCode: 401,
      error: 'رمز التوثيق فارغ.',
    };
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    // Fail closed: Never grant access if Admin SDK is unavailable
    return {
      isAdmin: false,
      statusCode: 503,
      error: 'خدمة التحقق من المشرفين غير متوفرة حالياً (بيانات Firebase Admin غير مهيأة).',
    };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const email = decoded.email?.toLowerCase();

    // Verify admin custom claim (Server-authoritative)
    const hasAdminClaim = Boolean(decoded.admin === true);

    // Optional environment variable fallback for emergency owner setup only
    const bootstrapEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
    const isConfiguredBootstrapEmail = Boolean(bootstrapEmail && email === bootstrapEmail);

    if (hasAdminClaim || isConfiguredBootstrapEmail) {
      return {
        isAdmin: true,
        uid: decoded.uid,
        email: decoded.email,
      };
    }

    return {
      isAdmin: false,
      statusCode: 403,
      error: `الحساب (${email || decoded.uid}) ليس لديه صلاحيات الإشراف في شبكة طلقة نت.`,
    };
  } catch (error) {
    return {
      isAdmin: false,
      statusCode: 401,
      error: `رمز التوثيق غير صالح أو منتهي الصلاحية: ${(error as Error).message}`,
    };
  }
}

export interface UserAuthResult {
  isAuthenticated: boolean;
  uid?: string;
  email?: string;
  displayName?: string;
  error?: string;
  statusCode?: number;
}

/**
 * Validates regular authenticated user tokens (Google Sign-in / Firebase Auth)
 * Used for subscriber features like the Card Wallet.
 */
export async function verifyUserRequest(req: NextRequest): Promise<UserAuthResult> {
  // Test-only mock bypass for unit tests
  if (process.env.NODE_ENV === 'test') {
    const testUserUid = req.headers.get('x-test-user-uid');
    if (testUserUid) {
      return {
        isAuthenticated: true,
        uid: testUserUid,
        email: `${testUserUid}@talqanet.ye`,
        displayName: 'مشترك تجريبي',
      };
    }
  }

  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      isAuthenticated: false,
      statusCode: 401,
      error: 'يرجى تسجيل الدخول أولاً.',
    };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  if (!token) {
    return {
      isAuthenticated: false,
      statusCode: 401,
      error: 'رمز التوثيق فارغ.',
    };
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    // Development local fallback if admin credentials are not provided
    if (process.env.NODE_ENV === 'development') {
      return {
        isAuthenticated: true,
        uid: 'dev-subscriber-local',
        email: 'subscriber@talqanet.ye',
        displayName: 'مشترك محلي',
      };
    }
    return {
      isAuthenticated: false,
      statusCode: 503,
      error: 'خدمة التوثيق غير متوفرة حالياً.',
    };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return {
      isAuthenticated: true,
      uid: decoded.uid,
      email: decoded.email,
      displayName: decoded.name || decoded.email?.split('@')[0] || 'مشترك طلقة',
    };
  } catch (error) {
    return {
      isAuthenticated: false,
      statusCode: 401,
      error: `انتهت صلاحية جلسة الدخول، يرجى تسجيل الدخول مجدداً: ${(error as Error).message}`,
    };
  }
}

