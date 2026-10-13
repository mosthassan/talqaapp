'use client';

import React, { useEffect, useState } from 'react';
import { Toast } from '@/src/components/ui/Toast';

export const ServiceWorkerManager: React.FC = () => {
  const [hasUpdate, setHasUpdate] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const registerSW = async () => {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');

        // Check if there is already a waiting worker
        if (registration.waiting) {
          setWaitingWorker(registration.waiting);
          setHasUpdate(true);
        }

        // Listen for new updating workers
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setWaitingWorker(newWorker);
                setHasUpdate(true);
              }
            });
          }
        });
      } catch (err) {
        // Silently catch registration failure if offline or preview
        console.debug('ServiceWorker registration note:', err);
      }
    };

    registerSW();

    // Reload page when the new service worker takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!refreshing) {
        refreshing = true;
        window.location.reload();
      }
    });
  }, []);

  const handleUpdate = () => {
    if (waitingWorker) {
      waitingWorker.postMessage({ type: 'SKIP_WAITING' });
    } else {
      window.location.reload();
    }
  };

  return (
    <Toast
      isVisible={hasUpdate}
      message="تحديث جديد متاح للتطبيق والبيانات"
      type="info"
      actionLabel="تحديث الآن"
      onAction={handleUpdate}
      onClose={() => setHasUpdate(false)}
    />
  );
};
