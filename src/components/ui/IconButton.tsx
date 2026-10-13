'use client';

import React from 'react';

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string; // for aria-label
  variant?: 'ink' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, label, variant = 'ghost', size = 'md', className = '', onClick, ...props }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (typeof window !== 'undefined' && 'vibrate' in navigator) {
        try {
          navigator.vibrate?.(6);
        } catch {
          // ignore
        }
      }
      onClick?.(e);
    };

    const variantStyles = {
      ink: 'bg-[#0B1220] text-white hover:bg-[#1a2335] active:bg-[#000000]',
      secondary: 'bg-[#F4F6F8] text-[#0B1220] hover:bg-[#E3E8EE] active:bg-[#CBD5E1]',
      ghost: 'bg-transparent text-[#5B6676] hover:text-[#0B1220] hover:bg-[#F4F6F8] active:bg-[#E3E8EE]',
      outline: 'bg-white border border-[#E3E8EE] text-[#0B1220] hover:bg-[#F4F6F8]',
    };

    const sizeStyles = {
      sm: 'w-9 h-9 min-w-[36px] min-h-[36px] rounded-full',
      md: 'w-11 h-11 min-w-[44px] min-h-[44px] rounded-full', // minimum 44px
      lg: 'w-13 h-13 min-w-[52px] min-h-[52px] rounded-full',
    };

    return (
      <button
        ref={ref}
        type="button"
        aria-label={label}
        title={label}
        onClick={handleClick}
        className={`inline-flex items-center justify-center transition-all select-none cursor-pointer tap-press disabled:opacity-50 disabled:pointer-events-none ${
          variantStyles[variant]
        } ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
