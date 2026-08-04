// src/pages/faculty/UserDashboard.tsx
import React, { useState } from 'react';
import { Recycle, Truck, CheckCircle2, Clock, ArrowUpRight, BarChart3, ScanLine, X } from 'lucide-react';
import Sidebar from '../../components/layouts/Sidebar';
import TopHeader from '../../components/layouts/TopBar';
import StatusBadge from '../../components/ui/StatusBadge';
import { useEWasteForm } from '../../hooks/useEWasteForm';

interface UserDashboardProps {
  currentNav?: string;
  onNavigate: (view: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ currentNav, onNavigate }) => {
  const activeNav = currentNav || 'dashboard';
  
  const [headerSearch, setHeaderSearch] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  const { ledger } = useEWasteForm();

  // Metrics computation na safe sa TypeScript strict types
  const totalRequests = ledger.length;
  const pendingCount = ledger.filter((r) => String(r.status).toLowerCase() === 'pending').length;
  const inProgressCount = ledger.filter((r) => String(r.status).toLowerCase().includes('progress')).length;
  const completedCount = ledger.filter((r) => String(r.status).toLowerCase() === 'completed').length;

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-sans antialiased">
      {/* Sidebar Integration */}
      <div className="h-full shrink-0">
        <Sidebar
          activeId={activeNav}
          onNavigate={onNavigate}
          onOpenSettings={() => setShowSettings(true)}
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
          {/* Header Action Row */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[22px] font-bold text-gray-900">Faculty &amp; Staff Dashboard</h1>
              <p className="mt-0.5 text-[13px] text-gray-400">
                Monitor and manage your personal electronic waste disposals securely and sustainably.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('requests-new')}
              className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors shadow-sm"
            >
              <ScanLine className="h-4 w-4" strokeWidth={1.75} />
              Submit E-Waste
            </button>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">Total Requests</p>
                <BarChart3 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-[28px] font-bold text-gray-900">{totalRequests}</p>
              <p className="mt-1 text-[12px] text-emerald-600 font-medium flex items-center gap-1">
                <ArrowUpRight className="h-3.5 w-3.5" /> Personal submissions log
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">Pending Requests</p>
                <Clock className="h-4 w-4 text-amber-500" />
              </div>
              <p className="mt-2 text-[28px] font-bold text-gray-900">{pendingCount}</p>
              <p className="mt-1 text-[12px] text-amber-600 font-medium">Awaiting initial verification</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">In Progress</p>
                <Truck className="h-4 w-4 text-blue-500" />
              </div>
              <p className="mt-2 text-[28px] font-bold text-gray-900">{inProgressCount}</p>
              <p className="mt-1 text-[12px] text-blue-600 font-medium">Scheduled for collection</p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">Completed</p>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-2 text-[28px] font-bold text-gray-900">{completedCount}</p>
              <p className="mt-1 text-[12px] text-emerald-600 font-medium">Successfully recycled</p>
            </div>
          </div>

          {/* Recent Activity Table Card */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-gray-800 flex items-center gap-2">
                <Recycle className="h-4 w-4 text-emerald-600" />
                Recent Activity
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('requests-ledger')}
                className="text-[12.5px] font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                View Full Ledger →
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[11.5px] uppercase tracking-wide text-gray-400">
                    <th className="py-2 font-medium">Tracking Code</th>
                    <th className="py-2 font-medium">Item Name</th>
                    <th className="py-2 font-medium">Category</th>
                    <th className="py-2 font-medium">Date Submitted</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {ledger.slice(0, 5).map((req) => (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="py-3 font-medium text-gray-700">{req.trackingCode}</td>
                      <td className="py-3 text-gray-600">{req.itemName}</td>
                      <td className="py-3 text-gray-500">{req.category}</td>
                      <td className="py-3 text-gray-500">{req.dateSubmitted}</td>
                      <td className="py-3">
                        <StatusBadge status={req.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                  {ledger.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-6 text-center text-[12.5px] text-gray-400">
                        No recent activity found. Submit a request to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* Settings Modal */}
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

export default UserDashboard;