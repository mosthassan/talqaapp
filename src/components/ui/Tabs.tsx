'use client';

import React from 'react';
import { clsx } from 'clsx';
import { motion } from 'motion/react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: string | number;
}

export interface TabsProps {
  items: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  items,
  activeId,
  onChange,
  className,
}) => {
  return (
    <div
      role="tablist"
      className={clsx(
        'inline-flex p-1 bg-slate-100/90 rounded-2xl border border-slate-200/60 overflow-x-auto no-scrollbar',
        className
      )}
    >
      {items.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(tab.id)}
            className={clsx(
              'relative z-0 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer select-none whitespace-nowrap flex items-center gap-1.5 tap-bounce',
              isActive ? 'text-blue-700' : 'text-slate-600 hover:text-slate-900'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white rounded-xl shadow-xs -z-10 border border-slate-200/50"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <span
                className={clsx(
                  'text-[10px] px-1.5 py-0.2 rounded-full font-bold',
                  isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                )}
              >
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};
