// src/pages/custodian/ReturnSlipGenerator.tsx
import React, { useState } from 'react';
import { Send, FileCheck, Tag, Hash, AlertCircle, Loader2 } from 'lucide-react';
import Sidebar from '../../components/layouts/Sidebar';


import TopHeader from '../../components/layouts/TopBar';
import { useReturnSlip } from '../../hooks/custodian/useReturnSlip';

interface ReturnSlipGeneratorProps {
  requestId?: string;
  currentNav?: string;
  onNavigate?: (view: string) => void;
  onSuccess?: () => void;
}

export const ReturnSlipGenerator: React.FC<ReturnSlipGeneratorProps> = ({
  requestId,
  currentNav,
  onNavigate,
  onSuccess,
}) => {
  const activeNav = currentNav || 'return-slip';
  const [headerSearch, setHeaderSearch] = useState('');

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
    <div className="flex h-screen w-full overflow-hidden bg-white font-sans antialiased">
      {/* Sidebar Integration */}
      <div className="h-full shrink-0">
        <Sidebar
          activeId={activeNav}
          onNavigate={onNavigate || (() => {})}
          onOpenSettings={() => {}}
        />
      </div>

      {/* Main Content Container */}
      <div className="flex h-full min-w-0 flex-1 flex-col bg-[#F3F4F6] overflow-hidden">
        <div className="shrink-0">
          <TopHeader
            searchValue={headerSearch}
            onSearchChange={setHeaderSearch}
            notifications={[]}
            onMarkAllRead={() => {}}
          />
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Header Row */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[22px] font-bold text-gray-900">Return Slip Generation</h1>
              <p className="mt-0.5 text-[13px] text-gray-400">
                Generate digital return slips and assign property tags for supply office transfer.
              </p>
            </div>
          </div>

          {/* Conditional Content rendering */}
          {loading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin text-emerald-600" />
                <p className="text-xs text-gray-500">Auto-populating Return Slip details...</p>
              </div>
            </div>
          ) : !requestData ? (
            <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
              <p className="text-xs text-gray-500">
                No approved request selected to generate Return Slip. Please select a request from the Validation Hub.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header Document Card */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <FileCheck className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-[15px] font-semibold text-gray-900">Digital Return Slip</h2>
                      <p className="text-[12px] text-gray-400">Control No: {requestData.controlNumber}</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-[11.5px] font-semibold text-emerald-700">
                    Auto-Generated
                  </span>
                </div>

                {/* Auto-populated Summary Details */}
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3 text-[12.5px]">
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <span className="block text-[11px] font-medium uppercase tracking-wider text-gray-400">
                      Department / Unit
                    </span>
                    <span className="font-semibold text-gray-800">{requestData.department}</span>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <span className="block text-[11px] font-medium uppercase tracking-wider text-gray-400">
                      End-User / Requested By
                    </span>
                    <span className="font-semibold text-gray-800">{requestData.requestedBy}</span>
                  </div>
                  <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                    <span className="block text-[11px] font-medium uppercase tracking-wider text-gray-400">
                      Approval Date
                    </span>
                    <span className="font-semibold text-gray-800">{requestData.dateApproved}</span>
                  </div>
                </div>
              </div>

              {/* Property Tagging Section */}
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="mb-4">
                  <h3 className="text-[14px] font-semibold text-gray-800">Property Tagging &amp; Verification</h3>
                  <p className="text-[12px] text-gray-400">
                    Assign Property Tags and Serial Numbers before handing over to Supply Office.
                  </p>
                </div>

                {error && (
                  <div className="mb-4 flex items-center gap-2 rounded-xl bg-rose-50 p-3 text-[12px] text-rose-600 border border-rose-100">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  {requestData.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 rounded-xl border border-gray-100 bg-gray-50/60 p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="sm:w-1/3">
                        <p className="text-[13px] font-semibold text-gray-800">{item.itemName}</p>
                        <p className="text-[11.5px] text-gray-400">
                          Category: {item.category} | Qty: {item.quantity}
                        </p>
                      </div>

                      <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                        {/* Property Tag Field */}
                        <div>
                          <label className="mb-1 flex items-center gap-1 text-[11.5px] font-medium text-gray-600">
                            <Tag className="h-3.5 w-3.5 text-gray-400" /> Property Tag <span className="text-rose-500">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., PROP-2026-001"
                            value={item.propertyTag}
                            onChange={(e) => handleItemTagChange(item.id, 'propertyTag', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12.5px] text-gray-800 focus:border-gray-900 focus:outline-none"
                          />
                        </div>

                        {/* Serial Number Field */}
                        <div>
                          <label className="mb-1 flex items-center gap-1 text-[11.5px] font-medium text-gray-600">
                            <Hash className="h-3.5 w-3.5 text-gray-400" /> Serial Number (Optional)
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., SN-998123"
                            value={item.serialNumber}
                            onChange={(e) => handleItemTagChange(item.id, 'serialNumber', e.target.value)}
                            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12.5px] text-gray-800 focus:border-gray-900 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Footer: Send to Admin */}
              <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                <p className="text-[12px] text-gray-400">
                  {!isFormValid ? '⚠️ Fill out all required Property Tags to proceed.' : 'Ready for transfer.'}
                </p>
                <button
                  type="button"
                  disabled={!isFormValid || submitting}
                  onClick={() => sendToAdmin(onSuccess)}
                  className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-[12.5px] font-medium text-white transition-all shadow-sm ${
                    isFormValid && !submitting
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'cursor-not-allowed bg-gray-300'
                  }`}
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Transferring...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" /> Send to Admin (Supply Office)
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ReturnSlipGenerator;