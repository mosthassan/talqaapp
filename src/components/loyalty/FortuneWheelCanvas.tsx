'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { LoyaltyPrizeTier } from '@/src/types/loyalty';
import { soundManager } from '@/src/lib/audio/soundManager';

interface FortuneWheelCanvasProps {
  tiers: LoyaltyPrizeTier[];
  isSpinning: boolean;
  targetTierId: string | null;
  onSpinComplete: () => void;
  size?: number;
}

export const FortuneWheelCanvas: React.FC<FortuneWheelCanvasProps> = ({
  tiers,
  isSpinning,
  targetTierId,
  onSpinComplete,
  size = 360,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const currentAngleRef = useRef(0);
  const animationFrameRef = useRef<number | null>(null);
  const lastSectorRef = useRef<number>(-1);
  const [pointerBounce, setPointerBounce] = useState(false);

  const numSectors = Math.max(tiers.length, 1);
  const arc = (2 * Math.PI) / numSectors;

  // Draw the high-DPI fortune wheel
  const drawWheel = useCallback(
    (rotation: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const displaySize = size;
      const center = displaySize / 2;
      const radius = center - 18;

      ctx.save();
      ctx.clearRect(0, 0, displaySize, displaySize);

      // Translate to center and rotate
      ctx.translate(center, center);
      ctx.rotate(rotation);

      // 1. Outer golden bezel ring
      ctx.beginPath();
      ctx.arc(0, 0, radius + 10, 0, 2 * Math.PI);
      ctx.lineWidth = 14;
      const ringGrad = ctx.createLinearGradient(-radius, -radius, radius, radius);
      ringGrad.addColorStop(0, '#C59424'); // Royal Gold
      ringGrad.addColorStop(0.5, '#FDF7E7');
      ringGrad.addColorStop(1, '#996F16');
      ctx.strokeStyle = ringGrad;
      ctx.stroke();

      // Outer bezel rivets (lights)
      const rivetCount = numSectors * 3;
      for (let r = 0; r < rivetCount; r++) {
        const rivetAngle = (r * (2 * Math.PI)) / rivetCount;
        const rx = (radius + 10) * Math.cos(rivetAngle);
        const ry = (radius + 10) * Math.sin(rivetAngle);
        ctx.beginPath();
        ctx.arc(rx, ry, 2.5, 0, 2 * Math.PI);
        ctx.fillStyle = r % 2 === 0 ? '#FFE9A8' : '#FFFFFF';
        ctx.shadowColor = '#FFE9A8';
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0;
      }

      // 2. Wheel sectors
      tiers.forEach((tier, index) => {
        const startAngle = index * arc;
        const endAngle = startAngle + arc;

        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.arc(0, 0, radius, startAngle, endAngle);
        ctx.closePath();

        // Sector gradient
        const segGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, radius);
        segGrad.addColorStop(0, '#14100A');
        segGrad.addColorStop(0.35, tier.color);
        segGrad.addColorStop(1, tier.color);
        ctx.fillStyle = segGrad;
        ctx.fill();

        // Border line between sectors
        ctx.strokeStyle = 'rgba(20, 16, 10, 0.4)';
        ctx.lineWidth = 2.5;
        ctx.stroke();

        // Sector text and icons
        ctx.save();
        ctx.rotate(startAngle + arc / 2);
        ctx.textAlign = 'right';
        ctx.textBaseline = 'middle';

        // Title
        ctx.font = 'bold 13px Cairo, sans-serif';
        ctx.fillStyle = tier.textColor || '#FFFFFF';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
        ctx.shadowBlur = 4;
        ctx.fillText(tier.name, radius - 26, -7);

        // Data / duration badge
        ctx.font = 'bold 10px monospace';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText(tier.dataLabel, radius - 26, 9);

        ctx.restore();
      });

      // 3. Center Hub
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, 2 * Math.PI);
      const hubGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 32);
      hubGrad.addColorStop(0, '#FFFFFF');
      hubGrad.addColorStop(0.5, '#C59424');
      hubGrad.addColorStop(1, '#8A6311');
      ctx.fillStyle = hubGrad;
      ctx.fill();
      ctx.strokeStyle = '#14100A';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Center symbol (Talqa bolt or star)
      ctx.fillStyle = '#14100A';
      ctx.beginPath();
      ctx.arc(0, 0, 14, 0, 2 * Math.PI);
      ctx.fill();

      ctx.fillStyle = '#FDF7E7';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('طلقة', 0, 1);

      ctx.restore();
    },
    [arc, numSectors, size, tiers]
  );

  // Initialize canvas on mount and tier change
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
    drawWheel(currentAngleRef.current);
  }, [drawWheel, size]);

  // Handle spin animation
  useEffect(() => {
    if (!isSpinning || !targetTierId) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Target tier sector calculation
    // Top pointer is located at -PI / 2 (12 o'clock)
    const targetIndex = tiers.findIndex((t) => t.id === targetTierId);
    const resolvedIndex = targetIndex >= 0 ? targetIndex : 0;

    // The angle where sector center aligns with 12 o'clock
    // sector center angle = resolvedIndex * arc + arc / 2
    // pointer = 3 * PI / 2 (or -PI / 2)
    const sectorCenter = resolvedIndex * arc + arc / 2;
    const targetOffset = (3 * Math.PI) / 2 - sectorCenter;

    // Additional full rotations for excitement
    const fullSpins = prefersReducedMotion ? 2 : 5;
    const startAngle = currentAngleRef.current;
    // Normalize current angle
    const normalizedStart = startAngle % (2 * Math.PI);
    const totalRotation =
      fullSpins * 2 * Math.PI + (targetOffset - normalizedStart);
    const finalAngle = startAngle + (totalRotation < 0 ? totalRotation + 2 * Math.PI : totalRotation);

    const duration = prefersReducedMotion ? 1800 : 4500;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Quartic ease out for authentic spinning wheel feel
      const easeOut = 1 - Math.pow(1 - progress, 4);
      const angle = startAngle + (finalAngle - startAngle) * easeOut;
      currentAngleRef.current = angle;

      drawWheel(angle);

      // Sector crossing detector for ticking sound & vibration
      const normalized = (angle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
      const currentSector = Math.floor(normalized / arc);

      if (currentSector !== lastSectorRef.current) {
        lastSectorRef.current = currentSector;
        soundManager.playWheelTick();
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
          try {
            navigator.vibrate(15);
          } catch {}
        }
        setPointerBounce(true);
        setTimeout(() => setPointerBounce(false), 80);
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Complete!
        currentAngleRef.current = finalAngle;
        drawWheel(finalAngle);
        onSpinComplete();
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [arc, drawWheel, isSpinning, onSpinComplete, targetTierId, tiers]);

  return (
    <div className="relative flex items-center justify-center select-none" style={{ width: size, height: size }}>
      {/* Top Pointer Needle with bouncing tick */}
      <div
        className={`absolute -top-3 z-20 flex flex-col items-center transition-transform duration-75 ${
          pointerBounce ? '-translate-y-1 scale-110' : 'translate-y-0'
        }`}
        style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }}
      >
        <div className="w-6 h-7 bg-gradient-to-b from-amber-300 via-amber-500 to-amber-700 clip-triangle shadow-md"
             style={{ clipPath: 'polygon(50% 100%, 0 0, 100% 0)' }} />
        <div className="w-3.5 h-3.5 -mt-6 rounded-full bg-white border-2 border-amber-600 shadow" />
      </div>

      {/* Wheel Canvas */}
      <canvas
        ref={canvasRef}
        className="rounded-full shadow-2xl transition-shadow"
        style={{
          boxShadow: isSpinning
            ? '0 0 35px rgba(197, 148, 36, 0.45), 0 10px 25px rgba(0,0,0,0.3)'
            : '0 8px 30px rgba(0,0,0,0.18)',
        }}
      />
    </div>
  );
};
