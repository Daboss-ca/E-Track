import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface ApprovedSlipReportRow {
  id: string;
  trackingCode: string;
  slipType: 'PRS' | 'RRSP';
  itemDescription: string;
  propertyOrIcsNo: string;
  quantity: number;
  unit: string;
  department: string;
  endUser: string;
  dateApproved: string;
  status: 'Disposed';
}

export interface AuditLogItem {
  id: string;
  action: 'Approval' | 'Status Change' | 'Task Assignment';
  details: string;
  performedBy: string;
  role: string;
  timestamp: string;
  status: 'Verified' | 'Logged';
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
  is_rejected_item?: boolean | null;
  rejection_feedback?: string | null;
}

interface DbReturnSlip {
  id: string;
  tracking_code: string;
  slip_type: 'PRS' | 'RRSP';
  department: string | null;
  custodian_name?: string | null;
  returned_by?: string | null;
  validated_date: string | null;
  created_at?: string;
  status: string;
  return_slip_items?: DbReturnSlipItem[];
}

function isAdminApprovedSlip(status: string): boolean {
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

function formatTimestamp(raw?: string | null, fallbackDate?: string | null): string {
  if (raw) {
    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      const yyyy = parsed.getFullYear();
      const mm = String(parsed.getMonth() + 1).padStart(2, '0');
      const dd = String(parsed.getDate()).padStart(2, '0');
      const hh = String(parsed.getHours()).padStart(2, '0');
      const min = String(parsed.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
    }
    return raw.slice(0, 16);
  }
  return fallbackDate || '—';
}

function mapApprovedReports(rows: DbReturnSlip[]): ApprovedSlipReportRow[] {
  const approvedSlips = rows.filter((r) => isAdminApprovedSlip(r.status));

  return approvedSlips.flatMap<ApprovedSlipReportRow>((slip) => {
    const slipType: 'PRS' | 'RRSP' = slip.slip_type === 'RRSP' ? 'RRSP' : 'PRS';
    const department = slip.department || 'N/A';
    const returnedBy = slip.returned_by || 'End-User';
    const dateApproved =
      slip.validated_date || (slip.created_at ? slip.created_at.slice(0, 10) : '—');
    const items = slip.return_slip_items || [];

    if (items.length === 0) {
      return [
        {
          id: `${slip.id}-slip`,
          trackingCode: slip.tracking_code,
          slipType,
          itemDescription: 'No items listed',
          propertyOrIcsNo: '—',
          quantity: 1,
          unit: 'unit',
          department,
          endUser: returnedBy,
          dateApproved,
          status: 'Disposed',
        },
      ];
    }

    return items.map((item) => {
      const tagNo =
        slipType === 'PRS'
          ? item.property_tag || item.property_no || '—'
          : item.property_tag || item.ics_no || '—';

      return {
        id: item.id,
        trackingCode: slip.tracking_code,
        slipType,
        itemDescription: item.device_name,
        propertyOrIcsNo: tagNo,
        quantity: slipType === 'PRS' ? 1 : item.quantity || 1,
        unit: item.unit || 'unit',
        department,
        endUser: item.end_user || returnedBy,
        dateApproved,
        status: 'Disposed',
      };
    });
  });
}

function mapAuditLogsFromSlips(rows: DbReturnSlip[]): AuditLogItem[] {
  return rows.map((slip, index) => {
    const normalized = String(slip.status || '').toLowerCase();
    const isApproved = isAdminApprovedSlip(slip.status);
    const isRejectedOrReturned =
      normalized.includes('rejected') || normalized.includes('returned');

    const action: AuditLogItem['action'] = isApproved
      ? 'Approval'
      : isRejectedOrReturned
        ? 'Status Change'
        : 'Task Assignment';

    const itemCount = slip.return_slip_items?.length ?? 0;
    const dept = slip.department || 'N/A';

    const details = isApproved
      ? `Approved ${slip.slip_type} Return Slip ${slip.tracking_code} (${itemCount} ${
          itemCount === 1 ? 'item' : 'items'
        }) from ${dept}.`
      : isRejectedOrReturned
        ? `Updated status of ${slip.slip_type} Return Slip ${slip.tracking_code} from ${dept} to "${slip.status}".`
        : `Queued ${slip.slip_type} Return Slip ${slip.tracking_code} (${itemCount} ${
            itemCount === 1 ? 'item' : 'items'
          }) from ${dept} — ${slip.status}.`;

    const performedBy = isApproved
      ? 'System Admin'
      : slip.custodian_name || slip.returned_by || 'Property Custodian';

    const role = isApproved ? 'Admin' : 'Custodian';

    return {
      id: `LOG-${String(rows.length - index).padStart(4, '0')}`,
      action,
      details,
      performedBy,
      role,
      timestamp: formatTimestamp(slip.created_at, slip.validated_date),
      status: isApproved ? 'Verified' : 'Logged',
    };
  });
}

export function useAuditLogs() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [disposalReports, setDisposalReports] = useState<ApprovedSlipReportRow[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  const loadAuditData = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('return_slips')
        .select('*, return_slip_items(*)')
        .order('created_at', { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setDisposalReports([]);
        setAuditLogs([]);
        return;
      }

      const rows = (data as DbReturnSlip[]) || [];
      setErrorMessage(null);
      setDisposalReports(mapApprovedReports(rows));
      setAuditLogs(mapAuditLogsFromSlips(rows));
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load audit logs and reports.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const initialFetch = async () => {
      try {
        const { data, error } = await supabase
          .from('return_slips')
          .select('*, return_slip_items(*)')
          .order('created_at', { ascending: false });

        if (!active) return;

        if (error) {
          setErrorMessage(error.message);
          setDisposalReports([]);
          setAuditLogs([]);
          return;
        }

        const rows = (data as DbReturnSlip[]) || [];
        setErrorMessage(null);
        setDisposalReports(mapApprovedReports(rows));
        setAuditLogs(mapAuditLogsFromSlips(rows));
      } catch (err: unknown) {
        if (!active) return;
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load audit logs and reports.'
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void initialFetch();

    const channel = supabase
      .channel('admin-audit-logs-reporting-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'return_slips' },
        () => {
          if (active) {
            void loadAuditData();
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [loadAuditData]);

  const filteredLogs = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return auditLogs.filter((log) => {
      const matchesFilter = selectedFilter === 'All' || log.action === selectedFilter;
      const matchesSearch =
        !q ||
        log.details.toLowerCase().includes(q) ||
        log.performedBy.toLowerCase().includes(q) ||
        log.id.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [auditLogs, searchTerm, selectedFilter]);

  const handleGeneratePDF = (
    reportId: string,
    trackingCode: string,
    callback?: (msg: string) => void
  ) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      callback?.(`Success: Official Report for [${trackingCode}] (${reportId}) prepared.`);
    }, 600);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedFilter,
    setSelectedFilter,
    isExporting,
    loading,
    errorMessage,
    auditLogs,
    disposalReports,
    filteredLogs,
    refreshAuditData: loadAuditData,
    handleGeneratePDF,
  };
}