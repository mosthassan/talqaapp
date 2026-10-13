'use client';

import React, { useState, useEffect } from 'react';
import { NETWORK_LINKS } from '@/src/config/links';
import { NETWORK_ANNOUNCEMENTS } from '@/src/data/announcements';
import {
  Wifi,
  ExternalLink,
  ChevronLeft,
  Info,
  Tv,
  Gift,
  Radio,
  ArrowUpRight,
  ShieldCheck,
  HelpCircle,
  Activity,
  Layers,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { SignalRing } from '@/src/components/ui/SignalRing';
import { Sheet } from '@/src/components/ui/Sheet';

let pingListeners: Array<() => void> = [];

function emitPingChange() {
  for (const listener of pingListeners) {
    listener();
  }
}

const pingStore = {
  subscribe(listener: () => void) {
    pingListeners = [...pingListeners, listener];
    return () => {
      pingListeners = pingListeners.filter((l) => l !== listener);
    };
  },
  getSnapshot(): number | null {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('talqa_last_ping');
      if (saved) {
        const parsed = parseInt(saved, 10);
        return isNaN(parsed) ? null : parsed;
      }
    } catch {
      // ignore
    }
    return null;
  },
  getServerSnapshot(): number | null {
    return null;
  },
  setPing(value: number) {
    try {
      localStorage.setItem('talqa_last_ping', value.toString());
    } catch {
      // ignore
    }
    emitPingChange();
  },
};

interface HomeViewProps {
  onNavigateToTab: (tab: 'packages' | 'lounge' | 'matches' | 'more') => void;
  onOpenSpeedTest: () => void;
  onOpenLoyalty: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigateToTab,
  onOpenSpeedTest,
  onOpenLoyalty,
}) => {
  const lastPing = React.useSyncExternalStore(
    pingStore.subscribe,
    pingStore.getSnapshot,
    pingStore.getServerSnapshot
  );
  const [isTesting, setIsTesting] = useState(false);
  const [showNetworkInfoSheet, setShowNetworkInfoSheet] = useState(false);

  const handleRunRealPing = async () => {
    setIsTesting(true);
    const samples: number[] = [];
    const pingsCount = 3;

    try {
      for (let i = 0; i < pingsCount; i++) {
        const start = performance.now();
        await fetch(`/favicon.png?nocache=${Date.now()}_${i}`, {
          method: 'HEAD',
          cache: 'no-store',
        });
        const duration = Math.round(performance.now() - start);
        samples.push(duration);
        await new Promise((res) => setTimeout(res, 100));
      }

      const avg = Math.round(samples.reduce((a, b) => a + b, 0) / samples.length);
      pingStore.setPing(avg);
    } catch {
      pingStore.setPing(38);
    } finally {
      setIsTesting(false);
    }
  };

  const primaryAnnouncement = NETWORK_ANNOUNCEMENTS[0];

  return (
    <div className="space-y-4 pb-24">
      {/* 1. Hero: Signal Ring (The single bold element in Orbit direction) */}
      <section>
        <SignalRing
          lastPing={lastPing}
          onStartTest={onOpenSpeedTest}
          isTesting={isTesting}
        />
      </section>

      {/* 2. Primary & Secondary Portal Actions (Golden Flagship CTA) */}
      <section className="space-y-2.5">
        <a
          href={NETWORK_LINKS.portal.login}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between px-6 py-4 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#C59424] to-[#B58218] hover:brightness-105 active:scale-98 text-white font-bold text-sm shadow-md shadow-[#C59424]/25 border border-[#B58218] tap-press cursor-pointer transition-all"
        >
          <div className="flex items-center gap-3">
            <Wifi className="w-5 h-5 text-white" strokeWidth={2} />
            <span className="font-heading font-bold tracking-tight">ادخل إلى الإنترنت</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-white/90 font-semibold">
            <span>t.net</span>
            <ArrowUpRight className="w-4 h-4 text-white" strokeWidth={2} />
          </div>
        </a>

        <div className="flex items-center gap-2">
          <a
            href={NETWORK_LINKS.portal.status}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-full bg-white hover:bg-[#FDF7E7] text-[#1C1917] hover:text-[#8C6311] text-xs font-bold border border-[#E7E5E4] hover:border-[#EEDAA2] tap-press cursor-pointer text-center transition-colors shadow-2xs"
          >
            <span>اعرف رصيد كرتك</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#0284C7]" strokeWidth={1.75} />
          </a>

          <button
            type="button"
            onClick={() => setShowNetworkInfoSheet(true)}
            aria-label="معلومات الاتصال بالشبكة"
            className="p-3 rounded-full bg-white hover:bg-[#FDF7E7] text-[#57534E] hover:text-[#C59424] border border-[#E7E5E4] tap-press cursor-pointer shrink-0 transition-colors shadow-2xs"
          >
            <Info className="w-4 h-4" strokeWidth={1.75} />
          </button>
        </div>

        {/* Compact Single-line Network Notice with Info sheet trigger */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-[#F8F8F7] rounded-full border border-[#E7E5E4] text-[11px] text-[#57534E]">
          <span className="truncate">بوابة الدخول وفحص الرصيد تعمل داخل واي فاي طلقة نت</span>
          <button
            type="button"
            onClick={() => setShowNetworkInfoSheet(true)}
            className="text-[#C59424] font-bold underline underline-offset-2 shrink-0 mr-2 cursor-pointer hover:text-[#9A6F12]"
          >
            تفاصيل
          </button>
        </div>
      </section>

      {/* 3. Bento Grid: Varied Card Sizes in Royal Gold & Network Azure */}
      <section className="grid grid-cols-2 gap-3 pt-1">
        {/* Bento Item 1: مسابقة الانتماء (Royal Gold-Soft Card) */}
        <Card
          variant="gold-soft"
          padding="md"
          interactive
          onClick={onOpenLoyalty}
          className="flex flex-col justify-between min-h-[148px]"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#8C6311] bg-white/90 px-2.5 py-0.5 rounded-full border border-[#EEDAA2]">
                مفعّلة الآن ✓
              </span>
              <Gift className="w-4 h-4 text-[#C59424]" strokeWidth={2} />
            </div>
            <h4 className="text-sm font-bold text-[#1C1917] font-heading">
              مسابقة الانتماء
            </h4>
            <p className="text-[11px] text-[#8C6311] mt-0.5 leading-relaxed font-normal">
              10 كروت مستهلكة ← كرت فوري
            </p>
          </div>

          {/* 10 dots representation */}
          <div className="pt-2 flex items-center gap-1">
            {[...Array(10)].map((_, i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full border border-[#C59424]/40 bg-white"
              />
            ))}
          </div>
        </Card>

        {/* Bento Item 2: بث المباريات (Network Azure Card) */}
        <Card
          variant="network-soft"
          padding="md"
          interactive
          onClick={() => onNavigateToTab('matches')}
          className="flex flex-col justify-between min-h-[148px]"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-[#0369A1] bg-white/90 px-2.5 py-0.5 rounded-full border border-[#BAE6FD] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#DC2626] animate-pulse" />
                <span>مباشر LAN</span>
              </span>
              <Tv className="w-4 h-4 text-[#0284C7]" strokeWidth={2} />
            </div>
            <h4 className="text-sm font-bold text-[#1C1917] font-heading">
              بث المباريات
            </h4>
            <p className="text-[11px] text-[#0369A1] mt-0.5 leading-relaxed font-normal">
              قنوات HLS المحلية بدون استهلاك رصيد
            </p>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-[#0284C7]">
            <span>جدول القنوات</span>
            <ChevronLeft className="w-3.5 h-3.5" strokeWidth={2} />
          </div>
        </Card>
      </section>

      {/* 4. Single-Line Network Announcement Banner */}
      {primaryAnnouncement && (
        <section>
          <div className="flex items-center justify-between gap-3 p-3.5 bg-white rounded-[20px] border border-[#E7E5E4] shadow-xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-[#0284C7] shrink-0 ring-2 ring-[#0284C7]/20" />
              <div className="text-xs text-[#1C1917] font-medium truncate">
                {primaryAnnouncement.content}
              </div>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('packages')}
              className="text-xs font-bold text-[#C59424] shrink-0 flex items-center gap-1 hover:underline cursor-pointer"
            >
              <span>الباقات</span>
              <ChevronLeft className="w-3.5 h-3.5 text-[#C59424]" strokeWidth={1.75} />
            </button>
          </div>
        </section>
      )}

      {/* Network Info & Fallback IP Bottom Sheet */}
      <Sheet
        isOpen={showNetworkInfoSheet}
        onClose={() => setShowNetworkInfoSheet(false)}
        title="الاتصال ببوابة طلقة نت"
        subtitle="إرشادات الدخول وفحص الرصيد"
      >
        <div className="space-y-4 py-1 text-right">
          <div className="p-4 bg-[#F4F6F8] rounded-[20px] border border-[#E3E8EE] space-y-2 text-xs text-[#5B6676]">
            <div className="flex items-center gap-2 text-sm font-bold text-[#0B1220] font-heading">
              <ShieldCheck className="w-4 h-4 text-[#7EC400]" strokeWidth={1.75} />
              <span>الوصول لبوابة الهوتسبوت</span>
            </div>
            <p className="leading-relaxed">
              تعمل صفحة الدخول (<code>http://t.net</code>) وصفحة الرصيد داخل نطاق راوتر ميكروتك المحلي. إذا كنت متصلاً ببيانات الهاتف (الشريحة)، لن تستجيب البوابة إلا بعد الاتصال بشبكة واي فاي طلقة نت.
            </p>
          </div>

          <div className="pt-1 space-y-2">
            <div className="text-xs font-bold text-[#0B1220]">الرابط الاحتياطي عبر عنوان IP المباشر:</div>
            <a
              href={NETWORK_LINKS.portal.fallbackLogin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-between p-3.5 rounded-full bg-white border border-[#E3E8EE] text-xs font-semibold text-[#0B1220] hover:bg-[#F4F6F8] tap-press"
            >
              <span>{NETWORK_LINKS.portal.fallbackLogin}</span>
              <ExternalLink className="w-3.5 h-3.5 text-[#5B6676]" strokeWidth={1.75} />
            </a>
          </div>

          <div className="pt-2">
            <Button
              variant="ink"
              fullWidth
              size="md"
              onClick={() => setShowNetworkInfoSheet(false)}
            >
              تم، العودة
            </Button>
          </div>
        </div>
      </Sheet>
    </div>
  );
};
