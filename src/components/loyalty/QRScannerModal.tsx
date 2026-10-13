'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '@/src/components/ui/Button';
import { soundManager } from '@/src/lib/audio/soundManager';
import { Camera, X, AlertCircle } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (code: string) => void;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanSuccess,
}) => {
  const [error, setError] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const scannerContainerId = 'talqa-qr-scanner-box';

  useEffect(() => {
    if (!isOpen) return;

    let mounted = true;

    const startScanner = async () => {
      setError(null);
      setScanning(true);
      try {
        const qr = new Html5Qrcode(scannerContainerId);
        html5QrCodeRef.current = qr;

        await qr.start(
          { facingMode: 'environment' },
          {
            fps: 10,
            qrbox: { width: 240, height: 240 },
          },
          (decodedText) => {
            if (!mounted) return;
            soundManager.playSuccess();
            // Stop scanner and pass code
            qr.stop()
              .then(() => {
                onScanSuccess(decodedText.trim());
                onClose();
              })
              .catch(() => {
                onScanSuccess(decodedText.trim());
                onClose();
              });
          },
          () => {
            // Frame parse error (ignored during normal scanning)
          }
        );
      } catch (err) {
        if (!mounted) return;
        setScanning(false);
        setError(
          'تعذر فتح الكاميرا. يُرجى التأكد من منح الإذن لاستخدام الكاميرا أو إدخال الكرت يدوياً.'
        );
      }
    };

    // Small delay to ensure DOM element is mounted
    const timer = setTimeout(() => {
      void startScanner();
    }, 200);

    return () => {
      mounted = false;
      clearTimeout(timer);
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current
          .stop()
          .catch(() => {})
          .finally(() => {
            html5QrCodeRef.current = null;
          });
      }
    };
  }, [isOpen, onClose, onScanSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm overflow-hidden bg-surface rounded-2xl border border-line shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-line">
          <div className="flex items-center gap-2">
            <Camera className="w-5 h-5 text-gold" />
            <h3 className="font-bold text-ink text-base">مسح رمز كرت طلقة (QR)</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-ink-2 hover:bg-black/5 transition"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Camera Viewport */}
        <div className="p-4 flex flex-col items-center">
          <div
            id={scannerContainerId}
            className="w-full aspect-square rounded-xl overflow-hidden bg-black relative flex items-center justify-center border-2 border-dashed border-gold/40"
          >
            {scanning && !error && (
              <div className="absolute inset-x-8 top-1/2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse shadow-sm" />
            )}
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <p className="mt-3 text-xs text-ink-2 text-center">
            وجّه الكاميرا نحو رمز الاستجابة السريعة الموجود على ظهر كرت شبكة طلقة نت
          </p>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-line flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            إلغاء والعودة للإدخال اليدوي
          </Button>
        </div>
      </div>
    </div>
  );
};
