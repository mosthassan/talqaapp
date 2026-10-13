'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { IconButton } from './IconButton';

export interface SheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  children: React.ReactNode;
  maxHeight?: string;
}

export const Sheet: React.FC<SheetProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxHeight = 'max-h-[88vh]',
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0B1220]/45 backdrop-blur-xs"
          />

          {/* Sheet Surface */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 350 }}
            className={`relative z-10 w-full max-w-[460px] mx-auto bg-white rounded-t-[32px] border-t border-[#E3E8EE] shadow-[0_-16px_40px_-4px_rgba(11,18,32,0.12)] flex flex-col overflow-hidden ${maxHeight}`}
          >
            {/* Physical Grab Handle */}
            <div className="pt-3 pb-1 flex justify-center cursor-grab active:cursor-grabbing">
              <div className="w-10 h-1 bg-[#CBD5E1] rounded-full" />
            </div>

            {/* Header */}
            {(title || subtitle) && (
              <div className="px-5 pt-2 pb-3.5 flex items-center justify-between border-b border-[#E3E8EE]">
                <div>
                  {title && (
                    <h3 className="text-base font-bold text-[#0B1220] font-heading">
                      {title}
                    </h3>
                  )}
                  {subtitle && (
                    <p className="text-xs text-[#5B6676] mt-0.5 font-normal">
                      {subtitle}
                    </p>
                  )}
                </div>
                <IconButton
                  icon={<X className="w-4 h-4 text-[#5B6676]" strokeWidth={1.75} />}
                  label="إغلاق"
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                />
              </div>
            )}

            {/* Content Body */}
            <div className="p-5 overflow-y-auto overscroll-contain flex-1">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
