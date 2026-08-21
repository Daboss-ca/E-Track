// src/pages/faculty/UserDashboard.tsx
import React from 'react';
import { Recycle, Truck, CheckCircle2, Clock, ArrowUpRight, BarChart3, ScanLine, ArrowRight } from 'lucide-react';
import Badge from '../../components/ui/Badge/badge';
import Button from '../../components/ui/Button/button';
import { useEWasteForm } from '../../hooks/faculty/useEWasteForm';

interface UserDashboardProps {
  currentNav?: string;
  onNavigate: (view: string) => void;
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const { ledger } = useEWasteForm();

  const totalRequests = ledger.length;
  const pendingCount = ledger.filter((r) => String(r.status).toLowerCase() === 'pending').length;
  const inProgressCount = ledger.filter((r) => String(r.status).toLowerCase().includes('progress')).length;
  const completedCount = ledger.filter((r) => String(r.status).toLowerCase().includes('completed')).length;

  const renderStatusBadge = (status: string) => {
    const normalized = String(status).toLowerCase();

    if (normalized === 'pending') {
      return (
        <Badge color="warning" variant="light" size="sm" startIcon={<Clock className="h-3 w-3" />}>
          Pending
        </Badge>
      );
    }

    if (normalized.includes('progress')) {
      return (
        <Badge color="info" variant="light" size="sm" startIcon={<Truck className="h-3 w-3" />}>
          In Progress
        </Badge>
      );
    }

    if (normalized.includes('completed') || normalized.includes('approved')) {
      return (
        <Badge color="success" variant="light" size="sm" startIcon={<CheckCircle2 className="h-3 w-3" />}>
          Completed
        </Badge>
      );
    }

    return (
      <Badge color="light" variant="light" size="sm">
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Action Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Faculty &amp; Staff Dashboard
          </h1>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            Monitor and manage your personal electronic waste disposals securely and sustainably.
          </p>
        </div>
        
        <Button
          variant="primary"
          size="md"
          startIcon={<ScanLine className="h-4 w-4" strokeWidth={1.75} />}
          onClick={() => onNavigate('requests-new')}
        >
          Submit E-Waste
        </Button>
      </div>

      {/* Statistics Grid - Structured for Equal Card Heights */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Requests Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-theme-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Total Requests
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <BarChart3 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-800 dark:text-white/90">
              {totalRequests}
            </p>
          </div>
          <p className="mt-4 flex items-center gap-1 text-theme-xs font-medium text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="h-3.5 w-3.5" /> Personal submissions log
          </p>
        </div>

        {/* Pending Requests Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-theme-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Pending Requests
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-500/10 dark:text-amber-400">
                <Clock className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-800 dark:text-white/90">
              {pendingCount}
            </p>
          </div>
          <p className="mt-4 text-theme-xs font-medium text-amber-600 dark:text-amber-400">
            Awaiting initial verification
          </p>
        </div>

        {/* In Progress Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-theme-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                In Progress
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-500 dark:bg-blue-500/10 dark:text-blue-400">
                <Truck className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-800 dark:text-white/90">
              {inProgressCount}
            </p>
          </div>
          <p className="mt-4 text-theme-xs font-medium text-blue-600 dark:text-blue-400">
            Scheduled for collection
          </p>
        </div>

        {/* Completed Card */}
        <div className="flex flex-col justify-between rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-2xs">
          <div>
            <div className="flex items-center justify-between">
              <p className="text-theme-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                Completed
              </p>
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-gray-800 dark:text-white/90">
              {completedCount}
            </p>
          </div>
          <p className="mt-4 text-theme-xs font-medium text-emerald-600 dark:text-emerald-400">
            Successfully recycled
          </p>
        </div>
      </div>

      {/* Recent Activity Table Card */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-2xs">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white/90">
            <Recycle className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
            Recent Activity
          </h2>
          
          <Button
            variant="outline"
            size="sm"
            endIcon={<ArrowRight className="h-3.5 w-3.5" />}
            onClick={() => onNavigate('requests-ledger')}
          >
            View Full Ledger
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-theme-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3 font-semibold">Tracking Code</th>
                <th className="px-4 py-3 font-semibold">Item Name</th>
                <th className="px-4 py-3 font-semibold">Category</th>
                <th className="px-4 py-3 font-semibold">Date Submitted</th>
                <th className="px-4 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {ledger.slice(0, 5).map((req) => (
                <tr
                  key={req.id}
                  className="text-theme-sm transition-colors hover:bg-gray-50/60 dark:hover:bg-white/[0.02]"
                >
                  <td className="px-4 py-3.5 font-medium text-gray-800 dark:text-white/90">
                    {req.trackingCode}
                  </td>
                  <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300">
                    {req.itemName}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                    {req.category}
                  </td>
                  <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                    {req.dateSubmitted}
                  </td>
                  <td className="px-4 py-3.5">
                    {renderStatusBadge(req.status)}
                  </td>
                </tr>
              ))}
              {ledger.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-theme-sm text-gray-400 dark:text-gray-500"
                  >
                    No recent activity found. Submit a request to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;