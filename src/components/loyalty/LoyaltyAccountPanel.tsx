'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  User,
  Ticket,
  Plus,
  Gift,
  LogOut,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from 'lucide-react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import { getFirebaseAuth } from '@/src/lib/firebase/config';
import { Button } from '@/src/components/ui/Button';
import { soundManager } from '@/src/lib/audio/soundManager';
import { LoyaltyPrizeTier } from '@/src/types/loyalty';

export interface WalletCardItem {
  code: string;
  addedAt: number;
  price?: number;
  packageName?: string;
}

export interface WalletRedeemWinResult {
  wonTier: LoyaltyPrizeTier;
  wonVoucher: {
    code: string;
    price: number;
    dataLabel: string;
    durationLabel: string;
  };
  transactionId: string;
  timestamp: number;
}

interface LoyaltyAccountPanelProps {
  onWin: (result: WalletRedeemWinResult) => void;
  busy?: boolean;
}

export function LoyaltyAccountPanel({ onWin, busy }: LoyaltyAccountPanelProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authActionBusy, setAuthActionBusy] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Wallet Cards State
  const [cards, setCards] = useState<WalletCardItem[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [addingCode, setAddingCode] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const [actionMessage, setActionMessage] = useState<{ ok: boolean; text: string } | null>(null);

  // Listen to Firebase Auth state
  useEffect(() => {
    let active = true;
    let unsub = () => {};
    try {
      const auth = getFirebaseAuth();
      unsub = onAuthStateChanged(auth, (user) => {
        if (!active) return;
        setCurrentUser(user);
        setAuthLoading(false);
        if (user) {
          user
            .getIdToken()
            .then((token) => {
              if (!active) return;
              return fetch('/api/loyalty/wallet', {
                headers: { Authorization: `Bearer ${token}` },
              });
            })
            .then((res) => (res ? res.json() : null))
            .then((data) => {
              if (active && data?.success && Array.isArray(data.cards)) {
                setCards(data.cards);
              }
            })
            .catch(() => {});
        } else {
          setCards([]);
        }
      });
    } catch {
      setTimeout(() => {
        if (active) setAuthLoading(false);
      }, 0);
    }
    return () => {
      active = false;
      unsub();
    };
  }, []);

  // Fetch / refresh user wallet cards
  const refreshWallet = useCallback(async (user: FirebaseUser) => {
    setCardsLoading(true);
    try {
      const token = await user.getIdToken();
      const res = await fetch('/api/loyalty/wallet', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json().catch(() => ({}));
      if (data.success && Array.isArray(data.cards)) {
        setCards(data.cards);
      }
    } catch {
      // offline or network hiccup
    } finally {
      setCardsLoading(false);
    }
  }, []);

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    setAuthActionBusy(true);
    setAuthError(null);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        await signInWithPopup(auth, provider);
      } catch (err: unknown) {
        const error = err as { code?: string };
        if (
          error.code === 'auth/popup-blocked' ||
          error.code === 'auth/popup-closed-by-user' ||
          error.code === 'auth/cancelled-popup-request'
        ) {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw err;
      }
      soundManager.playSuccess();
    } catch (err) {
      setAuthError('تعذر تسجيل الدخول بحساب Google، يُرجى المحاولة مجدداً.');
      soundManager.playError();
    } finally {
      setAuthActionBusy(false);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      setCards([]);
      setActionMessage(null);
    } catch {}
  };

  // Add Card to Wallet
  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newCode.trim().toUpperCase();
    if (!clean || !currentUser || addingCode) return;

    setAddingCode(true);
    setActionMessage(null);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch('/api/loyalty/wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: clean }),
      });
      const data = await res.json().catch(() => ({}));

      if (data.success) {
        setCards(data.cards || []);
        setNewCode('');
        const count = data.count || (data.cards ? data.cards.length : 0);
        setActionMessage({
          ok: true,
          text:
            count >= 10
              ? 'تمت إضافة الكرت بنجاح! اكتمل رصيدك (10/10)، اضغط أدناه لفتح هديتك.'
              : `تمت إضافة الكرت بنجاح ✓ (المتبقي: ${10 - count} كروت).`,
        });
        soundManager.playSuccess();
      } else {
        setActionMessage({
          ok: false,
          text: data.error || 'تعذر إضافة الكرت إلى رصيدك.',
        });
        soundManager.playError();
      }
    } catch {
      setActionMessage({
        ok: false,
        text: 'تعذر الاتصال بالخادم. تحقق من اتصالك بشبكة طلقة نت.',
      });
      soundManager.playError();
    } finally {
      setAddingCode(false);
    }
  };

  // Redeem 10 cards and spin for gift
  const handleRedeemGift = async () => {
    if (!currentUser || redeeming || cards.length < 10) return;

    setRedeeming(true);
    setActionMessage(null);
    try {
      const token = await currentUser.getIdToken();
      const idempotencyKey = `wallet_${currentUser.uid}_${Date.now()}_${Math.random()
        .toString(36)
        .slice(2, 8)}`;

      const res = await fetch('/api/loyalty/wallet-redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ idempotencyKey }),
      });

      const data = await res.json().catch(() => ({}));

      if (data.success && data.wonTier && data.wonVoucher) {
        setCards([]);
        onWin({
          wonTier: data.wonTier,
          wonVoucher: data.wonVoucher,
          transactionId: data.transactionId,
          timestamp: data.timestamp || Date.now(),
        });
      } else {
        setActionMessage({
          ok: false,
          text: data.message || 'تعذر فتح الهدية حالياً. كروتك محفوظة بأمان في حسابك.',
        });
        soundManager.playError();
      }
    } catch {
      setActionMessage({
        ok: false,
        text: 'انقطع الاتصال. لا تقلق، كروتك العشرة ما زالت محفوظة في حسابك.',
      });
      soundManager.playError();
    } finally {
      setRedeeming(false);
    }
  };

  if (authLoading) {
    return (
      <div className="p-5 rounded-2xl bg-surface border border-border flex items-center justify-center gap-2 text-muted-foreground text-sm">
        <Loader2 className="w-4 h-4 animate-spin text-primary" />
        <span>جاري تهيئة الحساب...</span>
      </div>
    );
  }

  // State 1: User Not Signed In -> Offer Google Sign-in to stash cards
  if (!currentUser) {
    return (
      <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 text-primary">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              اجمع كروتك تدريجياً في حسابك
              <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                ميزة المشتركين
              </span>
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              ليس لديك 10 كروت الآن؟ سجّل دخولك بحساب Google وأضف كل كرت ينتهي لديك فوراً. عند اكتمال العشرة، ستفتح هديتك وتسحب من عجلة الحظ تلقائياً.
            </p>
          </div>
        </div>

        <div className="pt-1">
          <Button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={authActionBusy}
            variant="outline"
            className="w-full py-5 flex items-center justify-center gap-2.5 font-bold border-border hover:border-primary/50 text-foreground"
          >
            {authActionBusy ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            )}
            <span>تسجيل الدخول بنقرة واحدة عبر Google</span>
          </Button>

          {authError && (
            <p className="text-xs text-red-500 mt-2 text-center">{authError}</p>
          )}
        </div>
      </div>
    );
  }

  // State 2: User Signed In -> Show Wallet Balance, Card Adder, and Redeem Button
  const count = cards.length;
  const remaining = Math.max(0, 10 - count);
  const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'مشترك طلقة';

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-surface border border-border shadow-sm space-y-4">
      {/* Header: User Info & Sign Out */}
      <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
            {currentUser.photoURL ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={currentUser.photoURL}
                alt={displayName}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4" />
            )}
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-foreground truncate flex items-center gap-1.5">
              <span>رصيد كروتي</span>
              <span className="text-[10px] text-muted-foreground font-normal">({displayName})</span>
            </h3>
            <p className="text-[11px] text-muted-foreground truncate">{currentUser.email}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 px-2.5 py-1.5 rounded-lg hover:bg-muted transition-colors shrink-0"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>خروج</span>
        </button>
      </div>

      {/* Progress Counter & Bar */}
      <div className="space-y-2">
        <div className="flex items-end justify-between">
          <div>
            <span className="text-2xl font-black text-foreground">{count}</span>
            <span className="text-sm text-muted-foreground font-medium"> / 10 كروت</span>
          </div>
          <span
            className={`text-xs font-bold ${
              count >= 10 ? 'text-primary animate-pulse' : 'text-muted-foreground'
            }`}
          >
            {count >= 10 ? '★ هديتك مكتملة وجاهزة للفتح!' : `المتبقي: ${remaining} كروت`}
          </span>
        </div>

        {/* 10-Dot Indicator */}
        <div className="grid grid-cols-10 gap-1.5">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i < count
                  ? 'bg-primary shadow-[0_0_8px_rgba(234,179,8,0.4)]'
                  : 'bg-muted-foreground/20'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Action Area: Add Card OR Open Gift */}
      {count < 10 ? (
        <form onSubmit={handleAddCard} className="flex gap-2">
          <input
            type="text"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            placeholder="أدخل كرت منتهي (مثال: TLQ-200-...)"
            dir="ltr"
            disabled={addingCode}
            className="flex-1 min-w-0 px-3.5 py-2.5 rounded-xl bg-background border border-border text-sm font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          <Button
            type="submit"
            disabled={addingCode || !newCode.trim()}
            className="gap-1 font-bold shrink-0 px-4"
          >
            {addingCode ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            <span>إضافة</span>
          </Button>
        </form>
      ) : (
        <Button
          type="button"
          onClick={handleRedeemGift}
          disabled={redeeming || busy}
          size="lg"
          className="w-full py-5 text-base font-black gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          {redeeming ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>جاري فتح الهدية وتأكيد الكروت...</span>
            </>
          ) : (
            <>
              <Gift className="w-5 h-5 text-yellow-300 animate-bounce" />
              <span>افتح الهدية وأدر عجلة الحظ الآن!</span>
              <Sparkles className="w-4 h-4 text-yellow-300" />
            </>
          )}
        </Button>
      )}

      {/* Action Messages */}
      {actionMessage && (
        <div
          className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
            actionMessage.ok
              ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
              : 'bg-red-500/10 text-red-600 border border-red-500/20'
          }`}
        >
          {actionMessage.ok ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{actionMessage.text}</span>
        </div>
      )}

      {/* Cards List in Wallet */}
      {cards.length > 0 && (
        <div className="pt-1">
          <span className="text-[11px] text-muted-foreground block mb-2 font-medium">
            الكروت المحفوظة في حسابك ({cards.length}):
          </span>
          <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
            {cards.map((c, idx) => (
              <span
                key={c.code}
                dir="ltr"
                className="px-2.5 py-1 rounded-lg bg-background border border-border text-[11px] font-mono text-muted-foreground flex items-center gap-1.5"
              >
                <span className="text-primary font-bold text-[10px]">#{idx + 1}</span>
                <span>{c.code}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
