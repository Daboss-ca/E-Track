import React, { useState, useEffect, useCallback } from 'react';
import {
  Recycle,
  Truck,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  BarChart3,
  ArrowRight,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Badge from '../../components/ui/Badge/badge';
import Button from '../../components/ui/Button/button';

interface UserDashboardProps {
  currentNav?: string;
  onNavigate: (view: string) => void;
}

interface DashboardSlipItem {
  id: string;
  deviceName: string;
  quantity: number;
  returnReason: string;
}

interface DashboardReturnSlip {
  id: string;
  trackingCode: string;
  slipType: 'PRS' | 'RRSP';
  department: string;
  dateSubmitted: string;
  status: string;
  items: DashboardSlipItem[];
}

interface DbReturnSlipItem {
  id: string;
  device_name: string;
  quantity: number | null;
  return_reason: string | null;
}

interface DbReturnSlip {
  id: string;
  tracking_code: string;
  slip_type: 'PRS' | 'RRSP';
  department: string | null;
  validated_date: string | null;
  created_at?: string;
  status: string;
  return_slip_items?: DbReturnSlipItem[];
}

function mapDashboardSlips(rows: DbReturnSlip[]): DashboardReturnSlip[] {
  return rows.map((row) => ({
    id: row.id,
    trackingCode: row.tracking_code,
    slipType: row.slip_type,
    department: row.department || 'N/A',
    dateSubmitted:
      row.validated_date || (row.created_at ? row.created_at.slice(0, 10) : '—'),
    status: row.status,
    items: (row.return_slip_items || []).map((item) => ({
      id: item.id,
      deviceName: item.device_name,
      quantity: item.quantity || 1,
      returnReason: item.return_reason || 'Unserviceable',
    })),
  }));
}

export const UserDashboard: React.FC<UserDashboardProps> = ({ onNavigate }) => {
  const [slips, setSlips] = useState<DashboardReturnSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchDashboardSlips = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('return_slips')
        .select('*, return_slip_items(*)')
        .order('created_at', { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setSlips([]);
        return;
      }

      setErrorMessage(null);
      setSlips(mapDashboardSlips((data as DbReturnSlip[]) || []));
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load dashboard data.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadInitial = async () => {
      try {
        const { data, error } = await supabase
          .from('return_slips')
          .select('*, return_slip_items(*)')
          .order('created_at', { ascending: false });

        if (!active) return;

        if (error) {
          setErrorMessage(error.message);
          setSlips([]);
          return;
        }

        setErrorMessage(null);
        setSlips(mapDashboardSlips((data as DbReturnSlip[]) || []));
      } catch (err: unknown) {
        if (!active) return;
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load dashboard data.'
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInitial();

    const channel = supabase
      .channel('enduser-dashboard-slips-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'return_slips' },
        () => {
          if (active) {
            void fetchDashboardSlips();
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [fetchDashboardSlips]);

  const totalRequests = slips.length;

  const pendingCount = slips.filter((s) =>
    String(s.status).toLowerCase().includes('pending')
  ).length;

  const inProgressCount = slips.filter((s) => {
    const normalized = String(s.status).toLowerCase();
    return (
      normalized.includes('progress') ||
      normalized.includes('scheduled') ||
      normalized.includes('rejected') ||
      normalized.includes('returned')
    );
  }).length;

  const completedCount = slips.filter((s) => {
    const normalized = String(s.status).toLowerCase();
    return normalized.includes('completed') || normalized.includes('approved');
  }).length;

  const renderStatusBadge = (status: string) => {
    const normalized = String(status).toLowerCase();

    if (normalized.includes('pending')) {
      return (
        <Badge
          color="warning"
          variant="light"
          size="sm"
          startIcon={<Clock className="h-3 w-3" />}
        >
          {status}
        </Badge>
      );
    }

    if (
      normalized.includes('progress') ||
      normalized.includes('scheduled') ||
      normalized.includes('rejected') ||
      normalized.includes('returned')
    ) {
      return (
        <Badge
          color="info"
          variant="light"
          size="sm"
          startIcon={<Truck className="h-3 w-3" />}
        >
          {status}
        </Badge>
      );
    }

    if (normalized.includes('completed') || normalized.includes('approved')) {
      return (
        <Badge
          color="success"
          variant="light"
          size="sm"
          startIcon={<CheckCircle2 className="h-3 w-3" />}
        >
          {status}
        </Badge>
      );
    }

    return (
      <Badge color="light" variant="light" size="sm">
        {status}
      </Badge>
    );
  };

  const formatItemSummary = (slip: DashboardReturnSlip) => {
    if (!slip.items || slip.items.length === 0) return 'No items listed';
    if (slip.items.length === 1) return slip.items[0].deviceName;
    return `${slip.items[0].deviceName} (+${slip.items.length - 1} more)`;
  };

  const formatCategorySummary = (slip: DashboardReturnSlip) => {
    const reason = slip.items[0]?.returnReason;
    return reason ? `${slip.slipType} • ${reason}` : slip.slipType;
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Row */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Dashboard
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Overview of your submitted return slips, validation status, and recent activity.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Statistics Grid */}
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
              {loading ? '—' : totalRequests}
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
              {loading ? '—' : pendingCount}
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
              {loading ? '—' : inProgressCount}
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
              {loading ? '—' : completedCount}
            </p>
          </div>
          <p className="mt-4 text-theme-xs font-medium text-emerald-600 dark:text-emerald-400">
            Successfully recycled
          </p>
        </div>
      </div>

      {/* Recent Activity Table Card */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-2xs">
        <div className="mb-5 flex items-center justify-between gap-3">
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
              {loading ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-theme-sm text-gray-400 dark:text-gray-500"
                  >
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      Loading recent activity...
                    </div>
                  </td>
                </tr>
              ) : (
                slips.slice(0, 5).map((slip) => (
                  <tr
                    key={slip.id}
                    className="text-theme-sm transition-colors hover:bg-gray-50/60 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs font-semibold text-gray-800 dark:text-white/90">
                      {slip.trackingCode}
                    </td>
                    <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 font-medium">
                      {formatItemSummary(slip)}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                      {formatCategorySummary(slip)}
                    </td>
                    <td className="px-4 py-3.5 text-gray-500 dark:text-gray-400">
                      {slip.dateSubmitted}
                    </td>
                    <td className="px-4 py-3.5">
                      {renderStatusBadge(slip.status)}
                    </td>
                  </tr>
                ))
              )}

              {!loading && slips.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-theme-sm text-gray-400 dark:text-gray-500"
                  >
                    No recent activity found. Submit a return slip to get started.
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