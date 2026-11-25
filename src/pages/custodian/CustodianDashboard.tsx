import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Clock,
  Send,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Card from '../../components/Card/card';
import Badge from '../../components/ui/Badge/badge';
import Button from '../../components/ui/Button/button';
import { DataTable } from '../../components/ui/Table';
import type { DataTableColumn } from '../../components/ui/Table';

interface CustodianDashboardProps {
  currentNav?: string;
  onNavigate?: (view: string) => void;
}

interface CustodianSlipItem {
  id: string;
  deviceName: string;
  quantity: number;
  returnReason: string;
}

interface CustodianReturnSlip {
  id: string;
  trackingCode: string;
  slipType: 'PRS' | 'RRSP';
  department: string;
  returnedBy: string;
  dateSubmitted: string;
  status: string;
  items: CustodianSlipItem[];
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
  returned_by?: string | null;
  validated_date: string | null;
  created_at?: string;
  status: string;
  return_slip_items?: DbReturnSlipItem[];
}

function mapCustodianSlips(rows: DbReturnSlip[]): CustodianReturnSlip[] {
  return rows.map((row) => ({
    id: row.id,
    trackingCode: row.tracking_code,
    slipType: row.slip_type === 'RRSP' ? 'RRSP' : 'PRS',
    department: row.department || 'N/A',
    returnedBy: row.returned_by || 'End-User',
    dateSubmitted:
      row.validated_date || (row.created_at ? row.created_at.slice(0, 10) : '—'),
    status: row.status,
    items: (row.return_slip_items || []).map((item) => ({
      id: item.id,
      deviceName: item.device_name,
      quantity: row.slip_type === 'PRS' ? 1 : item.quantity || 1,
      returnReason: item.return_reason || 'Unserviceable',
    })),
  }));
}

export const CustodianDashboard: React.FC<CustodianDashboardProps> = ({
  onNavigate,
}) => {
  const [slips, setSlips] = useState<CustodianReturnSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchCustodianSlips = useCallback(async () => {
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
      setSlips(mapCustodianSlips((data as DbReturnSlip[]) || []));
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load custodian dashboard data.'
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
        setSlips(mapCustodianSlips((data as DbReturnSlip[]) || []));
      } catch (err: unknown) {
        if (!active) return;
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load custodian dashboard data.'
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInitial();

    const channel = supabase
      .channel('custodian-dashboard-slips-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'return_slips' },
        () => {
          if (active) {
            void fetchCustodianSlips();
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [fetchCustodianSlips]);

  const stats = useMemo(() => {
    let pendingCustodian = 0;
    let forwardedToAdmin = 0;
    let rejectedForRevision = 0;
    let adminApproved = 0;

    for (const slip of slips) {
      const normalized = String(slip.status || '').toLowerCase();

      if (
        normalized.includes('rejected') ||
        normalized.includes('returned')
      ) {
        rejectedForRevision += 1;
      } else if (
        normalized.includes('approved by admin') ||
        normalized.includes('admin approved') ||
        normalized === 'approved' ||
        normalized === 'completed'
      ) {
        adminApproved += 1;
      } else if (
        normalized.includes('admin') ||
        normalized.includes('forwarded')
      ) {
        forwardedToAdmin += 1;
      } else if (normalized.includes('pending')) {
        pendingCustodian += 1;
      }
    }

    return {
      total: slips.length,
      pendingCustodian,
      forwardedToAdmin,
      rejectedForRevision,
      adminApproved,
    };
  }, [slips]);

  const renderStatusBadge = (status: string) => {
    const normalized = String(status || '').toLowerCase();

    if (normalized.includes('rejected') || normalized.includes('returned')) {
      return (
        <Badge
          color="error"
          variant="light"
          size="sm"
          startIcon={<RotateCcw className="h-3 w-3" />}
        >
          {status}
        </Badge>
      );
    }

    if (
      normalized.includes('approved by admin') ||
      normalized.includes('admin approved') ||
      normalized === 'approved' ||
      normalized === 'completed'
    ) {
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

    if (normalized.includes('admin') || normalized.includes('forwarded')) {
      return (
        <Badge
          color="info"
          variant="light"
          size="sm"
          startIcon={<Send className="h-3 w-3" />}
        >
          {status}
        </Badge>
      );
    }

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
  };

  const columns: DataTableColumn<CustodianReturnSlip>[] = [
    {
      key: 'trackingCode',
      header: 'Tracking Code',
      dataType: 'identifier',
      pin: 'left',
      sortable: true,
      accessor: (row) => row.trackingCode,
      render: (row) => (
        <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
          {row.trackingCode}
        </span>
      ),
    },
    {
      key: 'slipType',
      header: 'Form Type',
      dataType: 'text',
      sortable: true,
      accessor: (row) => row.slipType,
      render: (row) => (
        <Badge
          color={row.slipType === 'PRS' ? 'primary' : 'info'}
          variant="light"
          size="sm"
        >
          {row.slipType}
        </Badge>
      ),
    },
    {
      key: 'items',
      header: 'Returned Items',
      dataType: 'text',
      sortable: false,
      accessor: (row) => row.items.map((i) => i.deviceName).join(', '),
      render: (row) => {
        if (row.items.length === 0) {
          return <span className="text-gray-400">No items</span>;
        }
        const first = row.items[0];
        return (
          <div>
            <p className="font-semibold text-gray-900 dark:text-gray-100">
              {first.deviceName}
              {row.items.length > 1 ? ` (+${row.items.length - 1} more)` : ''}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400">
              {row.items.length} {row.items.length === 1 ? 'item' : 'items'} · {first.returnReason}
            </p>
          </div>
        );
      },
    },
    {
      key: 'department',
      header: 'Originating Office',
      dataType: 'text',
      sortable: true,
      accessor: (row) => row.department,
      render: (row) => (
        <div>
          <p className="font-medium text-gray-800 dark:text-gray-200">{row.department}</p>
          <p className="text-[11px] text-gray-500 dark:text-gray-400">By {row.returnedBy}</p>
        </div>
      ),
    },
    {
      key: 'dateSubmitted',
      header: 'Date Submitted',
      dataType: 'text',
      sortable: true,
      accessor: (row) => row.dateSubmitted,
    },
    {
      key: 'status',
      header: 'Workflow Status',
      dataType: 'text',
      sortable: true,
      accessor: (row) => row.status,
      render: (row) => renderStatusBadge(row.status),
    },
  ];

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Dashboard
          </h1>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Overview of incoming PRS and RRSP return slips, validation workload, and admin approvals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* KPI Cards using Card Component */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card
          title="Pending Validation"
          subtitle="Awaiting custodian review"
          action={
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400">
              <Clock className="h-4 w-4" />
            </div>
          }
          footer={<span>Needs item verification & approval</span>}
        >
          <div className="w-full py-1 text-left">
            <span className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
              {loading ? '—' : stats.pendingCustodian}
            </span>
          </div>
        </Card>

        <Card
          title="Forwarded to Admin"
          subtitle="Validated by custodian"
          action={
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400">
              <Send className="h-4 w-4" />
            </div>
          }
          footer={<span>Awaiting final Admin sign-off</span>}
        >
          <div className="w-full py-1 text-left">
            <span className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
              {loading ? '—' : stats.forwardedToAdmin}
            </span>
          </div>
        </Card>

        <Card
          title="Returned for Revision"
          subtitle="Rejected with feedback"
          action={
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <RotateCcw className="h-4 w-4" />
            </div>
          }
          footer={<span>Awaiting end-user resubmission</span>}
        >
          <div className="w-full py-1 text-left">
            <span className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
              {loading ? '—' : stats.rejectedForRevision}
            </span>
          </div>
        </Card>

        <Card
          title="Admin Approved"
          subtitle="Completed return slips"
          action={
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          }
          footer={
            <span>
              Out of <strong>{loading ? '—' : stats.total}</strong> total slips
            </span>
          }
        >
          <div className="w-full py-1 text-left">
            <span className="text-3xl font-bold tabular-nums text-gray-900 dark:text-white">
              {loading ? '—' : stats.adminApproved}
            </span>
          </div>
        </Card>
      </div>

      {/* Recent Return Slips Table using Card + DataTable */}
      <Card
        title="Recent Return Slips"
        subtitle="Latest PRS and RRSP submissions across departments"
        action={
          onNavigate && (
            <Button
              variant="outline"
              size="sm"
              endIcon={<ArrowRight className="h-3.5 w-3.5" />}
              onClick={() => onNavigate('status-monitoring')}
            >
              View Status Monitoring
            </Button>
          )
        }
      >
        <div className="w-full">
          <DataTable
            columns={columns}
            data={slips.slice(0, 8)}
            getRowId={(row) => row.id}
            isLoading={loading}
            skeletonRows={5}
            density="default"
            emptyIcon={<FileSpreadsheet className="h-5 w-5" />}
            emptyMessage="No return slips submitted yet."
          />
        </div>
      </Card>
    </div>
  );
};

export default CustodianDashboard;