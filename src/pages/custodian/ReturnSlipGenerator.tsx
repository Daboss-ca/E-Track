// src/pages/custodian/ReturnSlipGenerator.tsx
import React from 'react';
import { Send, FileCheck, Tag, Hash, AlertCircle, Loader2 } from 'lucide-react';
import Button from '../../components/ui/Button/button';
import Badge from '../../components/ui/Badge/badge';
import { useReturnSlip } from '../../hooks/custodian/useReturnSlip';

interface ReturnSlipGeneratorProps {
  requestId?: string;
  currentNav?: string;
  onNavigate?: (view: string) => void;
  onSuccess?: () => void;
}

export const ReturnSlipGenerator: React.FC<ReturnSlipGeneratorProps> = ({
  requestId,
  onSuccess,
}) => {
  const {
    loading,
    submitting,
    requestData,
    error,
    isFormValid,
    handleItemTagChange,
    sendToAdmin,
  } = useReturnSlip(requestId);

  return (
    <div className="space-y-6 font-sans antialiased">
      {/* Header Row */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Return Slip Generation
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Generate digital return slips and assign property tags for supply office transfer.
          </p>
        </div>
      </div>

      {/* Conditional Content Rendering */}
      {loading ? (
        <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 shadow-xs">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin text-emerald-600 dark:text-emerald-400" />
            <p className="text-xs text-gray-500 dark:text-gray-400">Auto-populating Return Slip details...</p>
          </div>
        </div>
      ) : !requestData ? (
        <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-8 text-center shadow-xs">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            No approved request selected to generate Return Slip. Please select a request from the Validation Hub.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Header Document Card */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <FileCheck className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-900 dark:text-white">Digital Return Slip</h2>
                  <p className="text-xs text-gray-400">
                    Control No: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{requestData.controlNumber}</span>
                  </p>
                </div>
              </div>
              <Badge variant="light" color="success" size="sm">
                Auto-Generated
              </Badge>
            </div>

            {/* Summary Details */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-sm">
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 p-3.5">
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Department / Unit
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block">{requestData.department}</span>
              </div>
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 p-3.5">
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  End-User / Requested By
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block">{requestData.requestedBy}</span>
              </div>
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/40 p-3.5">
                <span className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Approval Date
                </span>
                <span className="font-semibold text-gray-800 dark:text-gray-200 mt-0.5 block">{requestData.dateApproved}</span>
              </div>
            </div>
          </div>

          {/* Property Tagging Section */}
          <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white">Property Tagging &amp; Verification</h3>
              <p className="text-xs text-gray-400">
                Assign Property Tags and Serial Numbers before handing over to Supply Office.
              </p>
            </div>

            {error && (
              <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-500/10 p-3 text-xs font-semibold text-rose-600 dark:text-rose-400 border border-rose-200/20">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-3">
              {requestData.items.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col gap-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="sm:w-1/3">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white">{item.itemName}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Category: {item.category} | Qty: {item.quantity}
                    </p>
                  </div>

                  <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                    {/* Property Tag Field */}
                    <div>
                      <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                        <Tag className="h-3.5 w-3.5 text-emerald-600" /> Property Tag <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., PROP-2026-001"
                        value={item.propertyTag}
                        onChange={(e) => handleItemTagChange(item.id, 'propertyTag', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2 text-xs text-gray-800 dark:text-gray-200 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>

                    {/* Serial Number Field */}
                    <div>
                      <label className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300">
                        <Hash className="h-3.5 w-3.5 text-gray-400" /> Serial Number (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., SN-998123"
                        value={item.serialNumber}
                        onChange={(e) => handleItemTagChange(item.id, 'serialNumber', e.target.value)}
                        className="w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3.5 py-2 text-xs text-gray-800 dark:text-gray-200 focus:border-emerald-500 focus:outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action Footer: Send to Admin */}
          <div className="flex items-center justify-between rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-xs">
            <p className="text-xs text-gray-400">
              {!isFormValid ? '⚠️ Fill out all required Property Tags to proceed.' : 'Ready for transfer.'}
            </p>
            <Button
              variant="primary"
              size="md"
              disabled={!isFormValid || submitting}
              onClick={() => sendToAdmin(onSuccess)}
              startIcon={submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            >
              {submitting ? 'Transferring...' : 'Send to Admin (Supply Office)'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnSlipGenerator;