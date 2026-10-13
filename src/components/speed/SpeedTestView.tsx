'use client';

import React, { useState, useEffect, useRef, useCallback, useSyncExternalStore } from 'react';
import {
  SpeedTestRunner,
  SpeedProgress,
  SpeedTestResult,
  getSpeedTestHistory,
} from '@/src/lib/speedtest/engine';
import { useIsClient } from '@/src/hooks/useIsClient';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { SignalRing } from '@/src/components/ui/SignalRing';
import {
  Activity,
  ArrowDownCircle,
  ArrowUpCircle,
  RotateCcw,
  Share2,
  Check,
  AlertTriangle,
  Info,
  Smartphone,
  Wifi,
  History,
} from 'lucide-react';

interface SpeedTestViewProps {
  onComplete?: (result: SpeedTestResult) => void;
  compact?: boolean;
}

let cachedHistory: SpeedTestResult[] = [];
let cachedRaw: string | null = null;

function getHistorySnapshot(): SpeedTestResult[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem('talqa_speed_history');
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedHistory = raw ? JSON.parse(raw) : [];
    }
    return cachedHistory;
  } catch {
    return [];
  }
}

const EMPTY_HISTORY: SpeedTestResult[] = [];
function getServerHistorySnapshot(): SpeedTestResult[] {
  return EMPTY_HISTORY;
}

function subscribeHistory(callback: () => void) {
  window.addEventListener('storage', callback);
  window.addEventListener('talqa_speed_updated', callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener('talqa_speed_updated', callback);
  };
}

interface ConnectionInfo {
  isCellular: boolean;
  label: string;
}

const DEFAULT_CONN: ConnectionInfo = { isCellular: false, label: '' };
let cachedConn: ConnectionInfo = DEFAULT_CONN;

function getConnectionSnapshot(): ConnectionInfo {
  if (typeof navigator === 'undefined' || !('connection' in navigator)) {
    return DEFAULT_CONN;
  }
  const conn = (navigator as unknown as { connection?: { type?: string; effectiveType?: string } }).connection;
  if (!conn) return DEFAULT_CONN;
  const type = conn.type || conn.effectiveType || '';
  const isCell = type.includes('cellular') || type === '2g' || type === '3g' || type === '4g';
  const label = isCell
    ? `بيانات الهاتف (${type.toUpperCase()})`
    : type.includes('wifi')
      ? 'واي فاي طلقة نت'
      : '';
  if (cachedConn.isCellular !== isCell || cachedConn.label !== label) {
    cachedConn = { isCellular: isCell, label };
  }
  return cachedConn;
}

function subscribeConnection(callback: () => void) {
  if (typeof navigator !== 'undefined' && 'connection' in navigator) {
    const conn = (navigator as unknown as { connection?: EventTarget }).connection;
    conn?.addEventListener?.('change', callback);
    return () => conn?.removeEventListener?.('change', callback);
  }
  return () => {};
}

export function SpeedTestView({ onComplete, compact = false }: SpeedTestViewProps) {
  const runnerRef = useRef<SpeedTestRunner | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<SpeedProgress>({
    phase: 'idle',
    currentPing: 0,
    jitter: 0,
    currentMbps: 0,
    progressPercent: 0,
    providerName: 'جاهز لبدء الفحص',
  });
  const [lastResult, setLastResult] = useState<SpeedTestResult | null>(null);
  const isClient = useIsClient();

  const rawHistory = useSyncExternalStore(subscribeHistory, getHistorySnapshot, getServerHistorySnapshot);
  const rawConnectionInfo = useSyncExternalStore(subscribeConnection, getConnectionSnapshot, () => DEFAULT_CONN);
  const history = isClient ? rawHistory : EMPTY_HISTORY;
  const connectionInfo = isClient ? rawConnectionInfo : DEFAULT_CONN;
  const isCellular = connectionInfo.isCellular;
  const connectionTypeLabel = connectionInfo.label;
  const [copied, setCopied] = useState(false);
  const [cellularWarning, setCellularWarning] = useState(false);

  const handleStartTest = useCallback(async (bypassWarning = false) => {
    if (isCellular && !bypassWarning && !cellularWarning) {
      setCellularWarning(true);
      return;
    }
    setCellularWarning(false);

    setIsRunning(true);
    setLastResult(null);

    const runner = new SpeedTestRunner();
    runnerRef.current = runner;

    try {
      const result = await runner.runTest((p) => {
        setProgress(p);
      });
      setLastResult(result);
      if (onComplete) onComplete(result);
    } catch {
      // Runner handles error state
    } finally {
      setIsRunning(false);
    }
  }, [isCellular, cellularWarning, onComplete]);

  const handleCancel = () => {
    if (runnerRef.current) {
      runnerRef.current.abort();
      setIsRunning(false);
      setProgress((prev) => ({
        ...prev,
        phase: 'idle',
        providerName: 'تم إلغاء الفحص',
        progressPercent: 0,
      }));
    }
  };

  const handleShare = async () => {
    if (!lastResult) return;
    const text = `🚀 فحص سرعة شبكة طلقة نت (مأرب):
📥 التحميل: ${lastResult.downloadMbps} Mbps
📤 الرفع: ${lastResult.uploadMbps} Mbps
⚡ البينج: ${lastResult.ping} ms (تذبذب ${lastResult.jitter} ms)
🌐 الخادم: ${lastResult.providerName}
📱 تفاصيل الشبكة: ${lastResult.connectionType || 'Starlink WiFi'}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'نتيجة فحص سرعة طلقة نت',
          text,
          url: 'https://talqanet.vercel.app',
        });
        return;
      } catch {
        // Fallback to copy
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Clipboard copy fallback
    }
  };

  // Sparkline SVG generator for last 10 test history
  const renderSparkline = () => {
    if (history.length < 2) return null;
    const reversed = [...history].reverse(); // oldest to newest
    const downloads = reversed.map((h) => h.downloadMbps);
    const max = Math.max(...downloads, 10);
    const width = 280;
    const height = 48;
    const step = width / (downloads.length - 1);

    const points = downloads
      .map((val, idx) => {
        const x = idx * step;
        const y = height - (val / max) * (height - 10) - 5;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');

    return (
      <div className="p-3 bg-white rounded-[18px] border border-[#E7E5E4] space-y-2">
        <div className="flex items-center justify-between text-[11px] text-[#57534E]">
          <span className="flex items-center gap-1 font-semibold text-[#1C1917]">
            <History className="w-3.5 h-3.5 text-[#C59424]" />
            سجل الفحوصات السابقة (آخر {history.length})
          </span>
          <span className="text-[10px] text-[#0284C7] font-bold">
            الأعلى: {Math.max(...downloads)} Mbps
          </span>
        </div>
        <div className="w-full flex justify-center py-1">
          <svg width={width} height={height} className="overflow-visible">
            <polyline
              fill="none"
              stroke="#0284C7"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              points={points}
            />
            {downloads.map((val, idx) => {
              const x = idx * step;
              const y = height - (val / max) * (height - 10) - 5;
              const isLast = idx === downloads.length - 1;
              return (
                <circle
                  key={idx}
                  cx={x}
                  cy={y}
                  r={isLast ? 4 : 2.5}
                  fill={isLast ? '#C59424' : '#0284C7'}
                  stroke="#ffffff"
                  strokeWidth="1.5"
                />
              );
            })}
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 text-right font-body">
      {/* Cellular Warning Modal/Banner */}
      {cellularWarning && (
        <div className="p-4 bg-[#FEF3C7] border border-[#FDE68A] rounded-[20px] text-right space-y-2.5 animate-fadeIn">
          <div className="flex items-center gap-2 text-[#92400E] font-bold text-xs font-heading">
            <AlertTriangle className="w-4 h-4 shrink-0 text-[#D97706]" />
            <span>تنبيه: أنت متصل ببيانات الهاتف</span>
          </div>
          <p className="text-[11px] text-[#92400E] leading-relaxed">
            قياس سرعة التنزيل والرفع الفعلي يستهلك ما بين 25 إلى 50 ميجابايت من رصيد باقة هاتفك. هل تود المتابعة؟
          </p>
          <div className="flex gap-2 pt-1">
            <Button
              variant="gold"
              size="sm"
              onClick={() => handleStartTest(true)}
            >
              متابعة الفحص الآن
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setCellularWarning(false)}
            >
              إلغاء
            </Button>
          </div>
        </div>
      )}

      {/* Main Meter Box */}
      <div className="p-6 bg-gradient-to-b from-[#FDF7E7]/60 to-[#F8F8F7] rounded-[28px] border border-[#E7E5E4] flex flex-col items-center text-center shadow-xs">
        {/* Connection Context Badge */}
        <div className="flex items-center gap-2 mb-3">
          {connectionTypeLabel ? (
            <Badge variant="network" size="sm">
              {isCellular ? <Smartphone className="w-3 h-3 ml-1" /> : <Wifi className="w-3 h-3 ml-1" />}
              {connectionTypeLabel}
            </Badge>
          ) : (
            <Badge variant="network" size="sm">
              <Wifi className="w-3 h-3 ml-1" />
              شبكة طلقة نت
            </Badge>
          )}
          <span className="text-[10px] text-[#78716C]">
            {progress.providerName}
          </span>
        </div>

        {/* Big Live Dial / Display */}
        <div className="my-2 flex flex-col items-center justify-center">
          {isRunning ? (
            <div className="flex flex-col items-center">
              <div className="relative w-44 h-44 flex items-center justify-center">
                {/* Outer Ring */}
                <svg className="w-full h-full -rotate-90">
                  <circle
                    cx="88"
                    cy="88"
                    r="76"
                    className="stroke-[#E7E5E4]"
                    strokeWidth="8"
                    fill="none"
                  />
                  <circle
                    cx="88"
                    cy="88"
                    r="76"
                    className="stroke-[#C59424] transition-all duration-300"
                    strokeWidth="8"
                    strokeDasharray={477}
                    strokeDashoffset={477 - (477 * progress.progressPercent) / 100}
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
                {/* Live Value in center */}
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-[#1C1917] font-heading tracking-tight">
                    {progress.phase === 'ping'
                      ? progress.currentPing
                      : progress.currentMbps.toFixed(1)}
                  </span>
                  <span className="text-xs font-bold text-[#0284C7] whitespace-nowrap uppercase tracking-wider">
                    {progress.phase === 'ping' ? 'ms (Ping)' : 'Mbps'}
                  </span>
                </div>
              </div>

              {/* Phase progress indicator */}
              <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-[#57534E]">
                {progress.phase === 'ping' && <span>⚡ قياس زمن الاستجابة (Ping)...</span>}
                {progress.phase === 'download' && <span>📥 قياس سرعة التنزيل الفعلي...</span>}
                {progress.phase === 'upload' && <span>📤 قياس سرعة الرفع الفعلي...</span>}
              </div>
            </div>
          ) : lastResult ? (
            <div className="space-y-4">
              {/* Primary Download Result */}
              <div>
                <span className="text-[11px] font-semibold text-[#57534E] block mb-1">
                  سرعة التنزيل (Download)
                </span>
                <div className="flex items-baseline justify-center gap-1.5">
                  <span className="text-5xl font-black text-[#1C1917] tracking-tight font-heading">
                    {lastResult.downloadMbps}
                  </span>
                  <span className="text-base font-bold text-[#C59424] whitespace-nowrap">
                    Mbps
                  </span>
                </div>
              </div>

              {/* Sub-metrics Grid */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-white rounded-[20px] border border-[#E7E5E4] text-center">
                <div className="p-1">
                  <span className="text-[10px] text-[#78716C] block">الرفع (Upload)</span>
                  <span className="text-sm font-bold text-[#1C1917] font-heading">
                    {lastResult.uploadMbps}{' '}
                    <small className="text-[9px] font-normal text-[#0284C7]">Mbps</small>
                  </span>
                </div>

                <div className="p-1 border-r border-[#E7E5E4]">
                  <span className="text-[10px] text-[#78716C] block">الاستجابة (Ping)</span>
                  <span className="text-sm font-bold text-[#1C1917] font-heading">
                    {lastResult.ping}{' '}
                    <small className="text-[9px] font-normal text-[#0284C7]">ms</small>
                  </span>
                </div>

                <div className="p-1 border-r border-[#E7E5E4]">
                  <span className="text-[10px] text-[#78716C] block">التذبذب (Jitter)</span>
                  <span className="text-sm font-bold text-[#1C1917] font-heading">
                    {lastResult.jitter}{' '}
                    <small className="text-[9px] font-normal text-[#0284C7]">ms</small>
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-6 flex flex-col items-center gap-2">
              <SignalRing
                lastPing={history[0]?.ping ?? null}
                onStartTest={() => handleStartTest()}
                isTesting={isRunning}
              />
              <p className="text-xs text-[#57534E] max-w-xs mt-3 leading-relaxed">
                اضغط على الزر أدناه لبدء فحص شامل ودقيق لسرعة التنزيل والرفع وزمن الاستجابة.
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="w-full pt-3 flex gap-2">
          {isRunning ? (
            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={handleCancel}
            >
              إيقاف الفحص
            </Button>
          ) : (
            <>
              <Button
                variant="gold"
                size="lg"
                fullWidth
                leftIcon={<RotateCcw className="w-4 h-4 text-white" />}
                onClick={() => handleStartTest(false)}
              >
                {lastResult ? 'إعادة الفحص المباشر' : 'بدء فحص السرعة الفعلي'}
              </Button>

              {lastResult && (
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleShare}
                  title="مشاركة النتيجة"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Sparkline History Comparison */}
      {renderSparkline()}

      {/* Transparency / Honesty Note */}
      <div className="p-3.5 bg-white border border-[#E7E5E4] rounded-[18px] text-[11px] text-[#57534E] leading-relaxed flex items-start gap-2">
        <Info className="w-4 h-4 text-[#C59424] shrink-0 mt-0.5" />
        <p>
          يقيس سرعتك إلى الإنترنت العالمي عبر شبكة طلقة، وتتأثر النتيجة بعدد المتصلين في نفس اللحظة وجودة الإشارة الفضائية لستارلينك.
        </p>
      </div>
    </div>
  );
}
