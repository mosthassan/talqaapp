import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?:
    | 'gold'
    | 'gold-solid'
    | 'network'
    | 'network-solid'
    | 'signal'
    | 'signal-soft'
    | 'sky'
    | 'ink'
    | 'warn'
    | 'neutral';
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  icon,
  className = '',
}) => {
  const variantStyles = {
    gold: 'bg-[#FDF7E7] text-[#8C6311] border-[#EEDAA2] font-semibold',
    'gold-solid': 'bg-gradient-to-r from-[#D4AF37] to-[#B58218] text-white border-transparent font-bold shadow-xs',
    network: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD] font-semibold',
    'network-solid': 'bg-[#0284C7] text-white border-transparent font-semibold shadow-xs',
    // Compatibility mappings:
    signal: 'bg-gradient-to-r from-[#D4AF37] to-[#B58218] text-white border-transparent font-bold shadow-xs',
    'signal-soft': 'bg-[#FDF7E7] text-[#8C6311] border-[#EEDAA2] font-semibold',
    sky: 'bg-[#E0F2FE] text-[#0369A1] border-[#BAE6FD] font-medium',
    ink: 'bg-gradient-to-r from-[#D4AF37] to-[#B58218] text-white border-transparent font-semibold',
    warn: 'bg-[#FFFBEB] text-[#78350F] border-[#FDE68A] font-medium',
    neutral: 'bg-[#F8F8F7] text-[#57534E] border-[#E7E5E4] font-medium',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border whitespace-nowrap leading-none ${
        size === 'sm' ? 'text-[11px] px-2.5 py-1' : 'text-xs px-3 py-1.5'
      } ${variantStyles[variant]} ${className}`}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  );
};
