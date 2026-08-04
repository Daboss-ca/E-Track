// src/pages/faculty/DepartmentReportPage.tsx
import React, { useState } from 'react';
import { FileText, Download, RotateCcw, Filter } from 'lucide-react';
import Sidebar from '../../components/layouts/Sidebar';
import TopHeader from '../../components/layouts/TopBar';
import StatusBadge from '../../components/ui/StatusBadge';
import { useDepartmentReport } from '../../hooks/useDepartmentReport';
import { useEWasteForm } from '../../hooks/useEWasteForm';
import type { UserRole, EquipmentCategory } from '../../types/app';

const CATEGORY_OPTIONS: (EquipmentCategory | 'All')[] = [
  'All',
  'IT Equipment',
  'Peripherals',
  'Networking',
  'Audio/Visual',
  'Appliances',
  'Furniture',
  'Other',
];

const STATUS_OPTIONS = ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'];

interface DepartmentReportPageProps {
  currentNav?: string;
  onNavigate: (view: string) => void;
}

const DepartmentReportPage: React.FC<DepartmentReportPageProps> = ({ currentNav, onNavigate }) => {
  const activeNav = currentNav || 'reports';
  
  const [role, setRole] = useState<UserRole>('Faculty');
  const [headerSearch, setHeaderSearch] = useState('');
  const [showSettings, setShowSettings] = useState(false);

  // Kunin ang ledger data galing sa central state/hook
  const { ledger } = useEWasteForm();
  const { departmentCode, departmentName, filters, filteredRequests, statistics, isExporting, actions } =
    useDepartmentReport(ledger);

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
          {/* Header & Export Actions */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-bold text-gray-900">Department E-Waste Report</h1>
              <p className="mt-0.5 text-[13px] text-gray-400">
                {departmentName} ({departmentCode}) · Summary and analytics of disposed equipment.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => actions.exportReport('CSV')}
                disabled={isExporting}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Download className="h-4 w-4" strokeWidth={1.75} />
                Export CSV
              </button>
              <button
                type="button"
                onClick={() => actions.exportReport('PDF')}
                disabled={isExporting}
                className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                <FileText className="h-4 w-4" strokeWidth={1.75} />
                Export PDF
              </button>
            </div>
          </div>

          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">Total Requests</p>
              <p className="mt-2 text-[28px] font-bold text-gray-900">{statistics.totalRequests}</p>
              <p className="mt-1 text-[12px] text-emerald-600 font-medium">Filtered submissions count</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">Total Items Logged</p>
              <p className="mt-2 text-[28px] font-bold text-gray-900">{statistics.totalItemsCount}</p>
              <p className="mt-1 text-[12px] text-emerald-600 font-medium">Total hardware units</p>
            </div>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
              <p className="text-[12px] font-medium text-gray-400 uppercase tracking-wider">Department Code</p>
              <p className="mt-2 text-[28px] font-bold text-gray-900">{departmentCode}</p>
              <p className="mt-1 text-[12px] text-gray-400 font-medium">Active operational unit</p>
            </div>
          </div>

          {/* Filter Controls Section */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2 text-[14px] font-semibold text-gray-800">
                <Filter className="h-4 w-4 text-emerald-600" />
                Report Filters
              </div>
              <button
                type="button"
                onClick={actions.resetFilters}
                className="flex items-center gap-1 text-[12.5px] font-medium text-gray-500 hover:text-gray-800 transition-colors"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset Filters
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 text-[13px]">
              <div>
                <label className="mb-1 block font-medium text-gray-600">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => actions.updateFilter('startDate', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-gray-600">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => actions.updateFilter('endDate', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block font-medium text-gray-600">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => actions.updateFilter('category', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block font-medium text-gray-600">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => actions.updateFilter('status', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {/* Filtered Report Table */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-[14px] font-semibold text-gray-800">Filtered Request Records</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[11.5px] uppercase tracking-wide text-gray-400">
                    <th className="py-2 font-medium">Tracking Code</th>
                    <th className="py-2 font-medium">Item Batch</th>
                    <th className="py-2 font-medium">Category</th>
                    <th className="py-2 font-medium">Date Submitted</th>
                    <th className="py-2 font-medium">Items Count</th>
                    <th className="py-2 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRequests.map((req) => {
                    const itemCount = req.equipmentItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                    return (
                      <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                        <td className="py-3 font-medium text-gray-700">{req.trackingCode}</td>
                        <td className="py-3 text-gray-600">{req.itemName}</td>
                        <td className="py-3 text-gray-500">{req.category}</td>
                        <td className="py-3 text-gray-500">{req.dateSubmitted}</td>
                        <td className="py-3 text-gray-700 font-medium">{itemCount} unit(s)</td>
                        <td className="py-3">
                          <StatusBadge status={req.status} size="sm" />
                        </td>
                      </tr>
                    );
                  })}
                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-[12.5px] text-gray-400">
                        No records match the selected report filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

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
                ✕
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

export default DepartmentReportPage;