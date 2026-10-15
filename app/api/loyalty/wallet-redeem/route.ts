import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { verifyUserRequest } from '@/src/lib/server/adminAuth';
import { redeemUserWalletCards } from '@/src/lib/loyalty/serverLoyaltyEngine';

function getClientIdentifier(req: NextRequest, uid: string): string {
  const realIp = req.headers.get('x-real-ip');
  const forwardedFor = req.headers.get('x-vercel-forwarded-for') || req.headers.get('x-forwarded-for');
  const ip = realIp || forwardedFor?.split(',')[0]?.trim() || 'wallet-redeem';
  return `wallet-redeem:${uid}:${ip}`;
}

export async function POST(req: NextRequest) {
  const auth = await verifyUserRequest(req);
  if (!auth.isAuthenticated || !auth.uid) {
    return NextResponse.json(
      { success: false, message: auth.error || 'يرجى تسجيل الدخول أولاً.' },
      { status: auth.statusCode || 401 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const idempotencyKey =
      typeof body?.idempotencyKey === 'string' ? body.idempotencyKey.trim() : '';

    if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 200) {
      return NextResponse.json(
        { success: false, message: 'معرف العملية (Idempotency Key) غير صالح.' },
        { status: 400 }
      );
    }

    const clientId = getClientIdentifier(req, auth.uid);
    const ipHash = crypto.createHash('sha256').update(clientId).digest('hex').slice(0, 16);

    const result = await redeemUserWalletCards(auth.uid, idempotencyKey, clientId, ipHash);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          reason: result.reason,
          message: result.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { success: false, message: `حدث خطأ أثناء فتح الهدية: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
