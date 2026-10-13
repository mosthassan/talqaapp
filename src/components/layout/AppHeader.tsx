'use client';

import React from 'react';
import { NETWORK_LINKS } from '@/src/config/links';
import { BrandLogo } from '@/src/components/ui/BrandLogo';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';
import { ArrowUpRight } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <header className="sticky top-0 z-30 bg-[#F8F8F7]/95 backdrop-blur-md border-b border-[#E7E5E4] px-4 py-3 transition-all">
      <div className="flex items-center justify-between">
        {/* Brand identity & Online indicator */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5D061] via-[#D4AF37] to-[#B38212] flex items-center justify-center shrink-0 shadow-sm border border-[#EEDAA2]">
            <BrandLogo size={26} variant="white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-[#1C1917] tracking-tight font-heading">
                طلقة نت
              </h1>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E0F2FE] border border-[#BAE6FD] text-[11px] font-medium text-[#0369A1]">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOnline ? 'bg-[#0284C7] ring-2 ring-[#0284C7]/40' : 'bg-slate-400'
                  }`}
                />
                <span className="leading-none">{isOnline ? 'متصل' : 'أوفلاين'}</span>
              </span>
            </div>
            <p className="text-[11px] text-[#57534E] font-medium leading-tight">
              ستارلينك مأرب
            </p>
          </div>
        </div>

        {/* Portal Quick Launcher in Royal Gold Accent */}
        <a
          href={NETWORK_LINKS.portal.login}
          target="_blank"
          rel="noopener noreferrer"
          title="الانتقال إلى بوابة t.net"
          className="flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#FDF7E7] hover:bg-[#FBF0D1] text-[#8C6311] text-xs font-bold border border-[#EEDAA2] shadow-xs tap-press cursor-pointer transition-colors"
        >
          <span>t.net</span>
          <ArrowUpRight className="w-3.5 h-3.5 text-[#C59424]" strokeWidth={2} />
        </a>
      </div>
    </header>
  );
};
