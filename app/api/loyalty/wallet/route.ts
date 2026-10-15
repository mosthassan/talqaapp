import { NextRequest, NextResponse } from 'next/server';
import { verifyUserRequest } from '@/src/lib/server/adminAuth';
import {
  getUserWalletCards,
  addUserWalletCard,
  checkRateLimit,
  recordRateLimitFailure,
} from '@/src/lib/loyalty/serverLoyaltyEngine';

function getClientIdentifier(req: NextRequest, uid: string): string {
  const realIp = req.headers.get('x-real-ip');
  const forwardedFor = req.headers.get('x-vercel-forwarded-for') || req.headers.get('x-forwarded-for');
  const ip = realIp || forwardedFor?.split(',')[0]?.trim() || 'wallet-user';
  return `wallet:${uid}:${ip}`;
}

export async function GET(req: NextRequest) {
  const auth = await verifyUserRequest(req);
  if (!auth.isAuthenticated || !auth.uid) {
    return NextResponse.json(
      { success: false, error: auth.error || 'يرجى تسجيل الدخول أولاً.' },
      { status: auth.statusCode || 401 }
    );
  }

  const wallet = await getUserWalletCards(auth.uid);
  return NextResponse.json({
    success: true,
    cards: wallet.cards,
    count: wallet.count,
    user: {
      uid: auth.uid,
      email: auth.email,
      displayName: auth.displayName,
    },
  });
}

export async function POST(req: NextRequest) {
  const auth = await verifyUserRequest(req);
  if (!auth.isAuthenticated || !auth.uid) {
    return NextResponse.json(
      { success: false, error: auth.error || 'يرجى تسجيل الدخول أولاً.' },
      { status: auth.statusCode || 401 }
    );
  }

  const clientId = getClientIdentifier(req, auth.uid);
  const rateLimit = checkRateLimit(clientId);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: `محاولات كثيرة متتالية. يُرجى الانتظار ${rateLimit.retryAfterSec || 30} ثانية.`,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const rawCode = typeof body?.code === 'string' ? body.code : '';

    if (!rawCode.trim()) {
      return NextResponse.json(
        { success: false, error: 'يرجى إدخال رقم كرت صالح.' },
        { status: 400 }
      );
    }

    const result = await addUserWalletCard(auth.uid, rawCode);

    if (!result.success) {
      if (result.reason !== 'wallet_full' && result.reason !== 'already_mine') {
        recordRateLimitFailure(clientId);
      }
      return NextResponse.json(
        {
          success: false,
          reason: result.reason,
          error: result.error || 'الكرت غير مقبول.',
          count: result.count,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      count: result.count,
      cards: result.cards,
    });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: `حدث خطأ أثناء حفظ الكرت: ${(err as Error).message}` },
      { status: 500 }
    );
  }
}
