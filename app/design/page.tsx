'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Button,
  Card,
  Chip,
  Badge,
  IconButton,
  ListItem,
  Sheet,
  Skeleton,
  EmptyState,
  BrandLogo,
  SignalRing,
  Toast,
} from '@/src/components/ui';
import {
  ArrowRight,
  Wifi,
  Activity,
  Layers,
  Film,
  Tv,
  Check,
  AlertCircle,
  Download,
  Gift,
  Gauge,
} from 'lucide-react';

export default function DesignSystemPage() {
  const [selectedChip, setSelectedChip] = useState('one');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [demoPing, setDemoPing] = useState<number | null>(42);

  return (
    <main className="min-h-screen bg-[#F8F8F7] text-[#1C1917] pb-24 font-body">
      {/* Top Bar */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E7E5E4] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/"
            className="p-1.5 rounded-full hover:bg-[#F8F8F7] text-[#57534E] tap-press"
          >
            <ArrowRight className="w-5 h-5 rotate-0" strokeWidth={2} />
          </Link>
          <div className="flex items-center gap-2">
            <BrandLogo size={24} variant="gold" />
            <h1 className="text-sm font-bold text-[#1C1917] font-heading">
              هوية طلقة نت (الذهبي + الأزرق الشبكي)
            </h1>
          </div>
        </div>
        <Badge variant="gold-solid" size="sm">
          الهوية الملكية
        </Badge>
      </div>

      <div className="max-w-[440px] mx-auto p-4 space-y-8 text-right">
        {/* Intro */}
        <section className="space-y-1">
          <h2 className="text-xl font-bold font-heading text-[#1C1917]">
            نظام تصميم شبكة طلقة نت
          </h2>
          <p className="text-xs text-[#57534E] leading-relaxed">
            هوية فاخرة مخصصة لشبكات الإنترنت: اللون الذهبي الملكي للتميز والمكانة والأزرار الرئيسية، والأزرق الشبكي السيان لإشارات الإنترنت وترددات ستارلينك، مع خلفيات مريحة للعين ومقروئية كاملة.
          </p>
        </section>

        {/* 1. Palette Tokens */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#57534E] font-heading">
            1. رموز الألوان المعتمدة (Brand Tokens)
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-3.5 rounded-[16px] bg-gradient-to-r from-[#D4AF37] to-[#B58218] text-white shadow-xs">
              <div className="font-bold font-heading">--gold</div>
              <div className="text-[10px] text-white/90">#C59424 (الذهبي الملكي والأزرار)</div>
            </div>

            <div className="p-3.5 rounded-[16px] bg-[#0284C7] text-white shadow-xs">
              <div className="font-bold font-heading">--network</div>
              <div className="text-[10px] text-white/90">#0284C7 (أزرق بث الإنترنت والألياف)</div>
            </div>

            <div className="p-3.5 rounded-[16px] bg-[#FDF7E7] text-[#8C6311] border border-[#EEDAA2]">
              <div className="font-bold font-heading">--gold-soft</div>
              <div className="text-[10px] text-[#8C6311]/80">#FDF7E7 (بطاقات الولاء المضيئة)</div>
            </div>

            <div className="p-3.5 rounded-[16px] bg-[#E0F2FE] text-[#0369A1] border border-[#BAE6FD]">
              <div className="font-bold font-heading">--network-soft</div>
              <div className="text-[10px] text-[#0369A1]/80">#E0F2FE (خلفية بث المباريات وسيرفر LAN)</div>
            </div>

            <div className="p-3.5 rounded-[16px] bg-white border border-[#E7E5E4] text-[#1C1917]">
              <div className="font-bold font-heading">--surface</div>
              <div className="text-[10px] text-[#57534E]">#FFFFFF (البطاقات والقوائم)</div>
            </div>

            <div className="p-3.5 rounded-[16px] bg-[#F8F8F7] border border-[#E7E5E4] text-[#1C1917]">
              <div className="font-bold font-heading">--bg</div>
              <div className="text-[10px] text-[#57534E]">#F8F8F7 (خلفية التطبيق الدافئة)</div>
            </div>
          </div>
        </section>

        {/* 2. Brand Logo */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#57534E] font-heading">
            2. شعار طلقة نت الجديد (Supersonic Brand Logo)
          </h3>
          <div className="p-5 bg-white rounded-[24px] border border-[#E7E5E4] flex items-center justify-around shadow-xs">
            <div className="flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#F5D061] via-[#D4AF37] to-[#B38212] flex items-center justify-center shadow-md">
                <BrandLogo size={36} variant="white" />
              </div>
              <span className="text-[11px] font-semibold text-[#8C6311]">الدرع الذهبي الملكي</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-full bg-white border border-[#E7E5E4] flex items-center justify-center shadow-2xs">
                <BrandLogo size={36} variant="gold" />
              </div>
              <span className="text-[11px] font-semibold text-[#1C1917]">المسار المتجهي</span>
            </div>

            <div className="flex flex-col items-center gap-1.5">
              <div className="w-14 h-14 rounded-full bg-[#0284C7] flex items-center justify-center shadow-md">
                <BrandLogo size={36} variant="white" />
              </div>
              <span className="text-[11px] font-semibold text-[#0369A1]">الدرع الشبكي</span>
            </div>
          </div>
        </section>

        {/* 3. Buttons */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#57534E] font-heading">
            3. الأزرار (Buttons)
          </h3>
          <div className="p-5 bg-white rounded-[24px] border border-[#E7E5E4] space-y-3 shadow-xs">
            <div>
              <div className="text-xs text-[#57534E] mb-1.5">زر الدخول والحدث الرئيسي (Royal Gold):</div>
              <Button variant="gold" fullWidth leftIcon={<Wifi className="w-4 h-4 text-white" />}>
                ادخل إلى الإنترنت (t.net)
              </Button>
            </div>

            <div>
              <div className="text-xs text-[#57534E] mb-1.5">زر خدمات الشبكة والاتصال (Network Blue):</div>
              <Button variant="network" fullWidth leftIcon={<Activity className="w-4 h-4 text-white" />}>
                فحص اتصال الشبكة
              </Button>
            </div>

            <div>
              <div className="text-xs text-[#57534E] mb-1.5">الزر الثانوي (Secondary):</div>
              <Button variant="secondary" fullWidth>
                عرض نقاط التوزيع في مأرب
              </Button>
            </div>
          </div>
        </section>

        {/* 4. Badges & Chips */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#57534E] font-heading">
            4. الشارات والرقاقات (Badges & Chips)
          </h3>
          <div className="p-5 bg-white rounded-[24px] border border-[#E7E5E4] space-y-4 shadow-xs">
            <div className="flex flex-wrap gap-2">
              <Badge variant="gold-solid">الأكثر طلباً</Badge>
              <Badge variant="gold">المرحلة 3</Badge>
              <Badge variant="network-solid">مباشر LAN</Badge>
              <Badge variant="network">beIN Sports HD</Badge>
              <Badge variant="neutral">سيرفر داخلي</Badge>
            </div>

            <div className="flex gap-2">
              <Chip
                label="الساعات"
                selected={selectedChip === 'one'}
                onClick={() => setSelectedChip('one')}
              />
              <Chip
                label="اليومية"
                selected={selectedChip === 'two'}
                onClick={() => setSelectedChip('two')}
              />
              <Chip
                label="شهرية VIP"
                selected={selectedChip === 'three'}
                onClick={() => setSelectedChip('three')}
              />
            </div>
          </div>
        </section>

        {/* 5. Signal Ring Preview */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#57534E] font-heading">
            5. حلقة الإشارة (Signal Ring)
          </h3>
          <SignalRing
            lastPing={demoPing}
            onStartTest={() => setDemoPing(Math.floor(Math.random() * 30) + 25)}
            isTesting={false}
          />
        </section>

        {/* 6. Phase 2 Features Showcase */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#57534E] font-heading">
            6. ميزات المرحلة 2 الحية (Live Features)
          </h3>
          <div className="p-4 bg-white rounded-[20px] border border-[#E7E5E4] space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-[#1C1917]">فحص السرعة الفعلي (Cloudflare + Fallback)</span>
              <Badge variant="gold-solid" size="sm">مكتمل</Badge>
            </div>
            <p className="text-[11px] text-[#57534E]">
              قياس حقيقي للتحميل والرفع والبينج والتذبذب مع مزودين واختبارات Vitest.
            </p>
            <div className="flex gap-2 pt-1">
              <Link
                href="/speed"
                className="px-3 py-1.5 rounded-full bg-[#C59424] text-white text-[11px] font-bold"
              >
                تجربة فحص السرعة ↗
              </Link>
              <Link
                href="/packages"
                className="px-3 py-1.5 rounded-full bg-[#E0F2FE] text-[#0369A1] text-[11px] font-bold"
              >
                خريطة مأرب والباقات ↗
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
