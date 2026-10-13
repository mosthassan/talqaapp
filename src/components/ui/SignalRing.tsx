'use client';

import React from 'react';
import { Activity, Play, RotateCcw } from 'lucide-react';

interface SignalRingProps {
  lastPing: number | null;
  onStartTest: () => void;
  isTesting?: boolean;
}

export const SignalRing: React.FC<SignalRingProps> = ({
  lastPing,
  onStartTest,
  isTesting = false,
}) => {
  // SVG Ring geometry
  const radius = 96;
  const stroke = 10;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  // Arc length calculations based on real ping (0ms - 120ms scale, inverted where lower ping is better)
  const calculateArcPercent = () => {
    if (lastPing === null) return 0.08; // subtle initial orbit notch
    const clamped = Math.min(Math.max(lastPing, 10), 150);
    return Math.max(0.15, (160 - clamped) / 160);
  };

  const arcPercent = calculateArcPercent();
  const strokeDashoffset = circumference - arcPercent * circumference;

  return (
    <div className="relative flex flex-col items-center justify-center p-6 bg-white rounded-[32px] border border-[#E7E5E4] shadow-xs">
      {/* Network Azure & Gold Ambient Signal Glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-48 h-48 rounded-full bg-[#0284C7]/10 blur-2xl" />
        <div className="w-32 h-32 rounded-full bg-[#D4AF37]/10 blur-xl" />
      </div>

      {/* SVG Orbital Ring */}
      <div className="relative w-[210px] h-[210px] flex items-center justify-center">
        <svg
          height={radius * 2 + 18}
          width={radius * 2 + 18}
          viewBox={`0 0 ${radius * 2 + 18} ${radius * 2 + 18}`}
          className="rotate-[-90deg] transition-all duration-700 ease-out"
        >
          <defs>
            <linearGradient id="ringNetworkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>

          {/* Background Track */}
          <circle
            stroke="#F0F4F8"
            fill="transparent"
            strokeWidth={stroke}
            r={normalizedRadius}
            cx={radius + 9}
            cy={radius + 9}
          />

          {/* Dynamic Network Signal Arc (Internet Frequency Color) */}
          <circle
            stroke="url(#ringNetworkGrad)"
            fill="transparent"
            strokeWidth={stroke}
            strokeDasharray={`${circumference} ${circumference}`}
            style={{ strokeDashoffset }}
            strokeLinecap="round"
            r={normalizedRadius}
            cx={radius + 9}
            cy={radius + 9}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-3 select-none">
          {isTesting ? (
            <div className="space-y-1">
              <span className="w-3 h-3 rounded-full bg-[#0284C7] ring-4 ring-[#0284C7]/30 animate-ping mx-auto block mb-2" />
              <div className="text-sm font-bold text-[#1C1917] font-heading">
                جاري القياس...
              </div>
              <div className="text-[11px] text-[#57534E]">فحص استجابة الشبكة</div>
            </div>
          ) : lastPing !== null ? (
            <div className="space-y-0.5">
              <div className="text-[11px] text-[#57534E] font-medium">زمن الاستجابة</div>
              <div className="flex items-baseline justify-center gap-1">
                <span className="text-4xl font-bold text-[#1C1917] tracking-tight font-heading">
                  {lastPing}
                </span>
                <span className="text-xs font-semibold text-[#0284C7] whitespace-nowrap">
                  ms
                </span>
              </div>
              <div className="text-[11px] text-[#8C6311] font-semibold bg-[#FDF7E7] border border-[#EEDAA2] px-2.5 py-0.5 rounded-full inline-block mt-0.5">
                فحص فعلي مباشر
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="w-9 h-9 rounded-full bg-[#E0F2FE] text-[#0284C7] flex items-center justify-center mx-auto mb-1">
                <Activity className="w-4 h-4 text-[#0284C7]" strokeWidth={2} />
              </div>
              <div className="text-sm font-bold text-[#1C1917] font-heading">
                جاهز للقياس
              </div>
              <div className="text-[11px] text-[#57534E]">فحص بينج شبكة طلقة</div>
            </div>
          )}
        </div>
      </div>

      {/* Royal Gold Action Button (Instead of Black) */}
      <div className="mt-3 w-full max-w-[220px]">
        <button
          type="button"
          onClick={onStartTest}
          disabled={isTesting}
          className="w-full flex items-center justify-center gap-2 py-3 px-5 rounded-full bg-gradient-to-r from-[#D4AF37] via-[#C59424] to-[#B58218] hover:brightness-105 active:scale-98 text-white text-xs font-bold tap-press cursor-pointer shadow-md shadow-[#C59424]/20 border border-[#B58218] disabled:opacity-50"
        >
          {lastPing !== null ? (
            <>
              <RotateCcw className="w-3.5 h-3.5 text-white" strokeWidth={2} />
              <span>إعادة الفحص</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-white text-white" strokeWidth={2} />
              <span>ابدأ الفحص</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
