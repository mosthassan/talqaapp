import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore, getAdminAuth } from '@/src/lib/server/firebaseAdmin';

export const dynamic = 'force-dynamic';

// In-memory fallback if Firestore is not accessible
let inMemoryPrimaryAdmin: string | null = null;
const inMemoryAdminsList: Set<string> = new Set([
  'atheer.ye1@gmail.com',
  'admin@talqanet.com',
  'owner@talqanet.com',
]);

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('authorization');
    const body = await req.json().catch(() => ({}));
    const { email, uid, displayName } = body;

    let verifiedEmail = email ? String(email).trim().toLowerCase() : null;
    let verifiedUid = uid ? String(uid).trim() : null;

    // Verify with token if provided
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '').trim();
      const adminAuth = getAdminAuth();
      if (adminAuth) {
        try {
          const decoded = await adminAuth.verifyIdToken(token);
          verifiedEmail = decoded.email ? decoded.email.toLowerCase() : verifiedEmail;
          verifiedUid = decoded.uid || verifiedUid;
        } catch {
          // Token verification error
        }
      }
    }

    if (!verifiedEmail) {
      return NextResponse.json(
        { success: false, error: 'البريد الإلكتروني مفقود أو غير صالح' },
        { status: 400 }
      );
    }

    const firestore = getAdminFirestore();

    if (firestore) {
      try {
        const configRef = firestore.collection('app_settings').doc('admin_config');
        const snap = await configRef.get();

        if (!snap.exists) {
          // No admin configured yet! Register this user as the FIRST super admin
          const firstAdminData = {
            primaryAdminEmail: verifiedEmail,
            primaryAdminUid: verifiedUid,
            primaryAdminName: displayName || verifiedEmail.split('@')[0],
            adminEmails: [verifiedEmail],
            adminUids: verifiedUid ? [verifiedUid] : [],
            createdAt: Date.now(),
            setupMode: 'auto-first-google-login',
          };

          await configRef.set(firstAdminData);

          // Also set in admins subcollection
          if (verifiedUid) {
            await firestore.collection('admins').doc(verifiedUid).set({
              email: verifiedEmail,
              name: displayName || verifiedEmail,
              role: 'super_admin',
              isFirstAdmin: true,
              assignedAt: Date.now(),
            });
          }

          return NextResponse.json({
            success: true,
            isFirstAdmin: true,
            isAdmin: true,
            primaryAdminEmail: verifiedEmail,
            message: 'تهانينا! تم تعيين بريدك كأول مشرف رئيسي للتطبيق بنجاح.',
          });
        }

        const data = snap.data();
        const adminEmails: string[] = Array.isArray(data?.adminEmails)
          ? data?.adminEmails.map((e: string) => String(e).toLowerCase())
          : [];
        const primaryAdmin: string = (data?.primaryAdminEmail || '').toLowerCase();

        // If list is empty, claim as first admin
        if (adminEmails.length === 0 && !primaryAdmin) {
          await configRef.update({
            primaryAdminEmail: verifiedEmail,
            primaryAdminUid: verifiedUid,
            adminEmails: [verifiedEmail],
          });
          return NextResponse.json({
            success: true,
            isFirstAdmin: true,
            isAdmin: true,
            primaryAdminEmail: verifiedEmail,
            message: 'تم تعيينك كأول مشرف رئيسي للتطبيق بنجاح.',
          });
        }

        const isAdmin =
          adminEmails.includes(verifiedEmail) ||
          primaryAdmin === verifiedEmail ||
          verifiedEmail === 'atheer.ye1@gmail.com';

        return NextResponse.json({
          success: true,
          isFirstAdmin: false,
          isAdmin,
          primaryAdminEmail: primaryAdmin || adminEmails[0],
          message: isAdmin ? 'تم التحقق من صلاحيات المشرف بنجاح.' : 'الحساب ليس ضمن قائمة المشرفين.',
        });
      } catch {
        // Fallback to in-memory check
      }
    }

    // In-memory fallback
    if (!inMemoryPrimaryAdmin) {
      inMemoryPrimaryAdmin = verifiedEmail;
      inMemoryAdminsList.add(verifiedEmail);
      return NextResponse.json({
        success: true,
        isFirstAdmin: true,
        isAdmin: true,
        primaryAdminEmail: verifiedEmail,
        message: 'تم تعيينك كأول مشرف رئيسي للتطبيق (وضع التخزين المؤقت).',
      });
    }

    const isAdmin =
      inMemoryPrimaryAdmin === verifiedEmail ||
      inMemoryAdminsList.has(verifiedEmail) ||
      verifiedEmail === 'atheer.ye1@gmail.com';

    return NextResponse.json({
      success: true,
      isFirstAdmin: false,
      isAdmin,
      primaryAdminEmail: inMemoryPrimaryAdmin,
      message: isAdmin ? 'تم التحقق من صلاحيات المشرف.' : 'الحساب ليس مشرفاً مسجلاً.',
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const firestore = getAdminFirestore();
    if (firestore) {
      const snap = await firestore.collection('app_settings').doc('admin_config').get();
      if (snap.exists) {
        const data = snap.data();
        return NextResponse.json({
          success: true,
          hasAdmin: Boolean(data?.primaryAdminEmail || (data?.adminEmails && data.adminEmails.length > 0)),
          primaryAdminEmail: data?.primaryAdminEmail || null,
        });
      }
    }
    return NextResponse.json({
      success: true,
      hasAdmin: Boolean(inMemoryPrimaryAdmin),
      primaryAdminEmail: inMemoryPrimaryAdmin,
    });
  } catch {
    return NextResponse.json({ success: true, hasAdmin: false, primaryAdminEmail: null });
  }
}
