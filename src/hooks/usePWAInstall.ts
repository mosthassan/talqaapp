'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

function subscribeInstalled(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mql = window.matchMedia('(display-mode: standalone)');
  mql.addEventListener('change', callback);
  window.addEventListener('appinstalled', callback);
  return () => {
    mql.removeEventListener('change', callback);
    window.removeEventListener('appinstalled', callback);
  };
}

function getInstalledSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

function getInstalledServerSnapshot(): boolean {
  return false;
}

function subscribeNoop() {
  return () => {};
}

function getIOSSnapshot(): boolean {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return (
    /iphone|ipad|ipod/.test(userAgent) &&
    !(window as unknown as { MSStream?: unknown }).MSStream
  );
}

function getIOSServerSnapshot(): boolean {
  return false;
}

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [justInstalled, setJustInstalled] = useState(false);

  const isStandalone = useSyncExternalStore(
    subscribeInstalled,
    getInstalledSnapshot,
    getInstalledServerSnapshot
  );

  const isIOS = useSyncExternalStore(
    subscribeNoop,
    getIOSSnapshot,
    getIOSServerSnapshot
  );

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setJustInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setJustInstalled(true);
      setDeferredPrompt(null);
      return true;
    }
    return false;
  };

  const isInstalled = isStandalone || justInstalled;

  return {
    isInstallable: !!deferredPrompt,
    isInstalled,
    isIOS,
    install,
  };
}
