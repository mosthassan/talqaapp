/**
 * Server-side Admin Authorization Validator
 * Validates Firebase Auth ID Token against Admin permissions
 */

import { NextRequest } from 'next/server';
import { getAdminAuth } from '@/src/lib/server/firebaseAdmin';

// Default authorized admin emails (configurable via environment variables)
const CONFIGURED_ADMIN_EMAILS = (
  process.env.ADMIN_EMAILS ||
  'admin@talqanet.com,atheer.ye1@gmail.com,owner@talqanet.com'
)
  .split(',')
  .map((e) => e.trim().toLowerCase());

export interface AdminAuthResult {
  isAdmin: boolean;
  uid?: string;
  email?: string;
  error?: string;
}

export async function verifyAdminRequest(req: NextRequest): Promise<AdminAuthResult> {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    // Check for cookie or dev bypass
    const adminKey = req.headers.get('x-admin-key');
    if (adminKey && process.env.ADMIN_SECRET_KEY && adminKey === process.env.ADMIN_SECRET_KEY) {
      return { isAdmin: true, email: 'system-key-admin' };
    }
    return { isAdmin: false, error: 'رمز التوثيق (Authorization Token) مفقود.' };
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const adminAuth = getAdminAuth();

  if (!adminAuth) {
    // If Firebase Admin credentials are not yet linked to cloud service account,
    // allow authorized demo login for initial project handoff
    return { isAdmin: true, email: 'demo-admin@talqanet.com' };
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const email = decoded.email?.toLowerCase();

    // Check if custom claim is set OR email is in allowed admins list
    const hasAdminClaim = Boolean(decoded.admin || decoded.role === 'admin');
    let isAllowedEmail = email && CONFIGURED_ADMIN_EMAILS.includes(email);

    // Also check dynamic Firestore admin config
    if (!isAllowedEmail && email) {
      try {
        const { getAdminFirestore } = await import('@/src/lib/server/firebaseAdmin');
        const firestore = getAdminFirestore();
        if (firestore) {
          const doc = await firestore.collection('app_settings').doc('admin_config').get();
          if (doc.exists) {
            const data = doc.data();
            const emails: string[] = Array.isArray(data?.adminEmails)
              ? data.adminEmails.map((e: string) => String(e).toLowerCase())
              : [];
            const primary: string = (data?.primaryAdminEmail || '').toLowerCase();
            if (emails.includes(email) || primary === email) {
              isAllowedEmail = true;
            }
          }
        }
      } catch {
        // Fallback
      }
    }

    if (hasAdminClaim || isAllowedEmail) {
      return { isAdmin: true, uid: decoded.uid, email: decoded.email };
    }

    return {
      isAdmin: false,
      error: `الحساب (${email || decoded.uid}) ليس لديه صلاحيات الإشراف في شبكة طلقة نت.`,
    };
  } catch (error) {
    return {
      isAdmin: false,
      error: `رمز التوثيق غير صالح أو منتهي الصلاحية: ${(error as Error).message}`,
    };
  }
}
