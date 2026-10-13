import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { executeRedeemServer } from '@/src/lib/loyalty/serverLoyaltyEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '127.0.0.1';
    const body = await req.json().catch(() => ({}));

    const { cards, idempotencyKey, clientId } = body;

    if (!Array.isArray(cards) || cards.length !== 10) {
      return NextResponse.json(
        {
          success: false,
          reason: 'invalid_cards',
          message: 'المسابقة تتطلب إدخال عشرة (10) كروت مستهلكة مكتملة.',
        },
        { status: 400 }
      );
    }

    if (!idempotencyKey || typeof idempotencyKey !== 'string') {
      return NextResponse.json(
        {
          success: false,
          reason: 'invalid_request',
          message: 'مفتاح عدم التكرار (Idempotency Key) مطلوب لحماية العملية.',
        },
        { status: 400 }
      );
    }

    // IP hash for privacy-preserving audit trail
    const ipHash = crypto.createHash('sha256').update(clientIp).digest('hex').slice(0, 16);
    const resolvedClientId = typeof clientId === 'string' && clientId.length > 5 ? clientId : clientIp;

    const result = await executeRedeemServer({
      cards,
      idempotencyKey,
      clientId: resolvedClientId,
      ipHash,
    });

    if (!result.success) {
      const status = result.reason === 'rate_limited' ? 429 : 400;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        reason: 'server_error',
        message: (error as Error).message || 'حدث خطأ داخلي في الخادم أثناء معالجة الاستبدال.',
      },
      { status: 500 }
    );
  }
}
