import React, { useState, useEffect, useCallback } from 'react';
import {
  Archive,
  Search,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Filter,
  FileCheck2,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Badge from '../../components/ui/Badge/badge';

interface DisposalHistoryPageProps {
  onNavigate?: (view: string) => void;
}

interface ApprovedSlipRecord {
  rowKey: string;
  slipId: string;
  trackingCode: string;
  slipType: 'PRS' | 'RRSP';
  department: string;
  returnedBy: string;
  approvedDate: string;
  status: string;
  itemDescription: string;
  propertyOrIcsNo: string;
  quantity: number;
  unit: string;
  acquisitionCost: number;
  endUser: string;
  location: string;
  returnReason: string;
}

interface DbReturnSlipItem {
  id: string;
  slip_id: string;
  device_name: string;
  quantity: number | null;
  unit: string | null;
  acquisition_cost: number | string | null;
  property_no: string | null;
  ics_no: string | null;
  property_tag?: string | null;
  return_reason: string | null;
  end_user: string | null;
  location: string | null;
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

function isAdminApprovedStatus(status: string): boolean {
  const normalized = String(status || '').trim().toLowerCase();
  if (
    normalized.includes('pending') ||
    normalized.includes('rejected') ||
    normalized.includes('returned') ||
    normalized.includes('draft')
  ) {
    return false;
  }
  return (
    normalized.includes('approved by admin') ||
    normalized.includes('admin approved') ||
    normalized === 'approved' ||
    normalized === 'completed'
  );
}

function mapApprovedRecords(rows: DbReturnSlip[]): ApprovedSlipRecord[] {
  const approvedRows = rows.filter((row) => isAdminApprovedStatus(row.status));

  return approvedRows.flatMap<ApprovedSlipRecord>((slip) => {
    const slipType: 'PRS' | 'RRSP' = slip.slip_type === 'RRSP' ? 'RRSP' : 'PRS';
    const department = slip.department || 'N/A';
    const returnedBy = slip.returned_by || 'End-User';
    const approvedDate =
      slip.validated_date || (slip.created_at ? slip.created_at.slice(0, 10) : '—');
    const items = slip.return_slip_items || [];

    if (items.length === 0) {
      return [
        {
          rowKey: `${slip.id}-summary`,
          slipId: slip.id,
          trackingCode: slip.tracking_code,
          slipType,
          department,
          returnedBy,
          approvedDate,
          status: slip.status,
          itemDescription: 'No items listed',
          propertyOrIcsNo: '—',
          quantity: 1,
          unit: 'unit',
          acquisitionCost: 0,
          endUser: returnedBy,
          location: department,
          returnReason: 'Unserviceable',
        },
      ];
    }

    return items.map((item) => {
      const tagNo =
        slipType === 'PRS'
          ? item.property_tag || item.property_no || '—'
          : item.property_tag || item.ics_no || '—';

      return {
        rowKey: item.id,
        slipId: slip.id,
        trackingCode: slip.tracking_code,
        slipType,
        department,
        returnedBy,
        approvedDate,
        status: slip.status,
        itemDescription: item.device_name,
        propertyOrIcsNo: tagNo,
        quantity: slipType === 'PRS' ? 1 : item.quantity || 1,
        unit: item.unit || 'unit',
        acquisitionCost: Number(item.acquisition_cost) || 0,
        endUser: item.end_user || returnedBy,
        location: item.location || department,
        returnReason: item.return_reason || 'Unserviceable',
      };
    });
  });
}

const DisposalHistoryPage: React.FC<DisposalHistoryPageProps> = () => {
  const [records, setRecords] = useState<ApprovedSlipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [slipTypeFilter, setSlipTypeFilter] = useState<'ALL' | 'PRS' | 'RRSP'>('ALL');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchApprovedRecords = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('return_slips')
        .select('*, return_slip_items(*)')
        .order('created_at', { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setRecords([]);
        return;
      }

      setErrorMessage(null);
      setRecords(mapApprovedRecords((data as DbReturnSlip[]) || []));
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load approved return slips.'
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
          setRecords([]);
          return;
        }

        setErrorMessage(null);
        setRecords(mapApprovedRecords((data as DbReturnSlip[]) || []));
      } catch (err: unknown) {
        if (!active) return;
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load approved return slips.'
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInitial();

    const channel = supabase
      .channel('approved-return-slips-history-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'return_slips' },
        () => {
          if (active) {
            void fetchApprovedRecords();
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [fetchApprovedRecords]);

  const filteredRecords = records.filter((rec) => {
    if (slipTypeFilter !== 'ALL' && rec.slipType !== slipTypeFilter) {
      return false;
    }

    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;

    return (
      rec.trackingCode.toLowerCase().includes(q) ||
      rec.slipType.toLowerCase().includes(q) ||
      rec.itemDescription.toLowerCase().includes(q) ||
      rec.propertyOrIcsNo.toLowerCase().includes(q) ||
      rec.department.toLowerCase().includes(q) ||
      rec.endUser.toLowerCase().includes(q) ||
      rec.location.toLowerCase().includes(q) ||
      rec.status.toLowerCase().includes(q)
    );
  });

  const getFilterBtnClass = (active: boolean) =>
    active
      ? 'inline-flex h-8 items-center justify-center rounded-lg border border-gray-300 bg-gray-200 px-3 text-xs font-semibold text-gray-900 hover:bg-gray-300 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
      : 'inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white';

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2.5 text-2xl font-bold text-gray-800 dark:text-white/90">
            <Archive
              className="h-6 w-6 text-emerald-600 dark:text-emerald-500"
              strokeWidth={2}
            />
            Disposal History
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Records of PRS and RRSP return slips that have been approved by the Admin.
          </p>
        </div>

        {/* Search Box */}
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracking, item, or tag..."
            className="w-full rounded-full border border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/80 dark:text-white py-2 pl-9 pr-4 text-theme-sm focus:border-emerald-500 focus:bg-white dark:focus:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 dark:border-gray-800 dark:bg-white/[0.03] shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 mr-1">
            <Filter className="h-3.5 w-3.5" /> Slip Type:
          </span>
          <button
            type="button"
            onClick={() => setSlipTypeFilter('ALL')}
            className={getFilterBtnClass(slipTypeFilter === 'ALL')}
          >
            All Approved
          </button>
          <button
            type="button"
            onClick={() => setSlipTypeFilter('PRS')}
            className={getFilterBtnClass(slipTypeFilter === 'PRS')}
          >
            PRS
          </button>
          <button
            type="button"
            onClick={() => setSlipTypeFilter('RRSP')}
            className={getFilterBtnClass(slipTypeFilter === 'RRSP')}
          >
            RRSP
          </button>
        </div>

        <span className="text-xs text-gray-500 dark:text-gray-400">
          Showing <strong className="text-gray-800 dark:text-gray-200">{filteredRecords.length}</strong> approved{' '}
          {filteredRecords.length === 1 ? 'item' : 'items'}
        </span>
      </div>

      {/* Main Table Container Card */}
      <section className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] p-5 sm:p-6 shadow-2xs">
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800/80">
          <table className="w-full border-collapse text-left text-theme-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50/50 dark:border-gray-800 dark:bg-gray-900/40 text-theme-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="px-4 py-3.5 font-semibold whitespace-nowrap">Tracking Code</th>
                <th className="px-4 py-3.5 font-semibold whitespace-nowrap">Slip Type</th>
                <th className="px-4 py-3.5 font-semibold min-w-[200px]">Item Description</th>
                <th className="px-4 py-3.5 font-semibold whitespace-nowrap">Property / ICS No.</th>
                <th className="px-4 py-3.5 font-semibold whitespace-nowrap">Qty / Unit</th>
                <th className="px-4 py-3.5 font-semibold whitespace-nowrap">Details (PRS / RRSP)</th>
                <th className="px-4 py-3.5 font-semibold whitespace-nowrap">Date Approved</th>
                <th className="px-4 py-3.5 font-semibold text-right whitespace-nowrap">Admin Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60 bg-white dark:bg-transparent">
              {loading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-theme-sm text-gray-400 dark:text-gray-500"
                  >
                    <div className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                      Loading admin-approved records...
                    </div>
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => (
                  <tr
                    key={rec.rowKey}
                    className="transition-colors hover:bg-gray-50/80 dark:hover:bg-white/[0.02]"
                  >
                    <td className="px-4 py-3.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      {rec.trackingCode}
                    </td>

                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <Badge
                        color={rec.slipType === 'PRS' ? 'success' : 'info'}
                        variant="light"
                        size="sm"
                      >
                        {rec.slipType}
                      </Badge>
                    </td>

                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-800 dark:text-white/90">
                        {rec.itemDescription}
                      </p>
                      <p className="text-theme-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {rec.department} · {rec.returnReason}
                      </p>
                    </td>

                    <td className="px-4 py-3.5 font-mono text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {rec.propertyOrIcsNo}
                    </td>

                    <td className="px-4 py-3.5 text-gray-700 dark:text-gray-300 whitespace-nowrap font-medium">
                      {rec.quantity} {rec.unit}
                    </td>

                    <td className="px-4 py-3.5 text-xs text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {rec.slipType === 'PRS' ? (
                        <span>
                          Cost:{' '}
                          <strong className="text-gray-800 dark:text-gray-100">
                            ₱{rec.acquisitionCost.toLocaleString()}
                          </strong>
                        </span>
                      ) : (
                        <span>
                          {rec.endUser} ·{' '}
                          <strong className="text-gray-800 dark:text-gray-100">
                            {rec.location}
                          </strong>
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-3.5 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {rec.approvedDate}
                    </td>

                    <td className="px-4 py-3.5 text-right whitespace-nowrap">
                      <Badge
                        color="success"
                        variant="light"
                        size="sm"
                        startIcon={
                          rec.status.toLowerCase().includes('admin') ? (
                            <FileCheck2 className="h-3 w-3" />
                          ) : (
                            <CheckCircle2 className="h-3 w-3" />
                          )
                        }
                      >
                        {rec.status}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}

              {!loading && filteredRecords.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-10 text-center text-theme-sm text-gray-400 dark:text-gray-500"
                  >
                    No admin-approved PRS or RRSP records match your filter.
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

export default DisposalHistoryPage;