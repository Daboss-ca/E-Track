// src/pages/faculty/RequestLedgerPage.tsx
import React, { useState } from 'react';
import { Search, Recycle, CheckCircle2, Circle, X } from 'lucide-react';
import Sidebar from '../../components/layouts/Sidebar';
import TopHeader from '../../components/layouts/TopBar';
import StatusBadge from '../../components/ui/StatusBadge';
import { useEWasteForm } from '../../hooks/useEWasteForm';
import type { EWasteRequest, UserRole } from '../../types/app';

interface RequestLedgerPageProps {
  currentNav?: string;
  onNavigate: (view: string) => void;
}

const RequestLedgerPage: React.FC<RequestLedgerPageProps> = ({ currentNav, onNavigate }) => {
  const activeNav = currentNav || 'requests-ledger';
  
  const [role, setRole] = useState<UserRole>('Faculty');
  const [headerSearch, setHeaderSearch] = useState('');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<EWasteRequest | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  const { ledger, departmentCode } = useEWasteForm();

  const filteredLedger = ledger.filter((req) => {
    const q = ledgerSearch.trim().toLowerCase();
    if (!q) return true;
    return (
      req.trackingCode.toLowerCase().includes(q) ||
      req.itemName.toLowerCase().includes(q) ||
      req.category.toLowerCase().includes(q) ||
      req.status.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <div className="h-full shrink-0">
        <Sidebar
          activeId={activeNav}
          onNavigate={onNavigate}
          userName="Miguel Santos"
          userRole={`${role} · ${departmentCode}`}
          onOpenSettings={() => setShowSettings(true)}
          onLogout={() => window.alert('Logged out')}
        />
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col bg-[#F3F4F6] overflow-hidden">
        <div className="shrink-0">
          <TopHeader
            searchValue={headerSearch}
            onSearchChange={setHeaderSearch}
            notifications={[]}
            onMarkAllRead={() => {}}
            currentRole={role}
            onRoleChange={setRole}
            userName="Miguel Santos"
          />
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-bold text-gray-900">E-Waste Request Ledger</h1>
              <p className="mt-0.5 text-[13px] text-gray-400">
                View submitted requests and track their current recycling lifecycle status.
              </p>
            </div>
          </div>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-gray-800">All Requests</h2>
              <div className="relative w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={ledgerSearch}
                  onChange={(e) => setLedgerSearch(e.target.value)}
                  placeholder="Search ledger..."
                  className="w-full rounded-full border border-gray-200 py-2 pl-8 pr-3 text-[12.5px] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[11.5px] uppercase tracking-wide text-gray-400">
                    <th className="py-2 font-medium">Tracking Code</th>
                    <th className="py-2 font-medium">Item</th>
                    <th className="py-2 font-medium">Category</th>
                    <th className="py-2 font-medium">Date</th>
                    <th className="py-2 font-medium">Status</th>
                    <th className="py-2 font-medium">Lifecycle</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLedger.map((req) => (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 font-medium text-gray-700">{req.trackingCode}</td>
                      <td className="py-3 text-gray-600">{req.itemName}</td>
                      <td className="py-3 text-gray-500">{req.category}</td>
                      <td className="py-3 text-gray-500">{req.dateSubmitted}</td>
                      <td className="py-3">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => setSelectedRequest(req)}
                          className="rounded-lg border border-gray-200 px-2.5 py-1 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          Track
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredLedger.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-[12.5px] text-gray-400">
                        No matching requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {selectedRequest && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-1 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-[16px] font-bold text-gray-900">
                <Recycle className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />
                Lifecycle Status
              </h3>
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="text-gray-300 hover:text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="mb-5 text-[12.5px] text-gray-400">{selectedRequest.trackingCode}</p>

            <div className="space-y-0">
              {selectedRequest.lifecycle.map((step, idx) => (
                <div key={step.stage} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    {step.isComplete ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" strokeWidth={2} />
                    ) : step.isCurrent ? (
                      <span className="flex h-5 w-5 items-center justify-center">
                        <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-amber-500" />
                      </span>
                    ) : (
                      <Circle className="h-5 w-5 text-gray-200" strokeWidth={2} />
                    )}
                    {idx < selectedRequest.lifecycle.length - 1 && (
                      <span
                        className={`my-0.5 h-8 w-px ${step.isComplete ? 'bg-emerald-300' : 'bg-gray-200'}`}
                      />
                    )}
                  </div>
                  <div className="pb-6">
                    <p
                      className={`text-[13px] font-medium ${
                        step.isComplete || step.isCurrent ? 'text-gray-800' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </p>
                    {step.completedAt && (
                      <p className="text-[11.5px] text-gray-400">
                        {step.completedAt} · {step.completedBy}
                      </p>
                    )}
                    {step.isCurrent && <p className="text-[11.5px] text-amber-600">In progress</p>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-900">Settings</h3>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-gray-300 hover:text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[13px] text-gray-500">
              Notification preferences, default department, and account details will appear here.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-gray-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestLedgerPage;