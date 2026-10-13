import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/src/lib/server/adminAuth';
import { getAdminFirestore } from '@/src/lib/server/firebaseAdmin';
import { getContentRepository } from '@/src/lib/data/repository';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.isAdmin) {
    return NextResponse.json({ success: false, error: auth.error || 'غير مصرح لك' }, { status: 403 });
  }

  const repo = getContentRepository();
  const [packages, distributors, announcements, channels, loungeItems, settings] =
    await Promise.all([
      repo.getPackages(),
      repo.getDistributors(),
      repo.getAnnouncements(),
      repo.getChannels(),
      repo.getLoungeItems(),
      repo.getAppSettings(),
    ]);

  return NextResponse.json({
    success: true,
    data: {
      packages,
      distributors,
      announcements,
      channels,
      loungeItems,
      settings,
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.isAdmin) {
    return NextResponse.json({ success: false, error: auth.error || 'غير مصرح لك' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { collectionName, documentId, data } = body;

  if (!collectionName || !documentId || !data) {
    return NextResponse.json(
      { success: false, error: 'البيانات غير مكتملة (collectionName, documentId, data)' },
      { status: 400 }
    );
  }

  const fs = getAdminFirestore();
  if (fs) {
    try {
      await fs.collection(collectionName).doc(documentId).set(data, { merge: true });
    } catch (err) {
      console.warn('[admin/content] Firestore save error:', (err as Error).message);
    }
  }

  return NextResponse.json({
    success: true,
    message: `تم تحديث وثيقة (${documentId}) في مجموعة (${collectionName}) بنجاح.`,
  });
}
