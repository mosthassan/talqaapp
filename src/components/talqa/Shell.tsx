'use client';

import React, { useState, type ReactNode } from 'react';
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
  Download,
  X,
  Layers,
} from 'lucide-react';
import { Button } from '@/src/components/ui/Button';

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

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [notice, setNotice] = useState(false);
  const [install, setInstall] = useState(false);

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
            <Button
              variant="outline"
              size="sm"
              className="text-xs hidden sm:flex items-center gap-1.5"
              onClick={() => setInstall(true)}
            >
              <Download className="w-3.5 h-3.5" />
              <span>تثبيت التطبيق</span>
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
              onClick={() => {
                setNotice(false);
                setInstall(false);
              }}
              aria-label="إغلاق"
            >
              <X />
            </Button>

            {notice ? (
              <>
                <span className="brand-icon">
                  <Bell />
                </span>
                <h2>مركز الإشعارات</h2>
                <p>
                  أهلاً بك في شبكة طلقة نت بمأرب. كافة خدمات الاستراحة والبث المباشر
                  تعمل مجاناً عند اتصالك بواي فاي الشبكة.
                </p>
                <div className="connection-note">
                  <span className="status-dot" /> شبكة طلقة نت متصلة
                </div>
              </>
            ) : (
              <>
                <span className="brand-icon">
                  <Download />
                </span>
                <h2>تثبيت التطبيق على جهازك</h2>
                <p>
                  يمكنك تثبيت تطبيق طلقة نت كتطبيق مستقل (PWA) على هاتفك الذكي
                  ليعمل بسلاسة وسرعة فائقة حتى بدون اتصال بالإنترنت.
                </p>
                <Button
                  className="w-full mt-2"
                  onClick={() => {
                    setInstall(false);
                  }}
                >
                  فهمت ذلك
                </Button>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
