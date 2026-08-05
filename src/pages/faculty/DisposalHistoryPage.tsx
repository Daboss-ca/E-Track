// src/pages/DisposalHistoryPage.tsx
import React, { useState } from 'react';
import { Archive, Search, Download, CheckCircle2 } from 'lucide-react';
import Sidebar from '../../components/layouts/Sidebar';
import TopHeader from '../../components/layouts/TopBar';
import { useLifecycleTracking } from '../../hooks/faculty/useLifecycleTracking';
import type { UserRole } from '../../types/app';

interface DisposalHistoryPageProps {
  onNavigate: (view: string) => void;
}

const DisposalHistoryPage: React.FC<DisposalHistoryPageProps> = ({ onNavigate }) => {
  const [role, setRole] = useState<UserRole>('Faculty');
  const [headerSearch, setHeaderSearch] = useState('');
  const { disposals, searchQuery, setSearchQuery } = useLifecycleTracking();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-sans antialiased">
      <div className="h-full shrink-0">
        <Sidebar
          activeId="tracking-history"
          onNavigate={onNavigate}
          userName="Miguel Santos"
          userRole={`${role} · CCS`}
          onOpenSettings={() => {}}
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
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[22px] font-bold text-gray-900 flex items-center gap-2">
                <Archive className="h-6 w-6 text-emerald-600" strokeWidth={2} />
                Disposal History
              </h1>
              <p className="mt-0.5 text-[13px] text-gray-500">
                Completed e-waste records, certificates of safe disposal, and recycled item logs.
              </p>
            </div>

            <div className="relative w-full sm:w-72 mt-2 sm:mt-0">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search certificate, tracking code..."
                className="w-full rounded-full border border-gray-200 bg-white py-2 pl-8 pr-3 text-[12.5px] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 shadow-sm"
              />
            </div>
          </div>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[11.5px] uppercase tracking-wide text-gray-400">
                    <th className="py-2.5 font-medium">Tracking Code</th>
                    <th className="py-2.5 font-medium">Item Name</th>
                    <th className="py-2.5 font-medium">Disposal Method</th>
                    <th className="py-2.5 font-medium">Completed Date</th>
                    <th className="py-2.5 font-medium">Certificate No.</th>
                    <th className="py-2.5 font-medium">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {disposals.map((item) => (
                    <tr key={item.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 font-semibold text-gray-800">{item.trackingCode}</td>
                      <td className="py-3">
                        <p className="font-medium text-gray-700">{item.itemName}</p>
                        <p className="text-[11.5px] text-gray-400">{item.category} · Qty: {item.quantity}</p>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-1 text-[11.5px] font-medium text-emerald-700">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          {item.disposalMethod}
                        </span>
                      </td>
                      <td className="py-3 text-gray-600">{item.disposalDate}</td>
                      <td className="py-3 font-mono text-[12px] text-gray-500">{item.certificateNo}</td>
                      <td className="py-3">
                        <button
                          type="button"
                          onClick={() => window.alert(`Downloading ${item.certificateNo}...`)}
                          className="flex items-center gap-1 rounded-lg border border-gray-200 px-2.5 py-1 text-[12px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Cert PDF
                        </button>
                      </td>
                    </tr>
                  ))}
                  {disposals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[12.5px] text-gray-400">
                        No historical disposal records match your filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default DisposalHistoryPage;