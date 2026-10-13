import React from 'react';
import { Badge } from './Badge';
import { Button } from './Button';
import { AlertCircle } from 'lucide-react';

export interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  phaseBadge?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  networkNotice?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  phaseBadge,
  actionLabel,
  onAction,
  className = '',
  networkNotice,
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-8 bg-white border border-[#E3E8EE] rounded-[24px] ${className}`}
    >
      <div className="w-14 h-14 rounded-full bg-[#F4F6F8] text-[#0B1220] flex items-center justify-center mb-3.5 border border-[#E3E8EE]">
        {icon}
      </div>

      {phaseBadge && (
        <Badge variant="signal-soft" size="sm" className="mb-2">
          {phaseBadge}
        </Badge>
      )}

      <h3 className="text-base font-bold text-[#0B1220] mb-1.5 font-heading">
        {title}
      </h3>
      <p className="text-xs text-[#5B6676] max-w-sm leading-relaxed mb-4">
        {description}
      </p>

      {networkNotice && (
        <div className="w-full bg-[#FFFBEB] border border-[#FDE68A] rounded-[14px] p-3 mb-4 text-xs text-[#7A4B00] leading-relaxed text-right flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-[#B45309] shrink-0 mt-0.5" strokeWidth={1.75} />
          <span>{networkNotice}</span>
        </div>
      )}

      {actionLabel && onAction && (
        <Button variant="secondary" size="md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
