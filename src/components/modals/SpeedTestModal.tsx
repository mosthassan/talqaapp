'use client';

import React from 'react';
import { Sheet } from '@/src/components/ui/Sheet';
import { SpeedTestView } from '@/src/components/speed/SpeedTestView';

interface SpeedTestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SpeedTestModal: React.FC<SpeedTestModalProps> = ({ isOpen, onClose }) => {
  return (
    <Sheet
      isOpen={isOpen}
      onClose={onClose}
      title="فحص سرعة الإنترنت الحقيقي"
      subtitle="قياس دقيق للتنزيل والرفع والبينج لشبكة طلقة نت"
    >
      <div className="py-1">
        <SpeedTestView />
      </div>
    </Sheet>
  );
};
