/**
 * Add Admin by Owner
 * Allows the verified Owner to grant admin privileges to another email
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/src/lib/server/adminAuth';
import { getAdminAuth, getAdminFirestore } from '@/src/lib/server/firebaseAdmin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.isAdmin) {
    return NextResponse.json(
      { success: false, error: auth.error || 'غير مصرح لك بإدارة المشرفين' },
      { status: 403 }
    );
  }

  const body = await req.json().catch(() => ({}));
  const emailToAdd = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';

  if (!emailToAdd || !emailToAdd.includes('@')) {
    return NextResponse.json(
      { success: false, error: 'يرجى تقديم بريد إلكتروني صالح.' },
      { status: 400 }
    );
  }

  const adminAuth = getAdminAuth();
  if (!adminAuth) {
    return NextResponse.json(
      { success: false, error: 'خدمة Firebase Admin غير متوفرة.' },
      { status: 503 }
    );
  }

  try {
    let targetUser;
    try {
      targetUser = await adminAuth.getUserByEmail(emailToAdd);
    } catch {
      // User hasn't logged in to Firebase yet
      targetUser = null;
    }

    if (targetUser) {
      // Set custom user claims
      await adminAuth.setCustomUserClaims(targetUser.uid, {
        admin: true,
        role: 'admin',
      });
    }

    // Record in Firestore
    const fs = getAdminFirestore();
    if (fs) {
      await fs.collection('admin_config').doc('admins').set(
        {
          emails: {
            [emailToAdd.replace(/[\.]/g, '_')]: {
              email: emailToAdd,
              addedBy: auth.email || auth.uid,
              addedAt: Date.now(),
              active: true,
            },
          },
        },
        { merge: true }
      );
    }

    return NextResponse.json({
      success: true,
      message: targetUser
        ? `تم تعيين البريد (${emailToAdd}) كمشرف وتفعيل الصلاحيات بنجاح.`
        : `تمت إضافة البريد (${emailToAdd}) إلى قائمة المشرفين المصرحين. ستُفعّل الصلاحيات تلقائياً فور أول تسجيل دخول.`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
