import { ArrowLeft } from 'lucide-react';
import Button from '../../components/ui/Button/button';
import type {
  DismantlingSessionLog,
  SegregationMode,
  WorkOrder,
} from '../../types/segregator/segregator.types';
import { useDismantlingWorkspace, type ItemCardOption } from '../../hooks/segregator/useDismantlingWorkspace';

export interface DismantlingWorkspaceProps {
  workOrder: WorkOrder;
  mode: SegregationMode;
  onExit: (log: DismantlingSessionLog) => void;
  onSelectItem: (itemId: string, itemName: string) => void; 
}

function renderPacketTracerIcon(type: ItemCardOption['illustrationType']) {
  switch (type) {
    case 'cpu':
      return (
        <svg className="h-full w-full drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="12" y="16" width="40" height="36" rx="4" fill="#3B82F6" stroke="#1E3A8A" strokeWidth="2" />
          <rect x="18" y="22" width="28" height="20" rx="2" fill="#93C5FD" stroke="#2563EB" strokeWidth="1.5" />
          <path d="M22 28h12M22 34h8" stroke="#1E3A8A" strokeWidth="2" strokeLinecap="round" />
          <path d="M12 24h-4M12 32h-4M12 40h-4M52 24h4M52 32h4M52 40h4" stroke="#D1D5DB" strokeWidth="2" />
        </svg>
      );
    case 'laptop':
      return (
        <svg className="h-full w-full drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="14" width="44" height="28" rx="3" fill="#64748B" stroke="#334155" strokeWidth="2" />
          <rect x="14" y="18" width="36" height="20" rx="1" fill="#E2E8F0" />
          <path d="M6 46h52c1 0 2 1 2 2s0 2-2 2H6c-2 0-2-2-2-2s1-2 2-2z" fill="#94A3B8" stroke="#334155" strokeWidth="1.5" />
        </svg>
      );
    case 'printer':
      return (
        <svg className="h-full w-full drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="24" width="36" height="24" rx="3" fill="#E2E8F0" stroke="#64748B" strokeWidth="2" />
          <rect x="18" y="14" width="28" height="12" fill="#F1F5F9" stroke="#64748B" strokeWidth="1.5" />
          <rect x="20" y="36" width="24" height="10" rx="2" fill="#334155" />
          <circle cx="44" cy="30" r="2" fill="#10B981" />
        </svg>
      );
    case 'scanner':
      return (
        <svg className="h-full w-full drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="22" width="44" height="24" rx="4" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
          <rect x="16" y="16" width="32" height="8" rx="2" fill="#F8FAFC" stroke="#475569" strokeWidth="1.5" />
          <path d="M20 34h24" stroke="#3B82F6" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'server':
      return (
        <svg className="h-full w-full drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="14" y="10" width="36" height="44" rx="3" fill="#334155" stroke="#0F172A" strokeWidth="2" />
          <rect x="18" y="14" width="28" height="10" rx="1" fill="#475569" />
          <rect x="18" y="27" width="28" height="10" rx="1" fill="#475569" />
          <rect x="18" y="40" width="28" height="10" rx="1" fill="#475569" />
          <circle cx="22" cy="19" r="1.5" fill="#10B981" />
          <circle cx="22" cy="32" r="1.5" fill="#10B981" />
          <circle cx="22" cy="45" r="1.5" fill="#EF4444" />
        </svg>
      );
    case 'smartboard':
      return (
        <svg className="h-full w-full drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="8" y="12" width="48" height="34" rx="3" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          <rect x="12" y="16" width="40" height="26" fill="#38BDF8" />
          <path d="M26 50h12M32 46v4" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'keyboard':
      return (
        <svg className="h-full w-full drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="20" width="44" height="24" rx="3" fill="#E2E8F0" stroke="#475569" strokeWidth="2" />
          <rect x="14" y="24" width="36" height="16" rx="1" fill="#CBD5E1" />
          <path d="M18 28h6M28 28h6M38 28h6M18 34h28" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'monitor':
      return (
        <svg className="h-full w-full drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="14" width="44" height="30" rx="3" fill="#334155" stroke="#0F172A" strokeWidth="2" />
          <rect x="14" y="18" width="36" height="22" fill="#0EA5E9" />
          <path d="M26 44h12v4H26z" fill="#64748B" />
          <path d="M20 52h24" stroke="#64748B" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'ups':
      return (
        <svg className="h-full w-full drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="18" y="12" width="28" height="40" rx="4" fill="#475569" stroke="#1E293B" strokeWidth="2" />
          <rect x="24" y="18" width="16" height="8" rx="2" fill="#FBBF24" />
          <circle cx="32" cy="42" r="4" fill="#EF4444" />
        </svg>
      );
    case 'router':
      return (
        <svg className="h-full w-full drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="10" y="26" width="44" height="20" rx="4" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
          <circle cx="18" cy="36" r="2" fill="#22C55E" />
          <circle cx="26" cy="36" r="2" fill="#3B82F6" />
          <path d="M16 26V18M48 26V18" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'cable':
    default:
      return (
        <svg className="h-full w-full drop-shadow-md" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 20c12 0 12 24 24 24s12-16 12-16" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" />
          <rect x="10" y="16" width="6" height="8" rx="1" fill="#1E293B" />
          <rect x="44" y="24" width="6" height="8" rx="1" fill="#1E293B" />
        </svg>
      );
  }
}

export function DismantlingWorkspace({ workOrder, onExit, onSelectItem }: DismantlingWorkspaceProps) {
  const { activeTab, setActiveTab, currentItems, handleBackToReview } = useDismantlingWorkspace({ workOrder, onExit });

  return (
    <div className="relative space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          startIcon={<ArrowLeft className="h-4 w-4" />}
          onClick={handleBackToReview}
        >
          Back to Review Page
        </Button>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex rounded-xl bg-gray-100 p-1.5 dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('high')}
            className={[
              'flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all',
              activeTab === 'high'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white dark:border dark:border-gray-600'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
            ].join(' ')}
          >
            High Items Selection
          </button>
          <button
            onClick={() => setActiveTab('low')}
            className={[
              'flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-semibold transition-all',
              activeTab === 'low'
                ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white dark:border dark:border-gray-600'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white',
            ].join(' ')}
          >
            Low Items Selection
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {currentItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSelectItem(item.id, item.name)}
            className="relative flex flex-col items-center justify-between rounded-xl p-4 text-center transition-all hover:shadow-xl aspect-square overflow-hidden border-2 border-sky-200 bg-gradient-to-b from-sky-50/60 to-sky-100/40 hover:border-sky-400 dark:border-sky-900/50 dark:from-sky-950/20 dark:to-sky-900/30 cursor-pointer group"
          >
            <div className="flex w-full flex-1 items-center justify-center p-2 group-hover:scale-105 transition-transform">
              <div className="flex h-28 w-28 items-center justify-center">
                {renderPacketTracerIcon(item.illustrationType)}
              </div>
            </div>
            <div className="w-full pt-1 border-t border-sky-100 dark:border-sky-900/40">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 line-clamp-1 tracking-tight">
                {item.name}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}