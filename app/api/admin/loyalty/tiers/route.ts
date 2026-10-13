import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/src/lib/server/adminAuth';
import { getActivePrizeTiers, updateActivePrizeTiers } from '@/src/lib/loyalty/serverLoyaltyEngine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.isAdmin) {
    return NextResponse.json({ success: false, error: auth.error || 'غير مصرح لك' }, { status: 403 });
  }

  const tiers = await getActivePrizeTiers();
  return NextResponse.json({ success: true, tiers });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.isAdmin) {
    return NextResponse.json({ success: false, error: auth.error || 'غير مصرح لك' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { tiers } = body;

  if (!Array.isArray(tiers) || tiers.length === 0) {
    return NextResponse.json({ success: false, error: 'قائمة الفئات غير صالحة.' }, { status: 400 });
  }

  const result = await updateActivePrizeTiers(tiers);
  if (!result.success) {
    return NextResponse.json({ success: false, error: result.error }, { status: 400 });
  }

  return NextResponse.json({ success: true, message: 'تم تحديث أوزان وفئات الجوائز بنجاح.' });
}
