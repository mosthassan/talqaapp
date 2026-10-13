import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number;
  variant?: 'gold' | 'network' | 'white' | 'ink';
}

/**
 * Talqa Net (طلقة نت) - Official Brand Identity Logo
 * 
 * Visual Concept:
 * 1. "طلقة" (Velocity & Supersonic Orbit): Aerodynamic bullet/satellite trajectory beam in gleaming gold.
 * 2. "نت" (Network & Starlink Transmission): Concentric high-speed broadcast arcs in network cyan/azure.
 * 3. Arabic "ط" Calligraphic Architecture: Seamlessly integrated antenna dish and speed mast.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 32,
  variant = 'gold',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="شعار طلقة نت"
      role="img"
    >
      <defs>
        {/* Radiant Gold Gradient */}
        <linearGradient id="talqaGoldGrad" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F5D061" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="100%" stopColor="#B38212" />
        </linearGradient>

        {/* Network Blue/Azure Gradient */}
        <linearGradient id="talqaNetworkGrad" x1="12" y1="52" x2="52" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>

        {/* Pure White Glow for dark variants */}
        <linearGradient id="talqaWhiteGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="100%" stopColor="#F1F5F9" />
        </linearGradient>
      </defs>

      {/* 1. Outer Network Transmission Wave (موجة البث الشبكي) */}
      <path
        d="M 12 40 A 24 24 0 1 1 54 26"
        stroke={variant === 'white' ? 'rgba(255,255,255,0.45)' : 'url(#talqaNetworkGrad)'}
        strokeWidth="3.5"
        strokeLinecap="round"
      />

      {/* 2. Middle Network Signal Wave (قوس الترددات والإنترنت) */}
      <path
        d="M 18 36 A 17 17 0 1 1 48 24"
        stroke={variant === 'white' ? 'rgba(255,255,255,0.7)' : 'url(#talqaNetworkGrad)'}
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1 0"
      />

      {/* 3. The "طلقة" Supersonic Arrow / Arabic "ط" Core Geometry */}
      {/* Base loop of letter "ط" shaped as high-speed Starlink terminal/bullet pulse */}
      <path
        d="M 22 46 C 31 46 38 41 38 34 C 38 27 31 24 24 24 C 17 24 16 29 16 35 C 16 42 22 46 48 46"
        stroke={variant === 'white' ? '#FFFFFF' : 'url(#talqaGoldGrad)'}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Vertical velocity mast of letter "ط" forming high-speed transmission antenna */}
      <path
        d="M 24 24 L 24 10"
        stroke={variant === 'white' ? '#FFFFFF' : 'url(#talqaGoldGrad)'}
        strokeWidth="4.2"
        strokeLinecap="round"
      />

      {/* 4. Satellite Beam Core Dot (رأس الطلقة وإشارة البث) */}
      <circle
        cx="53"
        cy="26"
        r="4.2"
        fill={variant === 'white' ? '#F5D061' : 'url(#talqaGoldGrad)'}
      />
      <circle
        cx="53"
        cy="26"
        r="1.8"
        fill="#FFFFFF"
      />
    </svg>
  );
};
