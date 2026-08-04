// src/components/ui/StatusBadge.tsx
import React from 'react';
import type{ RequestStatus } from '../../types/app';

interface StatusBadgeProps {
  status: RequestStatus;
  size?: 'sm' | 'md';
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Draft: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
  'Pending Approval': { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  Approved: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  'In Transit': { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500' },
  Processing: { bg: 'bg-purple-50', text: 'text-purple-700', dot: 'bg-purple-500' },
  Completed: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  Rejected: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
};

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const style = STATUS_STYLES[status] ?? STATUS_STYLES.Draft;
  const sizeClasses = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap ${style.bg} ${style.text} ${sizeClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
      {status}
    </span>
  );
};

export default StatusBadge;