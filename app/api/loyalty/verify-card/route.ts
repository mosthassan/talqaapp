import { NextRequest, NextResponse } from 'next/server';
import {
  verifySingleCardServer,
  verifyCardsBatchServer,
  checkRateLimit,
  recordRateLimitFailure,
} from '@/src/lib/loyalty/serverLoyaltyEngine';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // Trusted IP extraction (Vercel & standard proxies)
    const clientIp =
      req.headers.get('x-real-ip')?.trim() ||
      req.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      '127.0.0.1';

    // Strict rate limit to prevent automated card oracle guessing
    const rateCheck = checkRateLimit(`strict_verify_${clientIp}`);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `تم تجاوز معدل الفحص المسموح. انتظر ${rateCheck.retryAfterSec || 30} ثانية.`,
        },
        { status: 429 }
      );
    }

    // Add slight timing jitter to thwart timing attacks
    await new Promise((resolve) => setTimeout(resolve, 150));

    const body = await req.json().catch(() => ({}));

    // Single card verification
    if (typeof body.code === 'string') {
      const result = await verifySingleCardServer(body.code);
      if (!result.valid) {
        recordRateLimitFailure(`strict_verify_${clientIp}`);
      }
      return NextResponse.json({
        success: true,
        result: {
          valid: result.valid,
          message: result.valid ? 'كرت مستهلك معتمد في شبكة طلقة نت ✓' : result.message,
        },
      });
    }

    // Batch verification
    if (Array.isArray(body.codes)) {
      const batch = await verifyCardsBatchServer(body.codes);
      if (!batch.allValid) {
        recordRateLimitFailure(`strict_verify_${clientIp}`);
      }
      return NextResponse.json({
        success: true,
        batch: {
          allValid: batch.allValid,
          errorSummary: batch.errorSummary,
          validCount: batch.results.filter((r) => r.valid).length,
        },
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
