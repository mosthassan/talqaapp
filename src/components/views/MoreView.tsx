'use client';

import React from 'react';
import Link from 'next/link';
import { NETWORK_LINKS } from '@/src/config/links';
import {
  Phone,
  MessageCircle,
  Send,
  Share2,
  ExternalLink,
  Gauge,
  Gift,
  Palette,
  ShieldCheck,
  Radio,
  Server,
  Layers,
} from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { ListItem } from '@/src/components/ui/ListItem';
import { PWAInstallBanner } from '@/src/components/pwa/PWAInstallBanner';

interface MoreViewProps {
  onOpenSpeedTest: () => void;
  onOpenLoyalty: () => void;
}

export const MoreView: React.FC<MoreViewProps> = ({
  onOpenSpeedTest,
  onOpenLoyalty,
}) => {
  return (
    <div className="space-y-4 pb-28">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-bold text-[#0B1220] tracking-tight font-heading">
          المزيد والدعم الفني
        </h2>
        <p className="text-xs text-[#5B6676] mt-0.5 leading-relaxed">
          قنوات التواصل الرسمية، أدوات التطبيق، وتثبيت النسخة التقدمية PWA.
        </p>
      </div>

      {/* PWA Install Promotion */}
      <PWAInstallBanner />

      {/* Quick Tools Section */}
      <section className="space-y-1.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#57534E] px-1 font-heading">
          أدوات الشبكة
        </h3>
        <div className="bg-white rounded-[20px] border border-[#E7E5E4] overflow-hidden shadow-xs">
          <ListItem
            title="فحص السرعة والبينج"
            subtitle="قياس استجابة الشبكة الفعلية المباشرة"
            leading={<Gauge className="w-5 h-5 text-[#0284C7]" strokeWidth={2} />}
            onClick={onOpenSpeedTest}
            divider
          />
          <ListItem
            title="مسابقة الانتماء لشبكة طلقة"
            subtitle="نظام كروت الولاء وعجلة الحظ (المرحلة 3)"
            leading={<Gift className="w-5 h-5 text-[#C59424]" strokeWidth={2} />}
            onClick={onOpenLoyalty}
            divider
          />
          <Link href="/design" className="block">
            <ListItem
              title="دليل نظام التصميم (Talqa Net Design System)"
              subtitle="مرجع الهوية الملكية: اللون الذهبي والأزرق الشبكي"
              leading={<Palette className="w-5 h-5 text-[#C59424]" strokeWidth={2} />}
              divider={false}
            />
          </Link>
        </div>
      </section>

      {/* Official Communication Channels */}
      <section className="space-y-1.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#57534E] px-1 font-heading">
          التواصل والدعم الفني
        </h3>
        <div className="bg-white rounded-[20px] border border-[#E7E5E4] overflow-hidden shadow-xs">
          <a
            href={NETWORK_LINKS.support.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <ListItem
              title="واتساب خدمة العملاء"
              subtitle={NETWORK_LINKS.support.whatsappNumber}
              leading={<MessageCircle className="w-5 h-5 text-[#C59424]" strokeWidth={2} />}
              trailing={<ExternalLink className="w-3.5 h-3.5 text-[#0284C7]" strokeWidth={1.75} />}
              divider
            />
          </a>

          <a href={NETWORK_LINKS.support.phoneTel} className="block">
            <ListItem
              title="الاتصال المباشر والطوارئ"
              subtitle={NETWORK_LINKS.support.phoneRaw}
              leading={<Phone className="w-5 h-5 text-[#0284C7]" strokeWidth={2} />}
              trailing={<ExternalLink className="w-3.5 h-3.5 text-[#0284C7]" strokeWidth={1.75} />}
              divider
            />
          </a>

          <a
            href={NETWORK_LINKS.support.telegram}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <ListItem
              title="قناة تيليجرام الرسمية"
              subtitle="آخر أخبار وتحديثات الشبكة"
              leading={<Send className="w-5 h-5 text-[#0284C7]" strokeWidth={2} />}
              trailing={<ExternalLink className="w-3.5 h-3.5 text-[#0284C7]" strokeWidth={1.75} />}
              divider
            />
          </a>

          <a
            href={NETWORK_LINKS.support.facebook}
            target="_blank"
            rel="noopener noreferrer"
            className="block"
          >
            <ListItem
              title="صفحة فيسبوك"
              subtitle="facebook.com/talqanet"
              leading={<Share2 className="w-5 h-5 text-[#0284C7]" strokeWidth={2} />}
              trailing={<ExternalLink className="w-3.5 h-3.5 text-[#0284C7]" strokeWidth={1.75} />}
            />
          </a>
        </div>
      </section>

      {/* Network Infrastructure Specs */}
      <section className="space-y-1.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#5B6676] px-1 font-heading">
          البنية التحتية
        </h3>
        <div className="bg-white rounded-[20px] border border-[#E3E8EE] p-4 space-y-2 text-xs text-[#5B6676]">
          <div className="flex items-center justify-between py-1 border-b border-[#E3E8EE]">
            <span>مزود خدمة الأقمار الصناعية</span>
            <span className="font-semibold text-[#0B1220] font-heading">Starlink Satellite</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-[#E3E8EE]">
            <span>الراوتر وإدارة الهوتسبوت</span>
            <span className="font-semibold text-[#0B1220] font-heading">MikroTik RouterOS</span>
          </div>
          <div className="flex items-center justify-between py-1 border-b border-[#E3E8EE]">
            <span>منطقة التغطية</span>
            <span className="font-semibold text-[#0B1220] font-heading">مأرب – اليمن</span>
          </div>
          <div className="flex items-center justify-between py-1">
            <span>إصدار التطبيق</span>
            <span className="font-semibold text-[#0B1220] font-heading">v2.1 (Orbit)</span>
          </div>
        </div>
      </section>

      {/* Developer Attribution Footer (Strict rule: Appears only in More footer) */}
      <footer className="pt-4 border-t border-[#E3E8EE] text-center space-y-1.5 text-xs text-[#5B6676]">
        <div>
          تصميم وتطوير{' '}
          <a
            href={NETWORK_LINKS.developer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#0B1220] hover:underline"
          >
            {NETWORK_LINKS.developer.name}
          </a>{' '}
          (
          <a
            href={NETWORK_LINKS.developer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-[#0B1220] hover:underline"
          >
            Samtec AI
          </a>
          )
        </div>

        <div className="flex items-center justify-center gap-3 text-xs">
          <a
            href={NETWORK_LINKS.developer.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#5B6676] hover:text-[#0B1220] flex items-center gap-1 font-medium"
          >
            <span>samtecai.com</span>
            <ExternalLink className="w-3 h-3 text-[#5B6676]" strokeWidth={1.75} />
          </a>
          <span className="text-[#CBD5E1]">•</span>
          <a
            href={NETWORK_LINKS.developer.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0B1220] hover:underline flex items-center gap-1 font-medium"
          >
            <MessageCircle className="w-3 h-3 text-[#0B1220]" strokeWidth={1.75} />
            <span>واتساب المطور</span>
          </a>
        </div>
      </footer>
    </div>
  );
};
