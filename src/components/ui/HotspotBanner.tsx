'use client';

import React, { useState } from 'react';
import { NETWORK_LINKS } from '@/src/config/links';
import { Zap, ExternalLink, HelpCircle } from 'lucide-react';

interface HotspotBannerProps {
  className?: string;
  sourceContext?: string;
}

export const HotspotBanner: React.FC<HotspotBannerProps> = ({ className = '', sourceContext = 'lounge' }) => {
  const [showFallbackIp, setShowFallbackIp] = useState(false);
  const [showTip, setShowTip] = useState(false);

  const handleOpenPortal = (e?: React.MouseEvent) => {
    try {
      const opened = window.open(NETWORK_LINKS.portal.login, '_blank', 'noopener,noreferrer');
      if (!opened) {
        setShowFallbackIp(true);
      }
    } catch {
      setShowFallbackIp(true);
    }
  };

  return (
    <div
      className={`p-3.5 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/25 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${className}`}
    >
      <div className="flex items-center gap-2 text-ink">
        <span className="p-1.5 rounded-lg bg-gold/15 text-gold shrink-0">
          <Zap className="w-4 h-4 fill-current" />
        </span>
        <div>
          <span className="font-bold block">تستمتع بالمجان؟ ادخل إلى الإنترنت بكرتك</span>
          <span className="text-[11px] text-ink-2">تصفح كافة المواقع والتطبيقات عبر بوابة كروت طلقة نت</span>
        </div>
      </div>

      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
        <a
          href={NETWORK_LINKS.portal.login}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleOpenPortal}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gold hover:bg-gold/90 text-white font-bold text-xs shadow-xs transition-transform active:scale-95"
        >
          <span>تسجيل الدخول (t.net)</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>

        {/* Direct IP Fallback Button if needed or on error */}
        <a
          href={NETWORK_LINKS.portal.fallbackLogin}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-surface border border-line text-[11px] font-bold text-ink hover:bg-black/5 transition"
          title="الدخول عبر عنوان IP المباشر لراوتر الشبكة"
        >
          10.5.50.1
        </a>

        <button
          type="button"
          onClick={() => setShowTip(!showTip)}
          className="p-1.5 text-ink-2 hover:text-ink rounded-lg transition"
          aria-label="ملاحظة حول HTTPS-First"
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>
      </div>

      {showTip && (
        <div className="w-full pt-2 border-t border-amber-500/20 text-[10px] text-amber-900 dark:text-amber-200 leading-relaxed">
          💡 إذا فعّل هاتفك وضع &quot;HTTPS-First&quot; وظهر خطأ أمني على t.net، استخدم الرابط البديل بالـ IP المباشر (<code>http://10.5.50.1/login</code>) للدخول لصفحة الكرت بدون مشاكل.
        </div>
      )}
    </div>
  );
};
