'use client';

import React, { useEffect, useSyncExternalStore, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Zap,
  Home,
  Radio,
  Gauge,
  Gift,
  Gamepad2,
  Bell,
  ArrowLeft,
  Download,
  X,
  LogIn,
  LogOut,
  Wifi,
  Layers,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';
import { useIsClient } from '@/src/hooks/useIsClient';

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
  shortLabel?: string;
}

const nav: NavItem[] = [
  { to: '/', label: 'الرئيسية', icon: Home, shortLabel: 'الرئيسية' },
  { to: '/packages', label: 'الباقات والخريطة', icon: Layers, shortLabel: 'الباقات' },
  { to: '/lounge', label: 'الاستراحة', icon: Gamepad2, shortLabel: 'الاستراحة' },
  { to: '/live', label: 'البث المباشر', icon: Radio, shortLabel: 'المباشر' },
  { to: '/speed', label: 'فحص السرعة', icon: Gauge, shortLabel: 'السرعة' },
  { to: '/rewards', label: 'مكافآت الانتماء', icon: Gift, shortLabel: 'المكافآت' },
];

let userListeners: Array<() => void> = [];
function emitUserChange() {
  for (const listener of userListeners) {
    listener();
  }
}

function readStoredUser(): { email: string } | null {
  if (typeof window === 'undefined') return null;
  try {
    const saved = localStorage.getItem('talqa_user');
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

const userStore = {
  subscribe(listener: () => void) {
    userListeners = [...userListeners, listener];
    return () => {
      userListeners = userListeners.filter((l) => l !== listener);
    };
  },
  getSnapshot(): { email: string } | null {
    return readStoredUser();
  },
  getServerSnapshot(): { email: string } | null {
    return null;
  },
  setUser(userData: { email: string } | null) {
    if (typeof window !== 'undefined') {
      try {
        if (userData) {
          localStorage.setItem('talqa_user', JSON.stringify(userData));
        } else {
          localStorage.removeItem('talqa_user');
        }
      } catch {
        // ignore
      }
      emitUserChange();
    }
  },
};

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isClient = useIsClient();
  const [auth, setAuth] = useState(false);
  const [notice, setNotice] = useState(false);
  const [install, setInstall] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [signup, setSignup] = useState(false);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const rawUser = useSyncExternalStore(
    userStore.subscribe,
    userStore.getSnapshot,
    userStore.getServerSnapshot
  );
  const user = isClient ? rawUser : null;

  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage('');

    try {
      if (!email.includes('@')) {
        setMessage('يرجى إدخال بريد إلكتروني صحيح.');
        setBusy(false);
        return;
      }
      if (password.length < 6) {
        setMessage('كلمة المرور يجب أن لا تقل عن 6 أحرف.');
        setBusy(false);
        return;
      }

      userStore.setUser({ email });
      setAuth(false);
      setEmail('');
      setPassword('');
    } catch {
      setMessage('تعذر إتمام العملية، حاول مجددًا.');
    } finally {
      setBusy(false);
    }
  }

  function handleGoogleLogin() {
    userStore.setUser({ email: 'user@talqa-net.ye' });
    setAuth(false);
  }

  function handleSignOut() {
    userStore.setUser(null);
  }

  const isCurrent = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname?.startsWith(path);
  };

  return (
    <>
      {/* App Header */}
      <header className="app-header">
        <div className="header-inner">
          <Link href="/" className="brand">
            <span className="brand-icon">
              <Zap fill="currentColor" />
            </span>
            <span>
              طلقة<span className="text-primary"> نت</span>
              <small>TALQA NET</small>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="التنقل الرئيسي">
            {nav.map((n) => {
              const active = isCurrent(n.to);
              return (
                <Link
                  key={n.to}
                  href={n.to}
                  className={active ? 'nav-link active' : 'nav-link'}
                >
                  {n.label}
                  {n.to === '/live' && <span className="live-dot" />}
                </Link>
              );
            })}
          </nav>

          <div className="header-actions">
            <Button
              variant="ghost"
              size="icon"
              aria-label="الإشعارات"
              onClick={() => setNotice(true)}
            >
              <Bell />
            </Button>
            <span className="header-divider" />
            <Button
              variant="outline"
              className="account-button"
              onClick={() => (user ? handleSignOut() : setAuth(true))}
            >
              {user ? <LogOut /> : <LogIn />}
              <span>{user ? 'خروج' : 'تسجيل الدخول'}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="app-main">{children}</main>

      {/* App Footer */}
      <footer className="app-footer">
        <Link href="/" className="footer-brand">
          <Zap size={18} /> طلقة نت
        </Link>
        <span>اتصال يجمعنا. وانتماء يكافئك.</span>
        <Button variant="ghost" onClick={() => setInstall(true)}>
          <Download /> أضف التطبيق إلى جوالك
        </Button>
      </footer>

      {/* Fixed Mobile Bottom Navigation */}
      <nav className="mobile-nav" aria-label="تنقل الجوال">
        {nav.map((n) => {
          const active = isCurrent(n.to);
          const Icon = n.icon;
          return (
            <Link
              key={n.to}
              href={n.to}
              className={active ? 'mobile-link active' : 'mobile-link'}
            >
              <Icon />
              <span>{n.shortLabel || n.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Auth Modal */}
      {auth && (
        <div className="modal-backdrop" onClick={() => setAuth(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="تسجيل الدخول"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="modal-close"
              onClick={() => setAuth(false)}
              aria-label="إغلاق"
            >
              <X />
            </Button>
            <span className="brand-icon">
              <Zap fill="currentColor" />
            </span>
            <h2>{signup ? 'انضم إلى طلقة نت' : 'أهلًا بعودتك'}</h2>
            <p>انتماؤك يبدأ من هنا.</p>

            <form onSubmit={handleAuth}>
              <label>
                البريد الإلكتروني
                <input
                  required
                  type="email"
                  dir="ltr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                />
              </label>
              <label>
                كلمة المرور
                <input
                  required
                  minLength={6}
                  type="password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </label>
              {message && (
                <p className="form-message" role="status">
                  {message}
                </p>
              )}
              <Button disabled={busy} className="w-full" type="submit">
                {busy ? 'جارٍ الاتصال…' : signup ? 'إنشاء حساب' : 'تسجيل الدخول'}
                <ArrowLeft />
              </Button>
            </form>

            <div className="auth-separator">أو</div>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              المتابعة باستخدام Google
            </Button>
            <Button
              variant="link"
              className="w-full mt-3"
              onClick={() => {
                setSignup(!signup);
                setMessage('');
              }}
            >
              {signup ? 'لديك حساب؟ تسجيل الدخول' : 'جديد هنا؟ أنشئ حسابًا'}
            </Button>
          </section>
        </div>
      )}

      {/* Notice / Install Modal */}
      {(notice || install) && (
        <div
          className="modal-backdrop"
          onClick={() => {
            setNotice(false);
            setInstall(false);
          }}
        >
          <section
            className="modal small"
            role="dialog"
            aria-modal="true"
            aria-label={notice ? 'الإشعارات' : 'إضافة التطبيق'}
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              variant="ghost"
              size="icon"
              className="modal-close"
              aria-label="إغلاق"
              onClick={() => {
                setNotice(false);
                setInstall(false);
              }}
            >
              <X />
            </Button>
            {notice ? (
              <Bell className="text-primary" />
            ) : (
              <Download className="text-primary" />
            )}
            <h2>{notice ? 'كل جديد… هنا' : 'طلقة نت، أقرب لك'}</h2>
            <p>
              {notice
                ? 'لا توجد إشعارات جديدة حاليًا. شبكة طلقة نت تعمل بكفاءة عالية وبسرعات فائقة.'
                : 'من قائمة المتصفح اختر «إضافة إلى الشاشة الرئيسية». في آيفون، افتح التطبيق في Safari ثم اضغط زر المشاركة.'}
            </p>
            <div className="connection-note">
              <Wifi size={16} />{' '}
              {notice
                ? 'سنعلن هنا عن البث والمكافآت عند توفرها.'
                : 'أيقونة واحدة لعالم طلقة نت المتكامل.'}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
