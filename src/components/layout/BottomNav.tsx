'use client';

import React from 'react';
import { Home, Layers, Film, Tv, MoreHorizontal } from 'lucide-react';
import { motion } from 'motion/react';

export type TabKey = 'home' | 'packages' | 'lounge' | 'matches' | 'more';

interface BottomNavProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { key: 'home' as TabKey, label: 'الرئيسية', icon: Home },
    { key: 'packages' as TabKey, label: 'الباقات', icon: Layers },
    { key: 'lounge' as TabKey, label: 'الاستراحة', icon: Film },
    { key: 'matches' as TabKey, label: 'المباريات', icon: Tv },
    { key: 'more' as TabKey, label: 'المزيد', icon: MoreHorizontal },
  ];

  const handleSelect = (key: TabKey) => {
    if (typeof window !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate?.(6);
      } catch {
        // ignore
      }
    }
    onTabChange(key);
  };

  return (
    <nav
      role="navigation"
      aria-label="شريط التصفح الرئيسي"
      className="fixed bottom-3 left-0 right-0 z-40 px-4 pointer-events-none"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="max-w-[400px] mx-auto bg-white/95 backdrop-blur-md rounded-full p-1.5 border border-[#E7E5E4] shadow-[0_12px_32px_-4px_rgba(28,25,23,0.12)] flex items-center justify-between pointer-events-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => handleSelect(tab.key)}
              aria-current={isActive ? 'page' : undefined}
              className={`relative flex items-center justify-center gap-1.5 py-2 px-3.5 rounded-full transition-colors cursor-pointer select-none tap-press ${
                isActive ? 'text-white font-bold' : 'text-[#57534E] hover:text-[#C59424]'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activePillNav"
                  className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#C59424] to-[#B58218] rounded-full -z-10 shadow-sm shadow-[#C59424]/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                />
              )}
              <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2.2 : 1.75} />
              {isActive && (
                <span className="text-xs tracking-tight whitespace-nowrap font-bold pr-0.5 font-heading">
                  {tab.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
