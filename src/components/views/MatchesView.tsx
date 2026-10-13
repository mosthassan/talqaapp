'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LiveChannel } from '@/src/types';
import { getContentRepository } from '@/src/lib/data/repository';
import { NETWORK_LINKS } from '@/src/config/links';
import { Tv, Radio, ShieldCheck, Wifi, Play, AlertCircle, Info, Calendar } from 'lucide-react';
import { Card } from '@/src/components/ui/Card';
import { Badge } from '@/src/components/ui/Badge';
import { Button } from '@/src/components/ui/Button';

// Dynamic import for HLS Player with ssr: false to prevent SSR hydration issues
const HlsVideoPlayer = dynamic(
  () => import('@/src/components/media/HlsVideoPlayer'),
  {
    ssr: false,
    loading: () => (
      <div className="w-full aspect-video bg-[#1C1917] rounded-[20px] flex items-center justify-center border border-[#E7E5E4]">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    ),
  }
);

export const MatchesView: React.FC = () => {
  const [channels, setChannels] = useState<LiveChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<LiveChannel | null>(null);

  useEffect(() => {
    const repo = getContentRepository();
    repo.getChannels().then((data) => {
      setChannels(data);
      const firstEnabled = data.find((c) => c.enabled);
      if (firstEnabled) {
        setActiveChannel(firstEnabled);
      }
    });
  }, []);

  const enabledChannels = channels.filter((c) => c.enabled);

  return (
    <div className="space-y-6 pb-24 text-right font-body">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1C1917] tracking-tight font-heading">
            بث المباريات المباشر
          </h2>
          <Badge variant="network" size="sm">
            HLS مباشر
          </Badge>
        </div>
        <p className="text-xs text-[#57534E] mt-0.5 leading-relaxed">
          مركز بث المباريات عبر شبكة طلقة نت المحلية: مشاهدة بدون تقطيع وبدون استهلاك لرصيد الباقة.
        </p>
      </div>

      {/* Video Player or Honest Awaiting State */}
      {activeChannel && activeChannel.enabled ? (
        <div className="space-y-2">
          <HlsVideoPlayer
            src={activeChannel.streamUrl}
            title={activeChannel.name}
            requiresLan={activeChannel.requiresLan}
          />
          <div className="flex items-center justify-between text-xs text-[#57534E] px-1">
            <span className="font-bold text-[#1C1917]">{activeChannel.name}</span>
            <span className="text-[11px] text-[#0284C7] flex items-center gap-1">
              <Wifi className="w-3 h-3" />
              بث سيرفر LAN الداخلي
            </span>
          </div>
        </div>
      ) : (
        <div className="p-6 bg-gradient-to-b from-white to-[#F8F8F7] rounded-[24px] border border-[#E7E5E4] text-center space-y-3 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mx-auto">
            <Tv className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-[#1C1917] font-heading">
              نترقب صافرة البداية ومصادر البث المرخصة
            </h3>
            <p className="text-xs text-[#57534E] max-w-sm mx-auto leading-relaxed">
              وفقاً لسياسة الشبكة وخريطة الطريق الفنية، يتم تفعيل مشغل البث HLS تلقائياً عند تأكيد مصادر البث المرخصة لمباريات القمة.
            </p>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FDF7E7] border border-[#EEDAA2] rounded-full text-[11px] text-[#8C6311] font-semibold">
            <Info className="w-3.5 h-3.5 text-[#C59424]" />
            <span>البث متاح حصرياً داخل شبكة واي فاي طلقة نت (LAN)</span>
          </div>
        </div>
      )}

      {/* Channel Lineup */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#57534E] font-heading">
            قنوات البث المجدولة
          </h3>
          <span className="text-[11px] text-[#78716C]">
            {enabledChannels.length > 0 ? `${enabledChannels.length} قنوات نشطة` : 'قيد التجهيز'}
          </span>
        </div>

        <div className="space-y-2">
          {channels.map((channel, idx) => {
            const isSelected = activeChannel?.id === channel.id;

            return (
              <Card
                key={channel.id}
                variant="surface"
                padding="sm"
                className={`flex items-center justify-between border transition-all ${
                  isSelected
                    ? 'border-[#C59424] bg-[#FDF7E7]/40 shadow-xs'
                    : 'border-[#E7E5E4] hover:border-[#CBD5E1]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#E0F2FE] text-[#0369A1] flex items-center justify-center font-bold text-xs font-heading shrink-0">
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1C1917] font-heading">
                      {channel.name}
                    </h4>
                    <p className="text-[11px] text-[#57534E]">
                      {channel.category}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {channel.enabled ? (
                    <Button
                      variant={isSelected ? 'gold' : 'secondary'}
                      size="sm"
                      onClick={() => setActiveChannel(channel)}
                    >
                      <Play className="w-3.5 h-3.5 fill-current ml-1" />
                      {isSelected ? 'قيد المشاهدة' : 'تشغيل'}
                    </Button>
                  ) : (
                    <Badge variant="neutral" size="sm">
                      قيد الترخيص
                    </Badge>
                  )}
                  <Badge variant="network" size="sm">
                    سيرفر LAN
                  </Badge>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Network Transparency Policy */}
      <div className="p-3.5 bg-white border border-[#E7E5E4] rounded-[18px] text-[11px] text-[#57534E] leading-relaxed flex items-start gap-2">
        <ShieldCheck className="w-4 h-4 text-[#C59424] shrink-0 mt-0.5" />
        <p>
          تلتزم شبكة طلقة نت بالبث عبر السيرفر الداخلي <code>{NETWORK_LINKS.localServer.hlsBase}</code> وبدون اختلاق نتائج أو أرقام مشاهدين وهمية لضمان أقصى مصداقية.
        </p>
      </div>
    </div>
  );
};
