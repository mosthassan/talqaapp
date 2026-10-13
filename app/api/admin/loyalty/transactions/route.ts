import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminRequest } from '@/src/lib/server/adminAuth';
import { getAdminTransactionsList } from '@/src/lib/loyalty/serverLoyaltyEngine';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = await verifyAdminRequest(req);
  if (!auth.isAdmin) {
    return NextResponse.json({ success: false, error: auth.error || 'غير مصرح لك' }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || undefined;
  const format = searchParams.get('format');

  const transactions = await getAdminTransactionsList({ search, limit: 100 });

  // CSV Export support
  if (format === 'csv') {
    const headers = 'معرّف المعاملة,التاريخ,الفئة الرابحة,السعر,كود الجائزة,الكروت المحروقة\n';
    const rows = transactions
      .map((tx) => {
        const dateStr = new Date(tx.timestamp).toISOString();
        const burnedStr = `"${tx.burnedCards.join(' | ')}"`;
        return `${tx.transactionId},${dateStr},${tx.wonTierName},${tx.wonPrice},${tx.wonCode},${burnedStr}`;
      })
      .join('\n');

    return new Response(headers + rows, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="talqa_loyalty_transactions.csv"',
      },
    });
  }

  return NextResponse.json({ success: true, transactions });
}
