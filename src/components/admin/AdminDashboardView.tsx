'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Lock,
  LogOut,
  Gift,
  Coins,
  Database,
  History,
  FileSpreadsheet,
  Plus,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2,
  Settings,
  Tv,
  Package,
  MapPin,
  Megaphone,
  Download,
  Upload,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { Badge } from '@/src/components/ui/Badge';
import { Card } from '@/src/components/ui/Card';
import { getFirebaseAuth } from '@/src/lib/firebase/config';
import {
  signInWithPopup,
  signInWithRedirect,
  GoogleAuthProvider,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import { LoyaltyPrizeTier } from '@/src/types/loyalty';
import { soundManager } from '@/src/lib/audio/soundManager';

export function AdminDashboardView() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authToken, setAuthToken] = useState<string>('');
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [isOwnerUser, setIsOwnerUser] = useState(false);

  // Login & Bootstrap states
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);
  const [bootstrapMessage, setBootstrapMessage] = useState<string | null>(null);

  // New admin management
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);
  const [addAdminResult, setAddAdminResult] = useState<string | null>(null);

  // Tabs
  const [activeTab, setActiveTab] = useState<'vault' | 'tiers' | 'cards' | 'txs' | 'config' | 'cms'>('vault');

  // Vault state
  const [vaultSummary, setVaultSummary] = useState<any>(null);
  const [vaultList, setVaultList] = useState<any[]>([]);
  const [revealCodes, setRevealCodes] = useState(false);
  const [loadingVault, setLoadingVault] = useState(false);

  // Add Voucher Modal
  const [showAddVoucher, setShowAddVoucher] = useState(false);
  const [batchCsvText, setBatchCsvText] = useState('');
  const [selectedTierForAdd, setSelectedTierForAdd] = useState('tier_1000');
  const [addingVouchers, setAddingVouchers] = useState(false);

  // Tiers state
  const [tiers, setTiers] = useState<LoyaltyPrizeTier[]>([]);
  const [savingTiers, setSavingTiers] = useState(false);
  const [tierMessage, setTierMessage] = useState<string | null>(null);

  // Network cards import
  const [networkCardsCsv, setNetworkCardsCsv] = useState('');
  const [importingCards, setImportingCards] = useState(false);
  const [importResult, setImportResult] = useState<string | null>(null);

  // Transactions state
  const [transactions, setTransactions] = useState<any[]>([]);
  const [searchTx, setSearchTx] = useState('');
  const [loadingTxs, setLoadingTxs] = useState(false);

  // Contest Config state
  const [contestConfig, setContestConfig] = useState<{ enabled: boolean; dailyRedemptionLimit: number; rulesText: string }>({
    enabled: true,
    dailyRedemptionLimit: 5,
    rulesText: '',
  });
  const [savingConfig, setSavingConfig] = useState(false);

  // CMS Content
  const [cmsData, setCmsData] = useState<any>(null);
  const [loadingCms, setLoadingCms] = useState(false);

  // Verify and refresh claims
  const checkClaimsAndBootstrap = useCallback(async (user: User) => {
    try {
      let idTokenResult = await user.getIdTokenResult(false);
      let hasAdmin = Boolean(idTokenResult.claims.admin);
      let isOwner = idTokenResult.claims.role === 'owner';

      // If user doesn't have admin claim yet, attempt the single-use Owner Bootstrap
      if (!hasAdmin) {
        const token = await user.getIdToken();
        const bootRes = await fetch('/api/admin/bootstrap', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (bootRes.ok) {
          const bootData = await bootRes.json();
          if (bootData.success && bootData.isOwner) {
            setBootstrapMessage('🎉 مرحباً بك! تم تسجيل حسابك كمالك رئيسي (Owner) للتطبيق.');
            // Force refresh token to obtain newly set custom claims
            idTokenResult = await user.getIdTokenResult(true);
            hasAdmin = Boolean(idTokenResult.claims.admin);
            isOwner = idTokenResult.claims.role === 'owner';
          }
        }
      }

      setIsAdminUser(hasAdmin);
      setIsOwnerUser(isOwner);
      const finalToken = await user.getIdToken();
      setAuthToken(finalToken);
    } catch {
      setIsAdminUser(false);
    } finally {
      setAuthLoading(false);
    }
  }, []);

  // Listen to Firebase Auth
  useEffect(() => {
    let unsub = () => {};
    try {
      const auth = getFirebaseAuth();
      unsub = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user) {
          await checkClaimsAndBootstrap(user);
        } else {
          setAuthToken('');
          setIsAdminUser(false);
          setIsOwnerUser(false);
          setAuthLoading(false);
        }
      });
    } catch {
      queueMicrotask(() => setAuthLoading(false));
    }
    return () => unsub();
  }, [checkClaimsAndBootstrap]);

  const handleGoogleLogin = async () => {
    setLoginError(null);
    setLoggingIn(true);
    try {
      const auth = getFirebaseAuth();
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      try {
        const res = await signInWithPopup(auth, provider);
        setCurrentUser(res.user);
        await checkClaimsAndBootstrap(res.user);
        soundManager.playSuccess();
      } catch (popupErr: any) {
        // Fallback to redirect on mobile or blocked popups
        if (popupErr.code === 'auth/popup-blocked' || popupErr.code === 'auth/cancelled-popup-request') {
          await signInWithRedirect(auth, provider);
          return;
        }
        throw popupErr;
      }
    } catch (err: any) {
      if (err.code !== 'auth/popup-closed-by-user') {
        setLoginError(err.message || 'فشل تسجيل الدخول بحساب Google.');
        soundManager.playError();
      }
    } finally {
      setLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      const auth = getFirebaseAuth();
      await signOut(auth);
      setCurrentUser(null);
      setAuthToken('');
      setIsAdminUser(false);
      setIsOwnerUser(false);
    } catch {}
  };

  const handleAddAdminSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail.trim()) return;
    setAddingAdmin(true);
    setAddAdminResult(null);
    try {
      const res = await authFetch('/api/admin/admins/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newAdminEmail.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        soundManager.playSuccess();
        setAddAdminResult(data.message || 'تمت إضافة المشرف بنجاح.');
        setNewAdminEmail('');
      } else {
        soundManager.playError();
        setAddAdminResult(data.error || 'فشلت إضافة المشرف.');
      }
    } catch {
      setAddAdminResult('خطأ أثناء الاتصال بالخادم.');
    } finally {
      setAddingAdmin(false);
    }
  };

  // Helper for authorized API calls
  const authFetch = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const headers = new Headers(options.headers || {});
      if (authToken) {
        headers.set('Authorization', `Bearer ${authToken}`);
      }
      return fetch(url, { ...options, headers });
    },
    [authToken]
  );

  // Fetch Vault Data
  const loadVaultData = useCallback(async () => {
    if (!authToken && !currentUser) return;
    setLoadingVault(true);
    try {
      const res = await authFetch(`/api/admin/loyalty/vault?reveal=${revealCodes}`);
      const data = await res.json();
      if (data.success) {
        setVaultSummary(data.summary);
        setVaultList(data.vouchers || []);
      }
    } catch {}
    finally {
      setLoadingVault(false);
    }
  }, [authFetch, authToken, currentUser, revealCodes]);

  // Fetch Tiers Data
  const loadTiersData = useCallback(async () => {
    if (!authToken && !currentUser) return;
    try {
      const res = await authFetch('/api/admin/loyalty/tiers');
      const data = await res.json();
      if (data.success) {
        setTiers(data.tiers || []);
      }
    } catch {}
  }, [authFetch, authToken, currentUser]);

  // Fetch Transactions Data
  const loadTransactionsData = useCallback(async () => {
    if (!authToken && !currentUser) return;
    setLoadingTxs(true);
    try {
      const res = await authFetch(
        `/api/admin/loyalty/transactions${searchTx ? `?search=${encodeURIComponent(searchTx)}` : ''}`
      );
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
      }
    } catch {}
    finally {
      setLoadingTxs(false);
    }
  }, [authFetch, authToken, currentUser, searchTx]);

  // Fetch Config Data
  const loadConfigData = useCallback(async () => {
    if (!authToken && !currentUser) return;
    try {
      const res = await authFetch('/api/admin/loyalty/config');
      const data = await res.json();
      if (data.success && data.config) {
        setContestConfig(data.config);
      }
    } catch {}
  }, [authFetch, authToken, currentUser]);

  // Fetch CMS Data
  const loadCmsData = useCallback(async () => {
    if (!authToken && !currentUser) return;
    setLoadingCms(true);
    try {
      const res = await authFetch('/api/admin/content');
      const data = await res.json();
      if (data.success) {
        setCmsData(data.data);
      }
    } catch {}
    finally {
      setLoadingCms(false);
    }
  }, [authFetch, authToken, currentUser]);

  useEffect(() => {
    if (!currentUser && !authToken) return;
    const timer = setTimeout(() => {
      void loadVaultData();
      void loadTiersData();
      void loadTransactionsData();
      void loadConfigData();
    }, 0);
    return () => clearTimeout(timer);
  }, [currentUser, authToken, loadVaultData, loadTiersData, loadTransactionsData, loadConfigData]);

  // Handle Add Vouchers Submit
  const handleAddVouchersSubmit = async () => {
    if (!batchCsvText.trim()) return;
    setAddingVouchers(true);
    try {
      const lines = batchCsvText
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const items = lines.map((line) => {
        // Can be "CODE" or "CODE,tier_id"
        const parts = line.split(/[,\t]/);
        return {
          code: parts[0]?.trim() || '',
          tierId: parts[1]?.trim() || selectedTierForAdd,
        };
      });

      const res = await authFetch('/api/admin/loyalty/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vouchers: items }),
      });
      const data = await res.json();
      if (data.success) {
        soundManager.playSuccess();
        setShowAddVoucher(false);
        setBatchCsvText('');
        void loadVaultData();
      } else {
        alert(data.error || 'خطأ أثناء إضافة الكروت');
      }
    } catch {
      alert('تعذر الاتصال بالخادم');
    } finally {
      setAddingVouchers(false);
    }
  };

  // Handle Tiers Save
  const handleSaveTiers = async () => {
    const total = tiers.reduce((sum, t) => sum + (Number(t.probabilityWeight) || 0), 0);
    if (total !== 100) {
      setTierMessage(`خطأ: مجموع النسب يجب أن يساوي 100% بالضبط (المجموع الحالي: ${total}%)`);
      soundManager.playError();
      return;
    }

    setSavingTiers(true);
    setTierMessage(null);
    try {
      const res = await authFetch('/api/admin/loyalty/tiers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tiers }),
      });
      const data = await res.json();
      if (data.success) {
        soundManager.playSuccess();
        setTierMessage('تم حفظ أوزان الفئات بنجاح ✓');
      } else {
        setTierMessage(data.error || 'فشل حفظ الفئات.');
      }
    } catch {
      setTierMessage('خطأ في الاتصال بالخادم.');
    } finally {
      setSavingTiers(false);
    }
  };

  // Handle Network Cards Import
  const handleImportNetworkCards = async () => {
    if (!networkCardsCsv.trim()) return;
    setImportingCards(true);
    setImportResult(null);
    try {
      const lines = networkCardsCsv
        .split('\n')
        .map((l) => l.trim())
        .filter(Boolean);

      const items = lines.map((l) => {
        const parts = l.split(/[,\t]/);
        return {
          code: parts[0]?.trim() || '',
          packageName: parts[1]?.trim() || 'كرت طلقة',
          price: parts[2] ? parseInt(parts[2], 10) : 500,
          status: 'exhausted',
        };
      });

      const res = await authFetch('/api/admin/loyalty/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards: items }),
      });
      const data = await res.json();
      if (data.success) {
        soundManager.playSuccess();
        setImportResult(`تم استيراد ${data.imported} كرت شبكة بنجاح ✓`);
        setNetworkCardsCsv('');
      } else {
        setImportResult(data.error || 'فشل الاستيراد.');
      }
    } catch {
      setImportResult('خطأ في الاتصال.');
    } finally {
      setImportingCards(false);
    }
  };

  // Handle Contest Config Save
  const handleSaveConfig = async () => {
    setSavingConfig(true);
    try {
      const res = await authFetch('/api/admin/loyalty/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contestConfig),
      });
      const data = await res.json();
      if (data.success) {
        soundManager.playSuccess();
        alert('تم حفظ إعدادات المسابقة بنجاح.');
      }
    } catch {
      alert('خطأ في الحفظ.');
    } finally {
      setSavingConfig(false);
    }
  };

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-gold border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-ink-2 font-medium">جاري التحقق من هوية وصلاحيات المشرف...</p>
        </div>
      </div>
    );
  }

  // Login View if not authenticated
  if (!currentUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-7 bg-surface rounded-3xl border border-line shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold shadow-inner">
              <Shield className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-black text-ink">لوحة إدارة شبكة طلقة نت</h1>
            <p className="text-xs text-ink-2 leading-relaxed">
              تسجيل دخول آمن ومحمي للمشرفين والمالك عبر حساب Google الموثق
            </p>
          </div>

          {bootstrapMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
              <span>{bootstrapMessage}</span>
            </div>
          )}

          {loginError && (
            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2.5">
              <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
              <span>{loginError}</span>
            </div>
          )}

          <div className="space-y-4 pt-2">
            <Button
              type="button"
              disabled={loggingIn}
              onClick={handleGoogleLogin}
              className="w-full py-4 bg-white hover:bg-neutral-50 text-neutral-800 border-2 border-neutral-200 dark:border-neutral-700 font-bold text-sm shadow-sm flex items-center justify-center gap-3 transition-transform active:scale-[0.99]"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{loggingIn ? 'جاري التحقق والمصادقة...' : 'الدخول بحساب Google'}</span>
            </Button>

            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed text-[11px]">
                <strong className="block text-amber-900 dark:text-amber-100 mb-0.5">بروتوكول الأمان الصارم:</strong>
                أول حساب Google موثق يقوم بتسجيل الدخول يتم اعتماده تلقائياً كمالك رئيسي (Owner). الحسابات الأخرى تتطلب تفويضاً صريحاً من المالك.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // User is logged in but has no admin privileges
  if (currentUser && !isAdminUser) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-4">
        <div className="w-full max-w-md p-7 bg-surface rounded-3xl border border-red-200 dark:border-red-900/50 shadow-xl space-y-5 text-center">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-red-100 dark:bg-red-950/60 border border-red-200 dark:border-red-800 flex items-center justify-center text-red-600">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-lg font-black text-ink">هذا الحساب ليس مشرفاً</h2>
          <p className="text-xs text-ink-2 leading-relaxed">
            تم تسجيل الدخول بواسطة: <span className="font-mono font-bold text-ink">{currentUser.email || currentUser.uid}</span>
            <br />
            هذا الحساب لا يملك صلاحيات الإشراف في شبكة طلقة نت، ولا تتوفر له أي بيانات أو إعدادات.
          </p>

          <div className="pt-2">
            <Button
              variant="outline"
              onClick={handleLogout}
              className="w-full py-3 text-red-600 border-red-200 hover:bg-red-50 text-xs font-bold"
            >
              <LogOut className="w-4 h-4 ml-2" />
              تسجيل الخروج والتبديل لحساب آخر
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Top Admin Header */}
      <header className="p-5 rounded-3xl bg-surface border border-line shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-gold/15 text-gold border border-gold/30">
              <Shield className="w-5 h-5" />
            </span>
            <div>
              <h1 className="text-lg font-black text-ink">لوحة الإدارة والتحكم السحابية</h1>
              <p className="text-xs text-ink-2">
                المشرف: <span className="font-mono text-network font-bold">{currentUser?.email || 'مشرف معتمد'}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <Button
            size="sm"
            variant="outline"
            onClick={handleLogout}
            className="text-xs gap-1.5 text-red-600 hover:bg-red-50"
          >
            <LogOut className="w-3.5 h-3.5" /> تسجيل خروج
          </Button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="flex overflow-x-auto gap-1.5 p-1.5 rounded-2xl bg-surface border border-line shadow-xs no-scrollbar">
        <button
          onClick={() => setActiveTab('vault')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'vault' ? 'bg-gold text-white shadow-xs' : 'text-ink-2 hover:bg-black/5'
          }`}
        >
          <Gift className="w-4 h-4" /> صندوق الجوائز
        </button>

        <button
          onClick={() => setActiveTab('tiers')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'tiers' ? 'bg-gold text-white shadow-xs' : 'text-ink-2 hover:bg-black/5'
          }`}
        >
          <Coins className="w-4 h-4" /> فئات وأوزان السحب
        </button>

        <button
          onClick={() => setActiveTab('cards')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'cards' ? 'bg-gold text-white shadow-xs' : 'text-ink-2 hover:bg-black/5'
          }`}
        >
          <Database className="w-4 h-4" /> كروت الشبكة
        </button>

        <button
          onClick={() => setActiveTab('txs')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'txs' ? 'bg-gold text-white shadow-xs' : 'text-ink-2 hover:bg-black/5'
          }`}
        >
          <History className="w-4 h-4" /> سجل الفائزين
        </button>

        <button
          onClick={() => setActiveTab('config')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'config' ? 'bg-gold text-white shadow-xs' : 'text-ink-2 hover:bg-black/5'
          }`}
        >
          <Settings className="w-4 h-4" /> إعدادات المسابقة
        </button>

        <button
          onClick={() => {
            setActiveTab('cms');
            void loadCmsData();
          }}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
            activeTab === 'cms' ? 'bg-gold text-white shadow-xs' : 'text-ink-2 hover:bg-black/5'
          }`}
        >
          <Megaphone className="w-4 h-4" /> المحتوى والباقات
        </button>
      </nav>

      {/* ============================================================== */}
      {/* TAB 1: PRIZE VAULT */}
      {/* ============================================================== */}
      {activeTab === 'vault' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          {vaultSummary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-4 rounded-2xl bg-surface border border-line shadow-xs">
                <span className="text-[11px] font-bold text-ink-2">إجمالي الكروت بالخزينة</span>
                <p className="text-xl font-black text-ink mt-1">{vaultSummary.totalVouchers}</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-line shadow-xs">
                <span className="text-[11px] font-bold text-emerald-700">الكروت المتاحة للسحب</span>
                <p className="text-xl font-black text-emerald-600 mt-1">{vaultSummary.availableVouchers}</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-line shadow-xs">
                <span className="text-[11px] font-bold text-network">الجوائز المسلّمة</span>
                <p className="text-xl font-black text-network mt-1">{vaultSummary.claimedVouchers}</p>
              </div>
              <div className="p-4 rounded-2xl bg-surface border border-line shadow-xs">
                <span className="text-[11px] font-bold text-gold">حالة المخزون</span>
                <p className="text-xs font-bold text-ink mt-2">
                  {vaultSummary.availableVouchers > 5 ? 'مستقر ومتوفر ✓' : 'تنبيه: مخزون منخفض'}
                </p>
              </div>
            </div>
          )}

          {/* Low stock alert cards */}
          {vaultSummary?.stockByTier?.some((t: any) => t.lowStock) && (
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <span className="text-xs font-bold">
                  تنبيه انخفاض المخزون: بعض فئات الجوائز قاربت على النفاد، يُرجى شحن الخزينة بكروت جديدة.
                </span>
              </div>
              <Button size="sm" onClick={() => setShowAddVoucher(true)} className="text-xs shrink-0">
                شحن الآن
              </Button>
            </div>
          )}

          {/* Stock by Tier breakdown */}
          <div className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-ink">مخزون الجوائز حسب الفئة</h3>
              <Button size="sm" onClick={() => setShowAddVoucher(true)} className="text-xs gap-1.5">
                <Plus className="w-4 h-4" /> إضافة كروت جوائز
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {vaultSummary?.stockByTier?.map((tier: any) => (
                <div
                  key={tier.tierId}
                  className="p-3.5 rounded-2xl bg-bg border border-line space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-ink truncate">{tier.tierName}</span>
                    <Badge variant={tier.available > 0 ? 'network' : 'warn'} size="sm">
                      {tier.available} متبقي
                    </Badge>
                  </div>
                  <div className="text-[11px] text-ink-2">
                    المستهلك: {tier.claimed} | الإجمالي: {tier.total}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Vouchers Table */}
          <div className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-black text-ink">قائمة كروت الجوائز في الخزينة</h3>
                <p className="text-[11px] text-ink-2">
                  الأكواد مخفية افتراضياً لحمايتها من التسريب، ويمكن كشفها بنقرة واحدة
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setRevealCodes(!revealCodes);
                }}
                className="text-xs gap-1.5"
              >
                {revealCodes ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {revealCodes ? 'إخفاء الأكواد' : 'كشف الأكواد'}
              </Button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full text-right text-xs">
                <thead className="bg-bg text-ink-2 border-b border-line">
                  <tr>
                    <th className="p-3 font-bold">الفئة</th>
                    <th className="p-3 font-bold">كود الجائزة</th>
                    <th className="p-3 font-bold">السعر</th>
                    <th className="p-3 font-bold">الحالة</th>
                    <th className="p-3 font-bold">معرّف المعاملة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {vaultList.map((v) => (
                    <tr key={v.id} className="hover:bg-bg/50 transition">
                      <td className="p-3 font-bold text-ink">{v.tierName}</td>
                      <td className="p-3 font-mono font-bold text-network" dir="ltr">
                        {v.code}
                      </td>
                      <td className="p-3">{v.price} ر.ي</td>
                      <td className="p-3">
                        <Badge variant={v.claimed ? 'warn' : 'network'} size="sm">
                          {v.claimed ? 'تم التسليم' : 'جاهز للسحب'}
                        </Badge>
                      </td>
                      <td className="p-3 font-mono text-ink-2">{v.wonByTransactionId || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: TIERS & WEIGHTS */}
      {/* ============================================================== */}
      {activeTab === 'tiers' && (
        <div className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-black text-ink">تعديل نسب وفئات الجوائز</h3>
              <p className="text-xs text-ink-2">
                التحكم باحتمالية ظهور كل جائزة عند دوران العجلة. مجموع النسب يجب أن يكون 100%.
              </p>
            </div>
            <Button
              size="sm"
              disabled={savingTiers}
              onClick={handleSaveTiers}
              className="text-xs gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" /> حفظ الأوزان
            </Button>
          </div>

          {tierMessage && (
            <div className="p-3 rounded-xl bg-bg border border-line text-xs font-bold text-ink">
              {tierMessage}
            </div>
          )}

          <div className="space-y-3">
            {tiers.map((tier, index) => (
              <div
                key={tier.id}
                className="p-4 rounded-2xl bg-bg border border-line space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-ink text-sm">{tier.name}</span>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-surface border border-line">
                    {tier.probabilityWeight}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-ink-2 mb-1">اسم الجائزة بالعربية</label>
                    <input
                      type="text"
                      value={tier.name}
                      onChange={(e) => {
                        const updated = [...tiers];
                        updated[index]!.name = e.target.value;
                        setTiers(updated);
                      }}
                      className="w-full p-2.5 rounded-xl bg-surface border border-line text-xs text-ink focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-ink-2 mb-1">بيانات الباقة (جيجابايت)</label>
                    <input
                      type="text"
                      value={tier.dataLabel}
                      onChange={(e) => {
                        const updated = [...tiers];
                        updated[index]!.dataLabel = e.target.value;
                        setTiers(updated);
                      }}
                      className="w-full p-2.5 rounded-xl bg-surface border border-line text-xs text-ink focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-ink-2 mb-1">نسبة الفوز (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={tier.probabilityWeight}
                      onChange={(e) => {
                        const updated = [...tiers];
                        updated[index]!.probabilityWeight = Number(e.target.value);
                        setTiers(updated);
                      }}
                      className="w-full p-2.5 rounded-xl bg-surface border border-line text-xs font-mono font-bold text-ink focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 rounded-xl bg-gold-soft border border-gold/30 text-xs text-ink flex items-center justify-between">
            <span className="font-bold">المجموع الإجمالي للنسب:</span>
            <span className="font-mono font-black text-sm text-gold">
              {tiers.reduce((s, t) => s + (Number(t.probabilityWeight) || 0), 0)}%
            </span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: NETWORK CARDS IMPORT */}
      {/* ============================================================== */}
      {activeTab === 'cards' && (
        <div className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-black text-ink">استيراد كروت شبكة طلقة (MikroTik / CSV)</h3>
            <p className="text-xs text-ink-2">
              تغذية قاعدة بيانات السيرفر بأرقام كروت هوتسبوت ميكروتك المستهلكة ليتحقق منها السيرفر قبل السماح بالاستبدال.
            </p>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-bold text-ink">
              الصق أسطر الكروت (الكود, اسم الباقة, السعر):
            </label>
            <textarea
              rows={8}
              value={networkCardsCsv}
              onChange={(e) => setNetworkCardsCsv(e.target.value)}
              placeholder="TLQ-200-112233,كرت 200 ريال,200&#10;TLQ-500-101010,كرت 500 ريال,500&#10;..."
              className="w-full p-3.5 rounded-2xl bg-bg border border-line font-mono text-xs text-ink focus:outline-none"
              dir="ltr"
            />

            {importResult && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                {importResult}
              </div>
            )}

            <div className="flex justify-end">
              <Button
                disabled={importingCards || !networkCardsCsv.trim()}
                onClick={handleImportNetworkCards}
                className="text-xs gap-1.5"
              >
                <Upload className="w-4 h-4" />
                {importingCards ? 'جاري الاستيراد والحفظ...' : 'استيراد الكروت إلى السيرفر'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: TRANSACTIONS LOG */}
      {/* ============================================================== */}
      {activeTab === 'txs' && (
        <div className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-ink">سجل عمليات الاستبدال والفائزين</h3>
              <p className="text-xs text-ink-2">
                جميع المعاملات التي تمت عبر السيرفر مع تفاصيل الكروت الـ 10 المحروقة
              </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <input
                  type="text"
                  value={searchTx}
                  onChange={(e) => setSearchTx(e.target.value)}
                  placeholder="بحث بمعرّف أو كود..."
                  className="w-full py-1.5 px-3 pr-8 rounded-xl bg-bg border border-line text-xs text-ink focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-ink-2 absolute top-2.5 right-2.5" />
              </div>
              <a
                href={`/api/admin/loyalty/transactions?format=csv`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-surface border border-line text-xs font-bold text-ink hover:bg-black/5 transition"
              >
                <Download className="w-3.5 h-3.5" /> تصدير CSV
              </a>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-line">
            <table className="w-full text-right text-xs">
              <thead className="bg-bg text-ink-2 border-b border-line">
                <tr>
                  <th className="p-3 font-bold">معرّف المعاملة</th>
                  <th className="p-3 font-bold">التاريخ</th>
                  <th className="p-3 font-bold">الجائزة الرابحة</th>
                  <th className="p-3 font-bold">كود الجائزة</th>
                  <th className="p-3 font-bold">الكروت المحروقة (10)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {transactions.map((tx) => (
                  <tr key={tx.transactionId} className="hover:bg-bg/50 transition">
                    <td className="p-3 font-mono font-bold text-ink">{tx.transactionId}</td>
                    <td className="p-3 text-ink-2">
                      {new Date(tx.timestamp).toLocaleString('ar-YE', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 font-bold text-gold">{tx.wonTierName}</td>
                    <td className="p-3 font-mono font-bold text-network" dir="ltr">
                      {tx.wonCode}
                    </td>
                    <td className="p-3 text-[11px] font-mono text-ink-2 max-w-xs truncate" title={tx.burnedCards.join(', ')}>
                      {tx.burnedCards.length} كروت: {tx.burnedCards.slice(0, 3).join(', ')}...
                    </td>
                  </tr>
                ))}
                {transactions.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-ink-2">
                      لا توجد معاملات مسجلة بعد.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 5: CONTEST SETTINGS & TOGGLE */}
      {/* ============================================================== */}
      {activeTab === 'config' && (
        <div className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-5">
          <div>
            <h3 className="text-sm font-black text-ink">التحكم العام بالمسابقة</h3>
            <p className="text-xs text-ink-2">
              تشغيل أو إيقاف المسابقة وتحديد السقف اليومي لعمليات الاستبدال لكل مشترك
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-bg border border-line space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-ink text-sm block">حالة المسابقة</span>
                <span className="text-xs text-ink-2">
                  عند الإيقاف، لا يمكن للمشتركين تدوير العجلة أو استبدال الكروت
                </span>
              </div>
              <button
                type="button"
                onClick={() => setContestConfig({ ...contestConfig, enabled: !contestConfig.enabled })}
                className={`w-12 h-7 rounded-full p-1 transition-colors ${
                  contestConfig.enabled ? 'bg-emerald-600' : 'bg-zinc-300'
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    contestConfig.enabled ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                الحد اليومي لعدد الاستبدالات لكل مشترك
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={contestConfig.dailyRedemptionLimit}
                onChange={(e) =>
                  setContestConfig({ ...contestConfig, dailyRedemptionLimit: Number(e.target.value) })
                }
                className="w-32 p-2.5 rounded-xl bg-surface border border-line text-sm font-bold text-ink focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                نص الشروط والملاحظات الخاصة بالمسابقة
              </label>
              <textarea
                rows={3}
                value={contestConfig.rulesText}
                onChange={(e) => setContestConfig({ ...contestConfig, rulesText: e.target.value })}
                className="w-full p-3 rounded-xl bg-surface border border-line text-xs text-ink focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button disabled={savingConfig} onClick={handleSaveConfig} className="text-xs gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> حفظ إعدادات المسابقة
            </Button>
          </div>

          {/* Owner Admin Management Section */}
          <div className="mt-6 pt-6 border-t border-line space-y-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-gold" />
                <h4 className="text-sm font-black text-ink">صلاحيات وإدارة المشرفين</h4>
              </div>
              <p className="text-xs text-ink-2 mt-0.5">
                تخويل حسابات Google إضافية للوصول إلى لوحة الإدارة وإسناد صلاحيات المشرف
              </p>
            </div>

            <form onSubmit={handleAddAdminSubmit} className="p-4 rounded-2xl bg-bg border border-line space-y-3">
              <label className="block text-xs font-bold text-ink">
                إضافة بريد مشرف جديد (حساب Google)
              </label>
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  dir="ltr"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                  placeholder="partner@gmail.com"
                  className="flex-1 p-2.5 rounded-xl bg-surface border border-line text-xs text-ink focus:outline-none"
                />
                <Button type="submit" disabled={addingAdmin || !newAdminEmail.trim()} className="text-xs gap-1.5 shrink-0">
                  <Plus className="w-3.5 h-3.5" />
                  {addingAdmin ? 'جاري الإضافة...' : 'إضافة مشرف'}
                </Button>
              </div>

              {addAdminResult && (
                <p className="text-xs font-bold text-gold">{addAdminResult}</p>
              )}
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 6: CONTENT CMS */}
      {/* ============================================================== */}
      {activeTab === 'cms' && (
        <div className="p-5 rounded-3xl bg-surface border border-line shadow-xs space-y-4">
          <div>
            <h3 className="text-sm font-black text-ink">إدارة محتوى الشبكة (CMS)</h3>
            <p className="text-xs text-ink-2">
              استعراض وتحديث الباقات ونقاط التوزيع وإعلانات الشبكة وقنوات البث المباشر
            </p>
          </div>

          {loadingCms ? (
            <div className="p-8 text-center text-xs text-ink-2">جاري جلب المحتوى...</div>
          ) : cmsData ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-bg border border-line space-y-2">
                <span className="font-bold text-ink text-xs block">باقات الكروت المسجلة ({cmsData.packages?.length})</span>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {cmsData.packages?.map((pkg: any) => (
                    <div key={pkg.id} className="p-3 bg-surface rounded-xl border border-line text-xs">
                      <span className="font-bold text-ink block">{pkg.name}</span>
                      <span className="text-[11px] text-gold font-mono">{pkg.price} ر.ي</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-bg border border-line space-y-2">
                <span className="font-bold text-ink text-xs block">نقاط التوزيع في مأرب ({cmsData.distributors?.length})</span>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {cmsData.distributors?.map((dist: any) => (
                    <div key={dist.id} className="p-3 bg-surface rounded-xl border border-line text-xs space-y-1">
                      <span className="font-bold text-ink block">{dist.name}</span>
                      <span className="text-[11px] text-ink-2 block">{dist.area} • {dist.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}

      {/* Add Voucher Modal */}
      {showAddVoucher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-surface rounded-3xl border border-line p-5 shadow-2xl space-y-4">
            <h3 className="text-base font-black text-ink">إضافة كروت جوائز جديدة إلى الخزينة</h3>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">الفئة الافتراضية</label>
              <select
                value={selectedTierForAdd}
                onChange={(e) => setSelectedTierForAdd(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-bg border border-line text-xs text-ink focus:outline-none"
              >
                {tiers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.price} ر.ي)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-ink mb-1.5">
                أكواد الكروت (كود في كل سطر):
              </label>
              <textarea
                rows={5}
                value={batchCsvText}
                onChange={(e) => setBatchCsvText(e.target.value)}
                placeholder="TLQ-WIN-1000-112233&#10;TLQ-WIN-1000-445566&#10;..."
                className="w-full p-3 rounded-xl bg-bg border border-line font-mono text-xs text-ink focus:outline-none"
                dir="ltr"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => setShowAddVoucher(false)}>
                إلغاء
              </Button>
              <Button
                size="sm"
                disabled={addingVouchers || !batchCsvText.trim()}
                onClick={handleAddVouchersSubmit}
              >
                {addingVouchers ? 'جاري الإضافة...' : 'حفظ الكروت في الخزينة'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
