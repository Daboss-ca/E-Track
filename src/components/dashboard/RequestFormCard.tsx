import React from 'react';
import { Tag } from 'lucide-react';
import type { ReturnSlipType, ReturnReasonOption } from '../../hooks/faculty/useSubmitRequest';
import Badge from '../ui/Badge/badge';

const RETURN_REASONS: ReturnReasonOption[] = [
  'Unserviceable',
  'No longer needed',
  'Reassignment',
  'Other',
];

interface Props {
  slipType: ReturnSlipType;
  returnReason: ReturnReasonOption;
  department: string;
  custodianName: string;
  date: string;
  trackingCodePreview: string;
  onSlipTypeChange: (val: ReturnSlipType) => void;
  onReturnReasonChange: (val: ReturnReasonOption) => void;
  onDepartmentChange: (val: string) => void;
  onCustodianNameChange: (val: string) => void;
  onDateChange: (val: string) => void;
}

export const RequestFormCard: React.FC<Props> = ({
  slipType,
  returnReason,
  department,
  custodianName,
  date,
  trackingCodePreview,
  onSlipTypeChange,
  onReturnReasonChange,
  onDepartmentChange,
  onCustodianNameChange,
  onDateChange,
}) => {
  const isPrs = slipType === 'PRS';

  return (
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 transition-all">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
          Return Slip Details
        </h2>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {isPrs
            ? 'Property Return Slip (High-Value / Individual Unit)'
            : 'Receipt of Returned Semi-Expendable Property (Batch / ICS)'}
        </span>
      </div>

      <div
        className={`grid grid-cols-1 gap-4 sm:grid-cols-2 ${
          isPrs ? 'lg:grid-cols-5' : 'lg:grid-cols-4'
        }`}
      >
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Return Slip Type
          </label>
          <select
            value={slipType}
            onChange={(e) => onSlipTypeChange(e.target.value as ReturnSlipType)}
            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white transition-all cursor-pointer"
          >
            <option value="PRS" className="bg-white text-gray-800 dark:bg-gray-900 dark:text-white">
              PRS (Property Return Slip)
            </option>
            <option value="RRSP" className="bg-white text-gray-800 dark:bg-gray-900 dark:text-white">
              RRSP (Semi-Expendable Return)
            </option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Department / College
          </label>
          <input
            type="text"
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            placeholder="e.g. College of Computer Studies"
            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-800 dark:text-white dark:placeholder:text-gray-500 transition-all"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Custodian / Property Officer
          </label>
          <input
            type="text"
            value={custodianName}
            onChange={(e) => onCustodianNameChange(e.target.value)}
            placeholder="Custodian name"
            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-800 dark:text-white dark:placeholder:text-gray-500 transition-all"
          />
        </div>

        {isPrs && (
          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Return Reason (Slip)
            </label>
            <select
              value={returnReason}
              onChange={(e) => onReturnReasonChange(e.target.value as ReturnReasonOption)}
              className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white transition-all cursor-pointer"
            >
              {RETURN_REASONS.map((reason) => (
                <option key={reason} value={reason} className="bg-white text-gray-800 dark:bg-gray-900 dark:text-white">
                  {reason}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-800 dark:text-white [color-scheme:light] dark:[color-scheme:dark] transition-all"
          />
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800/60 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Tracking Code Preview:
          </span>
        </div>
        <Badge color="success" variant="light" size="sm">
          {trackingCodePreview}
        </Badge>
      </div>
    </section>
  );
};