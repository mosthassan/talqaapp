'use client';

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

export interface ToastProps {
  id?: string;
  isVisible: boolean;
  message: string;
  type?: 'success' | 'warning' | 'info';
  actionLabel?: string;
  onAction?: () => void;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  isVisible,
  message,
  type = 'info',
  actionLabel,
  onAction,
  onClose,
}) => {
  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-[#C6F24E] shrink-0" strokeWidth={1.75} />,
    warning: <AlertCircle className="w-4 h-4 text-[#F5A524] shrink-0" strokeWidth={1.75} />,
    info: <Info className="w-4 h-4 text-sky-400 shrink-0" strokeWidth={1.75} />,
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 15, scale: 0.96 }}
          transition={{ duration: 0.16 }}
          className="fixed bottom-20 left-4 right-4 z-50 max-w-[420px] mx-auto pointer-events-auto"
        >
          <div className="bg-[#0B1220] text-white p-3.5 rounded-full shadow-[0_12px_32px_-4px_rgba(11,18,32,0.18)] flex items-center justify-between gap-3 border border-[#1a2335]">
            <div className="flex items-center gap-2.5 min-w-0 pr-1">
              {icons[type]}
              <span className="text-xs font-medium leading-relaxed truncate text-white">
                {message}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {actionLabel && onAction && (
                <button
                  type="button"
                  onClick={onAction}
                  className="bg-[#C6F24E] hover:bg-[#b8e83b] text-[#0B1220] text-xs font-semibold px-3 py-1 rounded-full cursor-pointer tap-press"
                >
                  {actionLabel}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                aria-label="إغلاق التنبيه"
                className="text-[#5B6676] hover:text-white p-1 rounded-full cursor-pointer"
              >
                <X className="w-3.5 h-3.5" strokeWidth={1.75} />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
