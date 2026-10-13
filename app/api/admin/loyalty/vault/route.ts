import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/src/lib/server/adminAuth';
import {
  getAdminPrizeVaultSummary,
  getAdminPrizeVouchersList,
  addPrizeVouchersToVault,
} from '@/src/lib/loyalty/serverLoyaltyEngine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.isAdmin) {
    return NextResponse.json({ success: false, error: auth.error || 'غير مصرح لك' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const reveal = searchParams.get('reveal') === 'true';

  const summary = await getAdminPrizeVaultSummary();
  const rawList = await getAdminPrizeVouchersList(100);

  // Mask codes by default for security unless explicitly requested with reveal=true
  const vouchers = rawList.map((v) => {
    let displayCode = v.code;
    if (!reveal && !v.claimed) {
      // e.g. TLQ-WIN-1000-948123 -> TLQ-***-8123
      const parts = v.code.split('-');
      if (parts.length >= 2) {
        displayCode = `${parts[0]}-***-${parts[parts.length - 1]?.slice(-4)}`;
      } else {
        displayCode = `${v.code.slice(0, 3)}***${v.code.slice(-3)}`;
      }
    }
    return {
      ...v,
      code: displayCode,
      isMasked: !reveal && !v.claimed,
    };
  });

  return NextResponse.json({
    success: true,
    summary,
    vouchers,
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.isAdmin) {
    return NextResponse.json({ success: false, error: auth.error || 'غير مصرح لك' }, { status: 403 });
  }

  const body = await req.json().catch(() => ({}));
  const { vouchers } = body;

  if (!Array.isArray(vouchers) || vouchers.length === 0) {
    return NextResponse.json(
      { success: false, error: 'يرجى تقديم قائمة الكروت المراد إضافتها إلى الصندوق.' },
      { status: 400 }
    );
  }

  const result = await addPrizeVouchersToVault(vouchers);

  return NextResponse.json({
    success: true,
    added: result.added,
    errors: result.errors,
    message: `تم إضافة ${result.added} كرت بنجاح إلى صندوق الجوائز.`,
  });
}
