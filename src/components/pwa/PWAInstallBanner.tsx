'use client';

import React, { useState } from 'react';
import { usePWAInstall } from '@/src/hooks/usePWAInstall';
import { Download, Share2, PlusSquare, Smartphone, Check } from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Sheet } from '@/src/components/ui/Sheet';

export const PWAInstallBanner: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  // If already running inside standalone app, do not display install banners
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    setIsInstalling(true);
    await install();
    setIsInstalling(false);
  };

  return (
    <>
      <div className="bg-white text-[#0B1220] rounded-[24px] p-5 border border-[#E3E8EE] shadow-xs space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FDF7E7] flex items-center justify-center shrink-0 border border-[#EEDAA2]">
            <Smartphone className="w-5 h-5 text-[#C59424]" strokeWidth={2} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#1C1917] font-heading">
              تثبيت تطبيق طلقة نت
            </h3>
            <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed font-normal">
              وصول فوري لبوابة الشبكة واستعراض الكروت بدون شريط المتصفح ويعمل بدون اتصال.
            </p>
          </div>
        </div>

        <div className="pt-1 flex gap-2">
          {isInstallable ? (
            <Button
              variant="gold"
              size="md"
              fullWidth
              isLoading={isInstalling}
              onClick={handleInstallClick}
              leftIcon={<Download className="w-4 h-4 text-white" strokeWidth={2} />}
            >
              تثبيت على الشاشة الرئيسية
            </Button>
          ) : isIOS ? (
            <Button
              variant="gold"
              size="md"
              fullWidth
              onClick={() => setShowIOSGuide(true)}
              leftIcon={<Share2 className="w-4 h-4 text-white" strokeWidth={2} />}
            >
              طريقة التثبيت على الآيفون (iOS)
            </Button>
          ) : (
            <Button
              variant="secondary"
              size="md"
              fullWidth
              onClick={() => setShowIOSGuide(true)}
              leftIcon={<Download className="w-4 h-4 text-[#0B1220]" strokeWidth={1.75} />}
            >
              إضافة التطبيق إلى الشاشة
            </Button>
          )}
        </div>
      </div>

      {/* iOS Step-by-Step Bottom Sheet Guide */}
      <Sheet
        isOpen={showIOSGuide}
        onClose={() => setShowIOSGuide(false)}
        title="تثبيت التطبيق على الآيفون"
        subtitle="خطوات إضافة طلقة نت لشاشتك الرئيسية"
      >
        <div className="space-y-3 py-2 text-right">
          <div className="flex items-start gap-3 p-3.5 bg-[#F4F6F8] rounded-[18px] border border-[#E3E8EE]">
            <div className="w-7 h-7 rounded-full bg-white text-[#0B1220] border border-[#E3E8EE] flex items-center justify-center font-bold text-xs shrink-0 font-heading">
              1
            </div>
            <div className="text-xs text-[#5B6676] leading-relaxed">
              افتح الرابط في متصفح <strong>Safari</strong>، ثم اضغط زر <strong>المشاركة</strong> (
              <Share2 className="w-3.5 h-3.5 inline mx-1 text-[#0B1220]" strokeWidth={1.75} />) في شريط المتصفح السفلي.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-[#F4F6F8] rounded-[18px] border border-[#E3E8EE]">
            <div className="w-7 h-7 rounded-full bg-white text-[#0B1220] border border-[#E3E8EE] flex items-center justify-center font-bold text-xs shrink-0 font-heading">
              2
            </div>
            <div className="text-xs text-[#5B6676] leading-relaxed">
              مرر للأسفل في القائمة واضغط على <strong>إضافة إلى الصفحة الرئيسية</strong> (
              <PlusSquare className="w-3.5 h-3.5 inline mx-1 text-[#0B1220]" strokeWidth={1.75} />).
            </div>
          </div>

          <div className="flex items-start gap-3 p-3.5 bg-[#F4F6F8] rounded-[18px] border border-[#E3E8EE]">
            <div className="w-7 h-7 rounded-full bg-white text-[#0B1220] border border-[#E3E8EE] flex items-center justify-center font-bold text-xs shrink-0 font-heading">
              3
            </div>
            <div className="text-xs text-[#5B6676] leading-relaxed">
              اضغط على كلمة <strong>إضافة (Add)</strong> أعلى الشاشة لتثبيت أيقونة طلقة نت.
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="ink"
              size="md"
              fullWidth
              onClick={() => setShowIOSGuide(false)}
              leftIcon={<Check className="w-4 h-4 text-white" strokeWidth={1.75} />}
            >
              تم، فهمت الخطوات
            </Button>
          </div>
        </div>
      </Sheet>
    </>
  );
};
