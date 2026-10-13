import { NextResponse } from 'next/server';
import { getActivePrizeTiers, getContestConfig } from '@/src/lib/loyalty/serverLoyaltyEngine';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const tiers = await getActivePrizeTiers();
    const config = await getContestConfig();

    // Sanitize: Only public presentation fields, no backend secrets or codes
    const sanitizedTiers = tiers.map((t) => ({
      id: t.id,
      name: t.name,
      price: t.price,
      color: t.color,
      textColor: t.textColor,
      probabilityWeight: t.probabilityWeight,
      dataLabel: t.dataLabel,
      durationLabel: t.durationLabel,
      iconName: t.iconName,
    }));

    return NextResponse.json({
      success: true,
      tiers: sanitizedTiers,
      config: {
        enabled: config.enabled,
        dailyRedemptionLimit: config.dailyRedemptionLimit,
        rulesText: config.rulesText,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: (error as Error).message || 'خطأ في جلب إعدادات المسابقة',
      },
      { status: 500 }
    );
  }
}
