'use client';

import React from 'react';
import Link from 'next/link';
import { Sheet } from '@/src/components/ui/Sheet';
import { Button } from '@/src/components/ui/Button';
import { Gift, Ticket, Award, Sparkles, ArrowLeft } from 'lucide-react';
import { Badge } from '@/src/components/ui/Badge';

interface LoyaltyPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoyaltyPreviewModal: React.FC<LoyaltyPreviewModalProps> = ({
  isOpen,
  onClose,
}) => {
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="مسابقة الانتماء لشبكة طلقة"
      subtitle="نظام ولاء المشتركين — جوائز وكروت مجانية فورية"
    >
      <div className="space-y-4 py-1 text-right">
        {/* Featured Loyalty Box */}
        <div className="p-5 bg-[#FDF7E7] border border-[#EEDAA2] rounded-[24px]">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5D061] via-[#D4AF37] to-[#B38212] text-white flex items-center justify-center shadow-xs">
              <Gift className="w-5 h-5 text-white" strokeWidth={2} />
            </div>
            <Badge variant="gold-solid" size="sm">
              مفعّلة الآن ✓
            </Badge>
          </div>

          <h4 className="text-sm font-bold text-[#1C1917] mb-1 font-heading">
            اجمع 10 كروت مستهلكة وادخل عجلة الحظ
          </h4>
          <p className="text-xs text-[#8C6311] leading-relaxed font-normal">
            تقديراً لوفاء مشتركي شبكة طلقة نت في مأرب، يمكنك إدخال أرقام 10 كروت قمت باستهلاكها لدخول سحب عجلة الحظ الفورية والفوز بكرت إنترنت مجاني.
          </p>

          {/* 10 Card slots visual indicator */}
          <div className="mt-3.5 pt-3 border-t border-[#EEDAA2] flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#8C6311]">
              خانة تجميع الكروت:
            </span>
            <div className="flex items-center gap-1.5">
              {[...Array(10)].map((_, i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full border border-[#C59424]/50 bg-white"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Rules breakdown */}
        <div className="space-y-2">
          <div className="flex items-start gap-3 p-3.5 bg-white border border-[#E7E5E4] rounded-[18px]">
            <Ticket className="w-4 h-4 text-[#C59424] shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-xs text-[#57534E] leading-relaxed">
              <strong className="text-[#1C1917] font-semibold">احتفظ بالكروت المنتهية:</strong> كل كرت مستهلك يقرّبك خطوة نحو تدوير العجلة.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-white border border-[#E7E5E4] rounded-[18px]">
            <Award className="w-4 h-4 text-[#0284C7] shrink-0 mt-0.5" strokeWidth={2} />
            <div className="text-xs text-[#57534E] leading-relaxed">
              <strong className="text-[#1C1917] font-semibold">جوائز فورية:</strong> كروت مجانية (1000، 2000، باقة 5GB، أو شهري 4000 VIP) تصدر لك مباشرة برمز تفعيل رسمي.
            </div>
          </div>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Button asChild variant="gold" size="md" fullWidth onClick={onClose}>
            <Link href="/rewards" className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> فتح شاشة المسابقة وإدخال الكروت <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <Button variant="outline" size="sm" fullWidth onClick={onClose}>
            إغلاق
          </Button>
        </div>
      </div>
    </Sheet>
  );
};
