'use client';

import React from 'react';
import { ChevronLeft } from 'lucide-react';

export interface ListItemProps {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  showChevron?: boolean;
  onClick?: () => void;
  className?: string;
  divider?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  leading,
  trailing,
  showChevron = true,
  onClick,
  className = '',
  divider = false,
}) => {
  const Component = onClick ? 'button' : 'div';

  return (
    <Component
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 text-right transition-colors select-none text-[#0B1220] ${
        onClick ? 'cursor-pointer hover:bg-[#F4F6F8] active:bg-[#E3E8EE] tap-press' : ''
      } ${divider ? 'border-b border-[#E3E8EE] last:border-b-0' : ''} ${className}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        {leading && <div className="shrink-0 text-[#5B6676]">{leading}</div>}
        <div className="min-w-0 text-right">
          <div className="text-sm font-semibold text-[#0B1220] truncate font-heading">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-[#5B6676] mt-0.5 truncate font-normal">
              {subtitle}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {trailing && <div className="text-xs">{trailing}</div>}
        {showChevron && onClick && (
          <ChevronLeft className="w-4 h-4 text-[#5B6676]" strokeWidth={1.75} />
        )}
      </div>
    </Component>
  );
};
