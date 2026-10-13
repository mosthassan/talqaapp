import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/src/lib/server/adminAuth';
import { getContestConfig, setContestConfig } from '@/src/lib/loyalty/serverLoyaltyEngine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.isAdmin) {
    return NextResponse.json({ success: false, error: auth.error || 'غير مصرح لك' }, { status: 403 });
  }

  const config = await getContestConfig();
  return NextResponse.json({ success: true, config });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.isAdmin) {
    return NextResponse.json({ success: false, error: auth.error || 'غير مصرح لك' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const updated = await setContestConfig(body);

  return NextResponse.json({
    success: true,
    config: updated,
    message: 'تم تحديث إعدادات المسابقة بنجاح.',
  });
}
