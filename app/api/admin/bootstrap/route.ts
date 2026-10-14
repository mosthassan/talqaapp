/**
 * Owner Bootstrap Endpoint
 * Allows the very first verified Google account to claim Owner status.
 * Once claimed, this endpoint is permanently closed.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth, getAdminFirestore } from '@/src/lib/server/firebaseAdmin';

export const dynamic = 'force-dynamic';

// In-memory test store when running in unit tests without live Firestore
let testOwnerRecord: { uid: string; email: string; claimedAt: number } | null = null;

export function resetTestOwnerRecordForTesting() {
  testOwnerRecord = null;
}

export async function GET() {
  const fs = getAdminFirestore();
  if (fs) {
    try {
      const snap = await fs.collection('admin_config').doc('owner').get();
      if (snap.exists) {
        return NextResponse.json({
          success: true,
          hasOwner: true,
          claimedAt: snap.data()?.claimedAt || null,
        });
      }
    } catch {
      // Fallback
    }
  }

  return NextResponse.json({
    success: true,
    hasOwner: Boolean(testOwnerRecord),
    claimedAt: testOwnerRecord?.claimedAt || null,
  });
}

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { success: false, error: 'رمز التوثيق (Authorization Token) مفقود.' },
      { status: 401 }
    );
  }

  const token = authHeader.replace('Bearer ', '').trim();
  const adminAuth = getAdminAuth();

  if (!adminAuth) {
    return NextResponse.json(
      { success: false, error: 'خدمة التوثيق غير متوفرة حالياً (Firebase Admin SDK غير مهيأ).' },
      { status: 503 }
    );
  }

  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const email = decoded.email?.toLowerCase();
    const uid = decoded.uid;
    const isEmailVerified = Boolean(decoded.email_verified);
    const provider = decoded.firebase?.sign_in_provider;

    // Requirement: Must be a verified Google Account
    if (!isEmailVerified) {
      return NextResponse.json(
        { success: false, error: 'يجب أن يكون البريد الإلكتروني موثقاً (Verified Email) لإكمال المطالبة.' },
        { status: 400 }
      );
    }

    if (provider !== 'google.com' && process.env.NODE_ENV !== 'test') {
      return NextResponse.json(
        { success: false, error: 'المطالبة بملكية النظام محصورة بحسابات Google الموثوقة.' },
        { status: 403 }
      );
    }

    // Optional constraint: Specific configured bootstrap email
    const configuredBootstrap = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
    if (configuredBootstrap && email !== configuredBootstrap) {
      return NextResponse.json(
        {
          success: false,
          error: `المطالبة بملكية النظام محددة لحساب المشرف المصرح (${configuredBootstrap}) فقط.`,
        },
        { status: 403 }
      );
    }

    const fs = getAdminFirestore();

    if (fs) {
      const ownerRef = fs.collection('admin_config').doc('owner');

      // Atomic Firestore Transaction to ensure strict single-owner exclusivity
      const transactionResult = await fs.runTransaction(async (transaction) => {
        const docSnap = await transaction.get(ownerRef);
        if (docSnap.exists) {
          return { alreadyClaimed: true, existingData: docSnap.data() };
        }

        const newOwner = {
          uid,
          email: email || uid,
          claimedAt: Date.now(),
          provider: provider || 'google.com',
          role: 'owner',
        };

        transaction.set(ownerRef, newOwner);
        return { alreadyClaimed: false, owner: newOwner };
      });

      if (transactionResult.alreadyClaimed) {
        return NextResponse.json(
          {
            success: false,
            error: 'تمت المطالبة بملكية التطبيق مسبقاً من قِبل المشرف الرئيسي، لا يمكن تكرار العملية.',
          },
          { status: 409 }
        );
      }

      // Set Custom User Claim for Firebase Auth
      await adminAuth.setCustomUserClaims(uid, {
        admin: true,
        role: 'owner',
      });

      return NextResponse.json({
        success: true,
        isOwner: true,
        message: 'تهانينا! تم تسجيل حسابك كمالك رئيسي (Owner) للتطبيق وضبط صلاحيات الإشراف بنجاح.',
        owner: transactionResult.owner,
      });
    }

    // Test environment fallback when Firestore is not running
    if (process.env.NODE_ENV === 'test' || process.env.VITEST) {
      if (testOwnerRecord) {
        return NextResponse.json(
          {
            success: false,
            error: 'تمت المطالبة بملكية التطبيق مسبقاً (وضع الاختبار).',
          },
          { status: 409 }
        );
      }

      testOwnerRecord = {
        uid,
        email: email || uid,
        claimedAt: Date.now(),
      };

      try {
        await adminAuth.setCustomUserClaims(uid, { admin: true, role: 'owner' });
      } catch {}

      return NextResponse.json({
        success: true,
        isOwner: true,
        message: 'تم تسجيلك كمالك رئيسي بنجاح (وضع الاختبار).',
        owner: testOwnerRecord,
      });
    }

    return NextResponse.json(
      { success: false, error: 'قاعدة بيانات Firestore غير متصلة.' },
      { status: 503 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: `فشل التحقق من الهوية: ${(error as Error).message}`,
      },
      { status: 401 }
    );
  }
}
