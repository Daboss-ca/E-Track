import React, { useState } from 'react';
import { Search, Recycle, CheckCircle2, Circle, X } from 'lucide-react';
import StatusBadge from '../../components/ui/StatusBadge';
import { useEWasteForm } from '../../hooks/faculty/useEWasteForm';
import { Modal } from '../../components/ui/Modal/index';
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
    <div className="space-y-6 p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            E-Waste Request Ledger
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            View submitted requests and track their current recycling lifecycle status.
          </p>
        </div>
      </div>

      {/* Main Container Card */}
      <section className="rounded-2xl border border-gray-100 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-4 sm:p-6 shadow-xs transition-all">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white">
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
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-white/[0.02] dark:text-white py-2 pl-9 pr-4 text-xs sm:text-sm focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            />
          </div>
        </div>

        {/* Mobile View: Cards Layout */}
        <div className="grid grid-cols-1 gap-3 sm:hidden">
          {filteredLedger.map((row) => (
            <div 
              key={row.rowId}
              className="rounded-xl border border-gray-100 bg-gray-50/40 p-3.5 dark:border-gray-800/80 dark:bg-white/[0.02] space-y-2.5"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {row.request.trackingCode}
                </span>
                <StatusBadge status={row.request.status} size="sm" />
              </div>

              <div>
                <p className="font-medium text-sm text-gray-800 dark:text-white">
                  {row.request.itemName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {row.itemDescription}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-200/50 dark:border-gray-800 text-xs">
                <span className="text-gray-400">
                  Qty: <strong className="text-gray-700 dark:text-gray-200">{row.itemQuantity > 0 ? row.itemQuantity : '-'}</strong> · {row.request.dateSubmitted}
                </span>

                <button
                  type="button"
                  onClick={() => setSelectedRequest(row.request)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-700 transition-all active:scale-95 shadow-xs"
                >
                  <Recycle className="h-3.5 w-3.5" />
                  Track
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop / Tablet View: Standard Table */}
        <div className="hidden sm:block overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800/80">
          <table className="w-full border-collapse text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-white/[0.02] font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3.5 whitespace-nowrap">Tracking Code</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Batch Name</th>
                <th className="px-4 py-3.5 min-w-[180px]">Equipment Description</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Qty</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Date</th>
                <th className="px-4 py-3.5 whitespace-nowrap">Status</th>
                <th className="px-4 py-3.5 text-right whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 bg-white dark:bg-transparent">
              {filteredLedger.map((row) => (
                <tr 
                  key={row.rowId} 
                  className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                    {row.request.trackingCode}
                  </td>
                  <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-gray-200 whitespace-nowrap">
                    {row.request.itemName}
                    <div className="text-[11px] font-normal text-gray-400 dark:text-gray-500 mt-0.5">
                      {row.request.category}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300">
                    {row.itemDescription}
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-gray-800 dark:text-gray-200 whitespace-nowrap">
                    {row.itemQuantity > 0 ? row.itemQuantity : '-'}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {row.request.dateSubmitted}
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <StatusBadge status={row.request.status} size="sm" />
                  </td>
                  <td className="px-4 py-3.5 text-right whitespace-nowrap">
                    <button
                      type="button"
                      onClick={() => setSelectedRequest(row.request)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/20 bg-emerald-50/60 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-600 hover:text-white dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-400 dark:hover:bg-emerald-500 dark:hover:text-white transition-all shadow-2xs active:scale-95 cursor-pointer"
                    >
                      <Recycle className="h-3.5 w-3.5" />
                      Track Batch
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredLedger.length === 0 && (
          <div className="py-8 text-center text-xs sm:text-sm text-gray-400 dark:text-gray-500">
            No matching equipment items found.
          </div>
        )}
      </section>

      {/* Lifecycle Modal (Refactored to use generic Modal) */}
      <Modal
        isOpen={!!selectedRequest}
        onClose={() => setSelectedRequest(null)}
        showCloseButton={false}
        className="max-w-md p-5 sm:p-6 border border-gray-100 dark:border-gray-800 shadow-2xl !rounded-2xl transition-all"
      >
        {selectedRequest && (
          <>
            <div className="mb-1 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-bold text-gray-800 dark:text-white">
                <Recycle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
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
            <p className="mb-5 text-xs text-gray-400 dark:text-gray-500">
              Tracking Code: <span className="font-mono font-semibold text-gray-700 dark:text-gray-300">{selectedRequest.trackingCode}</span>
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
                        className={`my-1 h-7 w-0.5 ${
                          step.isComplete ? 'bg-emerald-500/70' : 'bg-gray-200 dark:bg-gray-800'
                        }`}
                      />
                    )}
                  </div>
                  <div className="pb-4">
                    <p
                      className={`text-xs sm:text-sm font-medium ${
                        step.isComplete || step.isCurrent ? 'text-gray-800 dark:text-white' : 'text-gray-400 dark:text-gray-500'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.completedAt && (
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">
                        {step.completedAt} · {step.completedBy}
                      </p>
                    )}
                    {step.isCurrent && (
                      <p className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-0.5">
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
                className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-800 px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  );
};

export default RequestLedgerPage;