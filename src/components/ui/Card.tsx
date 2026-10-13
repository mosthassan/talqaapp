import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?:
    | 'surface'
    | 'gold-soft'
    | 'network-soft'
    | 'sky'
    | 'signal-soft'
    | 'outline'
    | 'subtle';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  radius?: 'card' | 'hero' | 'sub';
  interactive?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'surface',
  padding = 'md',
  radius = 'card',
  interactive = false,
  ...props
}) => {
  const variantStyles = {
    surface: 'bg-white border border-[#E7E5E4] shadow-xs',
    'gold-soft': 'bg-[#FDF7E7] border border-[#EEDAA2] text-[#1C1917]',
    'network-soft': 'bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1]',
    // Compatibility:
    sky: 'bg-[#E0F2FE] border border-[#BAE6FD] text-[#0369A1]',
    'signal-soft': 'bg-[#FDF7E7] border border-[#EEDAA2] text-[#1C1917]',
    outline: 'bg-white border border-[#E7E5E4]',
    subtle: 'bg-[#F8F8F7] border border-[#E7E5E4]',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3.5',
    md: 'p-5',
    lg: 'p-6',
  };

  const radiusStyles = {
    hero: 'rounded-[32px]',
    card: 'rounded-[24px]',
    sub: 'rounded-[14px]',
  };

  return (
    <div
      className={`${radiusStyles[radius]} ${variantStyles[variant]} ${paddingStyles[padding]} transition-all duration-150 ${
        interactive ? 'tap-press cursor-pointer hover:border-[#D6D3D1]' : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
