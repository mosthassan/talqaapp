import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/src/lib/server/adminAuth';
import { importNetworkCardsBatch } from '@/src/lib/loyalty/serverLoyaltyEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.isAdmin) {
    return NextResponse.json({ success: false, error: auth.error || 'غير مصرح لك' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { cards } = body;

  if (!Array.isArray(cards) || cards.length === 0) {
    return NextResponse.json({ success: false, error: 'يرجى تقديم قائمة الكروت المستوردة.' }, { status: 400 });
  }

  const result = await importNetworkCardsBatch(cards);

  return NextResponse.json({
    success: true,
    imported: result.imported,
    errors: result.errors,
    message: `تم استيراد ${result.imported} كرت شبكة بنجاح إلى قاعدة التحقق السحابية.`,
  });
}
