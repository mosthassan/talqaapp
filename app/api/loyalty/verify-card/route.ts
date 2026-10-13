import { NextRequest, NextResponse } from 'next/server';
import {
  verifySingleCardServer,
  verifyCardsBatchServer,
  checkRateLimit,
} from '@/src/lib/loyalty/serverLoyaltyEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const rateCheck = checkRateLimit(`verify_${clientIp}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `تم تجاوز معدل الفحص المسموح. انتظر ${rateCheck.retryAfterSec || 30} ثانية.`,
        },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));

    // Single card verification
    if (typeof body.code === 'string') {
      const result = await verifySingleCardServer(body.code);
      return NextResponse.json({
        success: true,
        result,
      });
    }

    // Batch verification
    if (Array.isArray(body.codes)) {
      const batch = await verifyCardsBatchServer(body.codes);
      return NextResponse.json({
        success: true,
        batch,
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: 'يرجى تقديم كود الكرت المطلوب فحصه.',
      },
      { status: 400 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'خطأ أثناء فحص الكرت.',
      },
      { status: 500 }
    );
  }
}
