// src/components/ui/StatusBadge.tsx
import React from 'react';

export type StatusType = 
  | 'Pending' 
  | 'Approved' 
  | 'In Progress' 
  | 'Completed' 
  | 'Rejected' 
  | string;

interface StatusBadgeProps {
  status: StatusType;
  size?: 'sm' | 'md';
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalizedStatus = status.toLowerCase();

  let colorStyles = 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700';
  let dotStyle = 'bg-gray-400';

  if (normalizedStatus.includes('pending')) {
    colorStyles = 'bg-amber-500/10 text-amber-700 border-amber-500/20 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-500/30';
    dotStyle = 'bg-amber-500 animate-pulse';
  } else if (normalizedStatus.includes('approved') || normalizedStatus.includes('completed')) {
    colorStyles = 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-500/30';
    dotStyle = 'bg-emerald-500';
  } else if (normalizedStatus.includes('progress')) {
    colorStyles = 'bg-blue-500/10 text-blue-700 border-blue-500/20 dark:bg-blue-500/15 dark:text-blue-400 dark:border-blue-500/30';
    dotStyle = 'bg-blue-500 animate-pulse';
  } else if (normalizedStatus.includes('reject')) {
    colorStyles = 'bg-rose-500/10 text-rose-700 border-rose-500/20 dark:bg-rose-500/15 dark:text-rose-400 dark:border-rose-500/30';
    dotStyle = 'bg-rose-500';
  }

  const sizeStyles = size === 'sm' ? 'px-2.5 py-0.5 text-[11px]' : 'px-3 py-1 text-xs';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border font-semibold ${colorStyles} ${sizeStyles} transition-all shadow-2xs`}>
      <span className={`h-1.5 w-1.5 rounded-full ${dotStyle}`} />
      {status}
    </span>
  );
};

export default StatusBadge;