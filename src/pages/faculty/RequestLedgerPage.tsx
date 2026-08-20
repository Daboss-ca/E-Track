// src/pages/faculty/RequestLedgerPage.tsx
import React, { useState } from 'react';
import { Search, Recycle, CheckCircle2, Circle, X } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import { useEWasteForm } from '../../hooks/faculty/useEWasteForm';
import type { EWasteRequest } from '../../types/app';

interface RequestLedgerPageProps {
  currentNav?: string;
  onNavigate?: (view: string) => void;
}

const RequestLedgerPage: React.FC<RequestLedgerPageProps> = () => {
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<EWasteRequest | null>(null);

  const { ledger } = useEWasteForm();

  const flattenedLedger = ledger.flatMap((req) => {
    if (!req.equipmentItems || req.equipmentItems.length === 0) {
      return [
        {
          rowId: `${req.id}-empty`,
          request: req,
          itemDescription: 'No equipment items listed',
          itemQuantity: 0,
        },
      ];
    }
    return req.equipmentItems.map((item) => ({
      rowId: item.id,
      request: req,
      itemDescription: item.description,
      itemQuantity: item.quantity,
    }));
  });

  const filteredLedger = flattenedLedger.filter((row) => {
    const q = ledgerSearch.trim().toLowerCase();
    if (!q) return true;
    
    return (
      row.request.trackingCode.toLowerCase().includes(q) ||
      row.request.itemName.toLowerCase().includes(q) ||
      row.request.category.toLowerCase().includes(q) ||
      row.request.status.toLowerCase().includes(q) ||
      row.itemDescription.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            E-Waste Request Ledger
          </h1>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            View submitted requests and track their current recycling lifecycle status.
          </p>
        </div>
      </div>

      {/* Main Table Card */}
      <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 sm:p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
            All Equipment Items
          </h2>
          
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              value={ledgerSearch}
              onChange={(e) => setLedgerSearch(e.target.value)}
              placeholder="Search tracking, batch, or item..."
              className="w-full rounded-full border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/80 dark:text-white py-2 pl-9 pr-4 text-theme-sm focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        {/* Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-theme-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-theme-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="py-3 font-semibold">Tracking Code</th>
                <th className="py-3 font-semibold">Batch Name</th>
                <th className="py-3 font-semibold">Equipment Description</th>
                <th className="py-3 font-semibold">Qty</th>
                <th className="py-3 font-semibold">Date</th>
                <th className="py-3 font-semibold">Status</th>
                <th className="py-3 font-semibold">Lifecycle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {filteredLedger.map((row) => (
                <tr 
                  key={row.rowId} 
                  className="transition-colors hover:bg-gray-50/60 dark:hover:bg-white/[0.02]"
                >
                  <td className="py-3.5 font-medium text-gray-800 dark:text-gray-200">
                    {row.request.trackingCode}
                  </td>
                  <td className="py-3.5 font-medium text-gray-800 dark:text-gray-200">
                    {row.request.itemName}
                    <div className="text-[11px] font-normal text-gray-400 dark:text-gray-500 mt-0.5">
                      {row.request.category}
                    </div>
                  </td>
                  <td className="py-3.5 text-gray-600 dark:text-gray-300">
                    {row.itemDescription}
                  </td>
                  <td className="py-3.5 font-semibold text-gray-800 dark:text-gray-200">
                    {row.itemQuantity > 0 ? row.itemQuantity : '-'}
                  </td>
                  <td className="py-3.5 text-gray-500 dark:text-gray-400">
                    {row.request.dateSubmitted}
                  </td>
                  <td className="py-3.5">
                    <StatusBadge status={row.request.status} size="sm" />
                  </td>
                  <td className="py-3.5">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(row.request)}
                      className="inline-flex items-center rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 px-3 py-1.5 text-theme-xs font-medium text-gray-700 dark:text-gray-300 hover:border-emerald-500/50 hover:bg-emerald-50/50 hover:text-emerald-600 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-400 transition-all shadow-2xs"
                    >
                      Track Batch
                    </button>
                  </td>
                </tr>
              ))}
              {filteredLedger.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-theme-sm text-gray-400 dark:text-gray-500">
                    No matching equipment items found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lifecycle Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 shadow-2xl transition-all">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-bold text-gray-800 dark:text-white/90">
                <Recycle className="h-5 w-5 text-emerald-600 dark:text-emerald-500" strokeWidth={1.75} />
                Batch Lifecycle Status
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-6 text-theme-xs text-gray-400 dark:text-gray-500">
              Tracking Code: <span className="font-semibold text-gray-700 dark:text-gray-300">{selectedRequest.trackingCode}</span>
            </p>

            {/* Timeline Steps */}
            <div className="space-y-0 px-1">
              {selectedRequest.lifecycle.map((step, idx) => (
                <div key={step.stage} className="flex gap-3.5">
                  <div className="flex flex-col items-center">
                    {step.isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" strokeWidth={2} />
                    ) : step.isCurrent ? (
                      <span className="flex h-5 w-5 items-center justify-center">
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500 ring-4 ring-amber-500/20" />
                      </span>
                    ) : (
                      <Circle className="h-5 w-5 text-gray-200 dark:text-gray-700" strokeWidth={2} />
                    )}
                    {idx < selectedRequest.lifecycle.length - 1 && (
                      <span
                        className={`my-1 h-8 w-0.5 ${
                          step.isComplete ? 'bg-emerald-400 dark:bg-emerald-500/60' : 'bg-gray-200 dark:bg-gray-800'
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-5">
                    <p
                      className={`text-theme-sm font-medium ${
                        step.isComplete || step.isCurrent ? 'text-gray-800 dark:text-white/90' : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.completedAt && (
                      <p className="text-[11.5px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {step.completedAt} · {step.completedBy}
                      </p>
                    )}
                    {step.isCurrent && (
                      <p className="text-[11.5px] font-medium text-amber-600 dark:text-amber-500 mt-0.5">
                        In progress
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800 px-4 py-2 text-theme-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestLedgerPage;