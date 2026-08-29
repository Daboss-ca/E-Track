import { Hash, StickyNote, ArrowLeft, Calendar, Package } from 'lucide-react';
import Button from '../../components/ui/Button/button';
import Badge from '../../components/ui/Badge/badge';
import type { WorkOrder } from '../../types/segregator/segregator.types';

export interface WorkOrderReviewViewProps {
  workOrder: WorkOrder;
  onBack: () => void;
  onStartSession: () => void;
}

export function WorkOrderReviewView({ workOrder, onBack, onStartSession }: WorkOrderReviewViewProps) {
  const isPending = workOrder.status === 'Pending Review' || workOrder.status === 'Pending Quarantine Review';
  const statusLabel = isPending ? 'Pending' : 'In Progress';
  const statusColor = isPending ? 'warning' : 'info';

  return (
    <div className="space-y-6 animate-fadeIn transition-all duration-300 max-w-5xl mx-auto">
      {/* Header with Back Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="group flex items-center gap-2 text-xs font-semibold text-gray-600 hover:text-emerald-600 dark:text-gray-400 dark:hover:text-emerald-400 transition-colors"
        >
          <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-gray-200 bg-white shadow-sm group-hover:border-emerald-500 dark:border-gray-800 dark:bg-white/[0.03]">
            <ArrowLeft className="h-4 w-4" />
          </div>
          <span>Back to Work Queue</span>
        </button>
        <Badge color={statusColor} size="md">
          {statusLabel}
        </Badge>
      </div>

      {/* Main Title Banner */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-emerald-600 dark:text-emerald-400 mb-1">
              <Hash className="h-3.5 w-3.5" />
              <span>{workOrder.referenceCode}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{workOrder.deviceName}</h1>
          </div>
        </div>
      </div>

      {/* Clean Device Details Layout */}
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Package className="h-4 w-4 text-emerald-600" />
            Device Information & Specifications
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800">
              <span className="text-gray-400 block mb-1">Reference Code ID</span>
              <span className="font-mono font-semibold text-gray-800 dark:text-gray-200 text-sm">{workOrder.referenceCode}</span>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800">
              <span className="text-gray-400 block mb-1">Total Quantity</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm">{workOrder.quantity} Unit(s)</span>
            </div>
            <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800">
              <span className="text-gray-400 block mb-1">Date Logged</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200 text-sm flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-emerald-600" />
                {/* Fallback to current date formatting if property is missing */}
                {/* @ts-expect-error Property date does not exist on type WorkOrder yet */}
                {workOrder.date || '08/28/2026'}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-emerald-600" />
            Custodian Notes & Remarks
          </h3>
          <div className="rounded-xl bg-gray-50 p-4 border border-gray-100 dark:bg-gray-900/50 dark:border-gray-800 text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
            {workOrder.custodianNotes || 'No specific handover notes provided for this hardware component.'}
          </div>
        </div>

        {/* Proceed Button at the very bottom */}
        <div className="flex justify-end pt-2">
          <Button
            variant="primary"
            className="px-8 py-3 text-xs font-semibold"
            onClick={onStartSession}
          >
            Proceed to Workspace
          </Button>
        </div>
      </div>
    </div>
  );
}