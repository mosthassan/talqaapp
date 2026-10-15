'use client';

import React from 'react';
import { useOnlineStatus } from '@/src/hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

const emptySubscribe = () => () => {};

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const isClient = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  if (!isClient || isOnline) return null;

  return (
    <div
      role="status"
      className="w-full bg-[#FFFBEB] border-b border-[#FDE68A] text-[#7A4B00] px-4 py-2 text-xs font-medium flex items-center justify-between"
    >
      <div className="flex items-center gap-2">
        <WifiOff className="w-3.5 h-3.5 text-[#B45309] shrink-0" strokeWidth={1.75} />
        <span>تصفح أوفلاين — خدمات البث المباشر والاستراحة تعمل مجاناً عند الاتصال بواي فاي طلقة نت</span>
      </div>
      <span className="w-1.5 h-1.5 rounded-full bg-[#B45309] shrink-0" />
    </div>
  );
};
