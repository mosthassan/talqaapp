'use client';

import React from 'react';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  count?: number | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onClick,
  icon,
  count,
  className = '',
  size = 'md',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 font-medium transition-all select-none rounded-full whitespace-nowrap cursor-pointer tap-press ${
        size === 'sm' ? 'px-3 py-1 text-xs' : 'px-4 py-2 text-xs sm:text-sm'
      } ${
        selected
          ? 'bg-gradient-to-r from-[#D4AF37] to-[#B58218] text-white border border-[#B58218] shadow-xs font-semibold'
          : 'bg-white text-[#57534E] hover:text-[#1C1917] hover:bg-[#F8F8F7] border border-[#E7E5E4]'
      } ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`text-[11px] px-1.5 py-0.2 rounded-full font-semibold ${
            selected ? 'bg-white/20 text-white' : 'bg-[#F4F6F8] text-[#5B6676]'
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
};
