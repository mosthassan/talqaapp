'use client';

import React, { useState, useEffect, useCallback, useId } from 'react';
import confetti from 'canvas-confetti';
import {
  Gift,
  Sparkles,
  Ticket,
  CheckCircle2,
  XCircle,
  QrCode,
  Copy,
  Check,
  ExternalLink,
  RotateCcw,
  AlertTriangle,
  Info,
  ShieldCheck,
  Trophy,
  History,
  FileText,
  ChevronDown,
  ChevronUp,
  Trash2,
  WifiOff,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Card } from '@/src/components/ui/Card';
import { Sheet } from '@/src/components/ui/Sheet';
import { FortuneWheelCanvas } from '@/src/components/loyalty/FortuneWheelCanvas';
import { QRScannerModal } from '@/src/components/loyalty/QRScannerModal';
import { LoyaltyAccountPanel, type WalletRedeemWinResult } from '@/src/components/loyalty/LoyaltyAccountPanel';
import { soundManager } from '@/src/lib/audio/soundManager';
import { LoyaltyPrizeTier } from '@/src/types/loyalty';
import { NETWORK_LINKS } from '@/src/config/links';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';

const WALLET_STORAGE_KEY = 'talqa_loyalty_wallet_v3';

interface WonVoucherItem {
  transactionId: string;
  code: string;
  tierName: string;
  price: number;
  dataLabel: string;
  durationLabel: string;
  wonAt: number;
}

interface CardSlot {
  id: string;
  code: string;
  status: 'idle' | 'checking' | 'valid' | 'invalid';
  message?: string;
  packageName?: string;
  price?: number;
}

export function LoyaltyContestView() {
  const isOnline = useOnlineStatus();
  const componentId = useId();

  // Config & Tiers from Server
  const [tiers, setTiers] = useState<LoyaltyPrizeTier[]>([]);
  const [contestEnabled, setContestEnabled] = useState(true);
  const [rulesText, setRulesText] = useState('');
  const [loadingConfig, setLoadingConfig] = useState(true);

  // Participation Mode: 'wallet' (gradual stashing) vs 'direct' (instant 10-card submission)
  const [participationMode, setParticipationMode] = useState<'wallet' | 'direct'>('wallet');

  // Cards State (10 slots)
  const [cards, setCards] = useState<CardSlot[]>(() =>
    Array.from({ length: 10 }, (_, i) => ({
      id: `slot_${i}`,
      code: '',
      status: 'idle',
    }))
  );

  // Bulk input modal / collapse
  const [showBulkPaste, setShowBulkPaste] = useState(false);
  const [bulkText, setBulkText] = useState('');

  // QR Modal
  const [showQR, setShowQR] = useState(false);
  const [activeSlotIndex, setActiveSlotIndex] = useState<number | null>(null);

  // Wheel & Game State
  const [isSpinning, setIsSpinning] = useState(false);
  const [targetTierId, setTargetTierId] = useState<string | null>(null);
  const [wonPrize, setWonPrize] = useState<{
    tier: LoyaltyPrizeTier;
    code: string;
    transactionId: string;
  } | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  // My Won Wallet
  const [wallet, setWallet] = useState<WonVoucherItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(WALLET_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });
  const [showWallet, setShowWallet] = useState(false);
  const [showRulesSheet, setShowRulesSheet] = useState(false);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch Public Config & Tiers from Server API
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const res = await fetch('/api/loyalty/config');
        if (res.ok && active) {
          const data = await res.json();
          if (data.success) {
            setTiers(data.tiers || []);
            setContestEnabled(data.config?.enabled ?? true);
            setRulesText(data.config?.rulesText || '');
          }
        }
      } catch {
        // Offline fallback
      } finally {
        if (active) setLoadingConfig(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  const saveToWallet = useCallback((item: WonVoucherItem) => {
    setWallet((prev) => {
      // Prevent duplicates
      if (prev.some((p) => p.transactionId === item.transactionId)) return prev;
      const updated = [item, ...prev];
      try {
        localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Called when subscriber triggers gift redemption from their Card Wallet
  const handleWalletWin = useCallback(
    (data: WalletRedeemWinResult) => {
      const wonTierData = tiers.find((t) => t.id === data.wonTier?.id) || tiers[0] || data.wonTier;
      setTargetTierId(wonTierData.id);
      setIsSpinning(true);
      setServerError(null);

      const wonRecord: WonVoucherItem = {
        transactionId: data.transactionId,
        code: data.wonVoucher.code,
        tierName: data.wonTier.name,
        price: data.wonTier.price,
        dataLabel: data.wonVoucher.dataLabel,
        durationLabel: data.wonVoucher.durationLabel,
        wonAt: data.timestamp || Date.now(),
      };

      setTimeout(() => {
        setWonPrize({
          tier: wonTierData,
          code: data.wonVoucher.code,
          transactionId: data.transactionId,
        });
        saveToWallet(wonRecord);
      }, 4500);
    },
    [tiers, saveToWallet]
  );

  // Real-time server verification of a card slot
  const verifyCardSlot = useCallback(async (index: number, rawCode: string) => {
    const clean = rawCode.trim().toUpperCase().replace(/[\s\t\r\n]+/g, '');
    if (!clean) {
      setCards((prev) =>
        prev.map((c, i) => (i === index ? { ...c, code: '', status: 'idle', message: undefined } : c))
      );
      return;
    }

    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, code: clean, status: 'checking', message: 'جاري التحقق...' } : c))
    );

    try {
      const res = await fetch('/api/loyalty/verify-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: clean }),
      });

      const data = await res.json();
      if (data.success && data.result) {
        setCards((prev) =>
          prev.map((c, i) =>
            i === index
              ? {
                  ...c,
                  code: clean,
                  status: data.result.valid ? 'valid' : 'invalid',
                  message: data.result.message,
                  packageName: data.result.details?.packageName,
                  price: data.result.details?.price,
                }
              : c
          )
        );
      } else {
        setCards((prev) =>
          prev.map((c, i) =>
            i === index
              ? {
                  ...c,
                  code: clean,
                  status: 'invalid',
                  message: data.error || 'تعذر التحقق من الكرت.',
                }
              : c
          )
        );
      }
    } catch {
      setCards((prev) =>
        prev.map((c, i) =>
          i === index
            ? {
                ...c,
                code: clean,
                status: 'invalid',
                message: 'تحقق من اتصالك بالإنترنت.',
              }
            : c
        )
      );
    }
  }, []);

  // Handle single card input change with debounce
  const handleCardInputChange = (index: number, val: string) => {
    setCards((prev) =>
      prev.map((c, i) => (i === index ? { ...c, code: val, status: 'idle', message: undefined } : c))
    );
  };

  // Bulk paste parser
  const handleBulkPasteSubmit = async () => {
    if (!bulkText.trim()) return;

    // Extract potential voucher codes (alphanumeric, dashes, min 4 chars)
    const matches = bulkText
      .split(/[\n,;\t| ]+/)
      .map((s) => s.trim().toUpperCase())
      .filter((s) => s.length >= 4);

    if (matches.length === 0) return;

    const newSlots = [...cards];
    let matchIdx = 0;

    for (let i = 0; i < 10 && matchIdx < matches.length; i++) {
      const candidate = matches[matchIdx]!;
      newSlots[i] = {
        id: `slot_${i}`,
        code: candidate,
        status: 'checking',
        message: 'جاري التحقق...',
      };
      matchIdx++;
    }

    setCards(newSlots);
    setShowBulkPaste(false);
    setBulkText('');

    // Trigger batch verification
    for (let i = 0; i < 10; i++) {
      if (newSlots[i]?.code) {
        void verifyCardSlot(i, newSlots[i]!.code);
      }
    }
  };

  // Bulk Fill Test Cards (Development helper to test effortlessly)
  const fillTestCards = () => {
    const testCodes = [
      'TLQ-200-112233',
      'TLQ-200-445566',
      'TLQ-200-778899',
      'TLQ-500-101010',
      'TLQ-500-202020',
      'TLQ-500-303030',
      'TLQ-500-404040',
      'TLQ-1000-505050',
      'TLQ-1000-606060',
      'TLQ-1000-707070',
    ];

    testCodes.forEach((code, idx) => {
      void verifyCardSlot(idx, code);
    });
  };

  // Count valid cards
  const validCardsCount = cards.filter((c) => c.status === 'valid').length;
  const isReadyToSpin = validCardsCount === 10 && !isSpinning;

  // Execute Server Redemption & Trigger Wheel Spin
  const handleStartSpin = async () => {
    if (!isReadyToSpin) return;
    if (!isOnline) {
      setServerError('المسابقة تتطلب اتصالاً بالإنترنت للتحقق وحرق الكروت من السيرفر.');
      return;
    }

    setServerError(null);
    setWonPrize(null);

    // Generate unique idempotency key
    const idempotencyKey = `idempotency_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
    const cardsToRedeem = cards.map((c) => c.code.trim().toUpperCase());

    try {
      // 1. Authoritative Server Call
      const res = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards: cardsToRedeem,
          idempotencyKey,
          clientId: `client_${componentId}`,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        soundManager.playError();
        setServerError(data.message || 'تعذر استبدال الكروت. يرجى مراجعة القائمة.');
        return;
      }

      // 2. Server issued winning prize! Now animate wheel to land on won tier
      const wonTierData = tiers.find((t) => t.id === data.wonTier?.id) || tiers[0]!;
      setTargetTierId(wonTierData.id);
      setIsSpinning(true);

      // Pre-save won result in state
      const wonRecord: WonVoucherItem = {
        transactionId: data.transactionId,
        code: data.wonVoucher.code,
        tierName: data.wonTier.name,
        price: data.wonTier.price,
        dataLabel: data.wonVoucher.dataLabel,
        durationLabel: data.wonVoucher.durationLabel,
        wonAt: data.timestamp || Date.now(),
      };

      // Keep record ready to unveil on wheel completion
      setTimeout(() => {
        setWonPrize({
          tier: wonTierData,
          code: data.wonVoucher.code,
          transactionId: data.transactionId,
        });
        saveToWallet(wonRecord);
      }, 4500);
    } catch {
      soundManager.playError();
      setServerError('حدث انقطاع في الاتصال بالخادم. لم يتم حرق كروتك، يرجى إعادة المحاولة.');
    }
  };

  // Called when wheel animation physically completes
  const handleWheelAnimationComplete = () => {
    setIsSpinning(false);
    soundManager.playFanfare();

    // Trigger celebratory confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#C59424', '#0284C7', '#10B981', '#F59E0B'],
      });
    } catch {}

    // Reset card slots for next game
    setCards(
      Array.from({ length: 10 }, (_, i) => ({
        id: `slot_${i}`,
        code: '',
        status: 'idle',
      }))
    );
  };

  const copyVoucherCode = (code: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(code);
      setCopiedCode(code);
      soundManager.playSuccess();
      setTimeout(() => setCopiedCode(null), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Contest Status Notice if offline */}
      {!isOnline && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 flex items-center gap-3">
          <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
          <p className="text-xs font-medium leading-relaxed">
            أنت غير متصل بالإنترنت حالياً. مسابقة الانتماء تتطلب اتصالاً للتحقق السحابي الفوري من الكروت.
          </p>
        </div>
      )}

      {/* Hero Header */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-surface via-surface to-gold-soft border border-line p-5 shadow-sm">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gold/15 text-gold border border-gold/30">
              <Gift className="w-3.5 h-3.5" /> مسابقة الانتماء الرسمية
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setShowRulesSheet(true)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg text-ink-2 hover:bg-black/5 flex items-center gap-1 transition"
              >
                <FileText className="w-3.5 h-3.5" /> الشروط
              </button>
              {wallet.length > 0 && (
                <button
                  onClick={() => setShowWallet(true)}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg bg-network/10 text-network hover:bg-network/20 flex items-center gap-1 transition"
                >
                  <Trophy className="w-3.5 h-3.5" /> جوائزي ({wallet.length})
                </button>
              )}
            </div>
          </div>

          <h1 className="text-xl font-black text-ink tracking-tight pt-1">
            جمّع 10 كروت مستهلكة… واربح كرت جديد فوري!
          </h1>
          <p className="text-xs text-ink-2 leading-relaxed">
            وفاء مشتركي شبكة طلقة نت له تقدير خاص. أدخل أرقام 10 كروت مستهلكة، وسيتم فحصها فورياً عبر سيرفر الشبكة وفتح عجلة الحظ لك.
          </p>
        </div>
      </section>

      {/* Contest Wheel Arena */}
      <section className="flex flex-col items-center justify-center p-6 rounded-3xl bg-surface border border-line shadow-sm relative overflow-hidden">
        <div className="absolute top-3 right-4 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-xs font-bold text-ink-2">عجلة طلقة نت</span>
        </div>

        {/* Circular Progress Ring Indicator */}
        <div className="mb-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface border border-line shadow-xs">
          <div className="relative w-5 h-5 flex items-center justify-center">
            <svg className="w-5 h-5 -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-line"
                strokeWidth="4"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className={validCardsCount === 10 ? 'text-emerald-500' : 'text-gold'}
                strokeDasharray={`${(validCardsCount / 10) * 100}, 100`}
                strokeWidth="4"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
          </div>
          <span className="text-xs font-bold text-ink">
            {validCardsCount} من 10 كروت معتمدة
          </span>
        </div>

        {/* Fortune Wheel Canvas */}
        <div className="my-2">
          {tiers.length > 0 ? (
            <FortuneWheelCanvas
              tiers={tiers}
              isSpinning={isSpinning}
              targetTierId={targetTierId}
              onSpinComplete={handleWheelAnimationComplete}
              size={320}
            />
          ) : (
            <div className="w-72 h-72 rounded-full border border-dashed border-line flex items-center justify-center">
              <span className="text-xs text-ink-2">جاري تحميل قطاعات الجوائز...</span>
            </div>
          )}
        </div>

        {/* Server Error Notification */}
        {serverError && (
          <div className="mt-4 w-full p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5 animate-in fade-in">
            <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            <span className="leading-relaxed">{serverError}</span>
          </div>
        )}

        {/* Won Prize Celebration Card */}
        {wonPrize && (
          <div className="mt-5 w-full p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 via-surface to-gold-soft border-2 border-gold shadow-lg animate-in zoom-in-95 duration-300">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-gold/20 flex items-center justify-center text-gold shadow-inner">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs font-black uppercase text-gold tracking-widest">
                  مبروك الفوز! كرتك الجديد جاهز
                </span>
                <h3 className="text-xl font-black text-ink mt-0.5">{wonPrize.tier.name}</h3>
                <p className="text-xs text-ink-2">
                  {wonPrize.tier.dataLabel} • {wonPrize.tier.durationLabel}
                </p>
              </div>

              {/* Secret Voucher Code Display */}
              <div className="w-full p-3.5 rounded-2xl bg-surface border border-gold/40 flex items-center justify-between shadow-xs">
                <div className="text-right">
                  <span className="block text-[10px] text-ink-2 font-mono">رقم الكرت الجديد:</span>
                  <span className="font-mono text-base font-black text-network tracking-wider select-all">
                    {wonPrize.code}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyVoucherCode(wonPrize.code)}
                  className="gap-1 text-xs"
                >
                  {copiedCode === wonPrize.code ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> تم النسخ
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> نسخ
                    </>
                  )}
                </Button>
              </div>

              {/* Use Now CTA */}
              <div className="flex items-center gap-2 w-full pt-1">
                <a
                  href={NETWORK_LINKS.portal.login}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gold hover:bg-gold/90 text-white font-bold text-xs shadow-md transition"
                >
                  استخدمه الآن على الشبكة <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Action Button: Spin */}
        <div className="mt-5 w-full flex flex-col items-center">
          <Button
            size="lg"
            disabled={!isReadyToSpin || isSpinning || !contestEnabled}
            onClick={handleStartSpin}
            className={`w-full py-4 text-base font-black shadow-lg transition-all ${
              isReadyToSpin
                ? 'bg-gradient-to-r from-gold via-amber-500 to-gold text-white hover:opacity-95 shadow-gold/30 animate-pulse'
                : 'opacity-60 cursor-not-allowed'
            }`}
          >
            {isSpinning ? (
              'العجلة تدور وسيرفر طلقة يسحب الجائزة...'
            ) : isReadyToSpin ? (
              <>
                <Sparkles className="w-5 h-5 ml-2" /> أدر العجلة الآن واستلم جائزتك!
              </>
            ) : (
              `اجمع 10 كروت صالحة لفتح العجلة (${validCardsCount}/10)`
            )}
          </Button>

          {!contestEnabled && (
            <p className="mt-2 text-xs text-amber-700 font-medium">
              المسابقة متوقفة مؤقتاً للتحديث.
            </p>
          )}
        </div>
      </section>

      {/* Mode Selector: Card Wallet (Stashing) vs Direct 10-Card Fast Draw */}
      <div className="flex rounded-2xl bg-muted/60 p-1.5 border border-border gap-1.5">
        <button
          type="button"
          onClick={() => setParticipationMode('wallet')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            participationMode === 'wallet'
              ? 'bg-surface text-primary shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>محفظة كروتي (اجمع تدريجياً بحسابك)</span>
        </button>
        <button
          type="button"
          onClick={() => setParticipationMode('direct')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            participationMode === 'direct'
              ? 'bg-surface text-primary shadow-sm border border-border'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>السحب السريع (10 كروت دفعة واحدة)</span>
        </button>
      </div>

      {participationMode === 'wallet' ? (
        <LoyaltyAccountPanel onWin={handleWalletWin} busy={isSpinning} />
      ) : (
        /* 10 Cards Submission Section */
        <section className="p-5 rounded-3xl bg-surface border border-line shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-ink flex items-center gap-2">
                <Ticket className="w-4 h-4 text-network" /> إدخال الكروت المستهلكة
              </h2>
              <p className="text-xs text-ink-2">
                يمكنك كتابة الكروت أو لصقها دفعة واحدة أو مسح الـ QR بكاميرا هاتفك
              </p>
            </div>
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowBulkPaste(!showBulkPaste)}
              className="text-xs gap-1"
            >
              {showBulkPaste ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              لصق دفعة واحدة
            </Button>
            {/* Dev helper to quickly fill 10 valid test cards in 1 click */}
            <Button
              size="sm"
              variant="ghost"
              onClick={fillTestCards}
              className="text-[11px] text-ink-2 hover:text-gold"
              title="ملء 10 كروت تجريبية صالحة من قاعدة مأرب فوراً"
            >
              كروت اختبار
            </Button>
          </div>
        </div>

        {/* Bulk Paste Box */}
        {showBulkPaste && (
          <div className="p-4 rounded-2xl bg-bg border border-line space-y-3 animate-in fade-in">
            <label className="block text-xs font-bold text-ink">
              الصق نص الكروت هنا (يفصل بينها أسطر أو فواصل):
            </label>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              placeholder="TLQ-200-112233&#10;TLQ-500-101010&#10;..."
              rows={4}
              className="w-full p-3 rounded-xl bg-surface border border-line font-mono text-xs text-ink focus:outline-none focus:ring-2 focus:ring-gold/30"
              dir="ltr"
            />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setShowBulkPaste(false)}>
                إلغاء
              </Button>
              <Button size="sm" onClick={handleBulkPasteSubmit} disabled={!bulkText.trim()}>
                استخراج وفحص الكروت
              </Button>
            </div>
          </div>
        )}

        {/* 10 Card Inputs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {cards.map((slot, index) => (
            <div
              key={slot.id}
              className={`p-2.5 rounded-2xl border transition-all ${
                slot.status === 'valid'
                  ? 'border-emerald-500/40 bg-emerald-50/20'
                  : slot.status === 'invalid'
                  ? 'border-red-500/30 bg-red-50/20'
                  : slot.status === 'checking'
                  ? 'border-network/40 bg-network/5'
                  : 'border-line bg-surface'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-black/5 flex items-center justify-center font-mono text-xs font-bold text-ink-2 shrink-0">
                  {index + 1}
                </span>

                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={slot.code}
                    placeholder="رقم الكرت..."
                    onChange={(e) => handleCardInputChange(index, e.target.value)}
                    onBlur={() => verifyCardSlot(index, slot.code)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        void verifyCardSlot(index, slot.code);
                      }
                    }}
                    className="w-full py-1.5 px-2.5 rounded-lg bg-transparent text-xs font-mono font-bold text-ink focus:outline-none"
                    dir="ltr"
                  />
                </div>

                {/* QR Scan Button */}
                <button
                  type="button"
                  onClick={() => {
                    setActiveSlotIndex(index);
                    setShowQR(true);
                  }}
                  className="p-1.5 rounded-lg text-ink-2 hover:bg-black/5 hover:text-gold transition"
                  title="مسح QR"
                >
                  <QrCode className="w-4 h-4" />
                </button>

                {/* Status Indicator Icon */}
                <div className="w-6 h-6 flex items-center justify-center shrink-0">
                  {slot.status === 'valid' && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 animate-in zoom-in" />
                  )}
                  {slot.status === 'invalid' && (
                    <XCircle className="w-4 h-4 text-red-600 animate-in zoom-in" />
                  )}
                  {slot.status === 'checking' && (
                    <div className="w-3.5 h-3.5 border-2 border-network border-t-transparent rounded-full animate-spin" />
                  )}
                </div>
              </div>

              {/* Status Message */}
              {slot.message && (
                <div className="mt-1.5 pt-1 border-t border-black/5 flex items-center justify-between text-[11px]">
                  <span
                    className={
                      slot.status === 'valid'
                        ? 'text-emerald-700 font-medium'
                        : slot.status === 'invalid'
                        ? 'text-red-700 font-medium'
                        : 'text-ink-2'
                    }
                  >
                    {slot.message}
                  </span>
                  {slot.packageName && (
                    <span className="text-[10px] text-ink-2 font-mono">
                      {slot.packageName} ({slot.price} ر.ي)
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
      )}

      {/* QR Scanner Modal */}
      <QRScannerModal
        isOpen={showQR}
        onClose={() => {
          setShowQR(false);
          setActiveSlotIndex(null);
        }}
        onScanSuccess={(code) => {
          if (activeSlotIndex !== null) {
            void verifyCardSlot(activeSlotIndex, code);
          }
        }}
      />

      {/* My Won Wallet Sheet */}
      <Sheet
        isOpen={showWallet}
        onClose={() => setShowWallet(false)}
        title="محفظة جوائزي المستلمة"
      >
        <div className="space-y-4 p-4">
          {wallet.length === 0 ? (
            <div className="text-center py-10 space-y-2">
              <Trophy className="w-10 h-10 text-ink-2/40 mx-auto" />
              <p className="text-sm font-bold text-ink">لم تفز بأي كروت بعد</p>
              <p className="text-xs text-ink-2">جمّع 10 كروت مستهلكة وشارك في السحب الآن!</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-ink-2">
                كروت الجوائز الصادرة لك من سيرفر شبكة طلقة نت، يمكنك استخدامها في أي وقت:
              </p>
              <div className="space-y-3">
                {wallet.map((item) => (
                  <div
                    key={item.transactionId}
                    className="p-3.5 rounded-2xl bg-surface border border-line shadow-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-ink text-sm">{item.tierName}</span>
                      <span className="text-[11px] font-mono text-ink-2">
                        {new Date(item.wonAt).toLocaleDateString('ar-YE', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-bg border border-line flex items-center justify-between">
                      <span className="font-mono font-black text-sm text-network" dir="ltr">
                        {item.code}
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyVoucherCode(item.code)}
                        className="h-7 text-xs"
                      >
                        {copiedCode === item.code ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </Button>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-ink-2">
                      <span>{item.dataLabel} • {item.durationLabel}</span>
                      <a
                        href={NETWORK_LINKS.portal.login}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gold font-bold hover:underline flex items-center gap-1"
                      >
                        بوابة الشبكة <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Sheet>

      {/* Rules Sheet */}
      <Sheet
        isOpen={showRulesSheet}
        onClose={() => setShowRulesSheet(false)}
        title="شروط وقواعد مسابقة الانتماء"
      >
        <div className="space-y-4 p-4 text-xs text-ink-2 leading-relaxed">
          <div className="p-3.5 rounded-2xl bg-gold-soft border border-gold/20 text-ink">
            <h4 className="font-bold text-sm mb-1 text-gold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4" /> ضمانة ونزاهة المسابقة
            </h4>
            <p>
              يتم سحب الجوائز بنظام خادم مستقل يعتمد خوارزميات توليد أرقام عشوائية مشفرة
              (Server-Authoritative Cryptographic Draw).
            </p>
          </div>

          <div className="space-y-2">
            <h5 className="font-bold text-ink text-sm">القواعد الرئيسية:</h5>
            <ol className="list-decimal list-inside space-y-1.5 pr-2">
              <li>يجب تقديم 10 كروت مختلفة ومستهلكة بالكامل من كروت شبكة طلقة نت مأرب.</li>
              <li>الكروت الجديدة التي لم تستهلك بعد لا يتم قبولها لحماية أموال المشترك.</li>
              <li>كل كرت يُحرق في السيرفر فور استبداله ولا يمكن إعادة استخدامه في أي جهاز آخر.</li>
              <li>الكرت الرابح يصدر فورياً بكود سري أصلي يعمل مباشرة على بوابة الشبكة t.net.</li>
              <li>يحق لكل مشترك عدد سحوبات محدد يومياً لمنع الاحتكار والضغط على الخادم.</li>
            </ol>
          </div>

          {rulesText && (
            <div className="p-3 rounded-xl bg-bg border border-line text-[11px]">
              <span className="font-bold block text-ink mb-1">ملاحظة الإدارة:</span>
              <p>{rulesText}</p>
            </div>
          )}
        </div>
      </Sheet>
    </div>
  );
}
