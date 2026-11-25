import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface AdminMetrics {
  totalEwasteVolume: string;
  pendingReturnSlips: number;
  systemStatus: string;
  arClearedItems: number;
}

interface EwasteInventoryRecord {
  weight_kg?: number | string | null;
  quantity?: number | null;
  category?: string | null;
  item_type?: string | null;
  classification?: string | null;
  created_at?: string | null;
  date_recorded?: string | null;
  date_acquired?: string | null;
}

interface SlipStatusRow {
  id: string;
  slip_type: 'PRS' | 'RRSP' | string | null;
  status: string | null;
  return_slip_items?: { quantity: number | null }[] | null;
}

const MONTH_LABELS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

function normalizeStatus(status?: string | null): string {
  return String(status || '').trim().toLowerCase();
}

function isApprovedSlip(status?: string | null): boolean {
  const s = normalizeStatus(status);
  if (
    s.includes('pending') ||
    s.includes('rejected') ||
    s.includes('returned') ||
    s.includes('draft')
  ) {
    return false;
  }
  return (
    s.includes('approved by admin') ||
    s.includes('admin approved') ||
    s === 'approved' ||
    s === 'completed'
  );
}

function isPendingAdminSlip(status?: string | null): boolean {
  const s = normalizeStatus(status);
  return s.includes('pending admin') || s === 'pending approval' || s.includes('forwarded');
}

function isHazardousRecord(row: EwasteInventoryRecord): boolean {
  const combined = `${row.category || ''} ${row.item_type || ''} ${row.classification || ''}`
    .trim()
    .toLowerCase();
  return combined.includes('hazard');
}

function extractYearAndMonth(row: EwasteInventoryRecord): { year: number; monthIndex: number } | null {
  const rawDate = row.created_at || row.date_recorded || row.date_acquired;
  if (!rawDate) return null;

  const isoMatch = /^(\d{4})-(\d{2})-(\d{2})/.exec(rawDate.trim());
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const monthNum = Number(isoMatch[2]);
    if (!Number.isNaN(year) && monthNum >= 1 && monthNum <= 12) {
      return { year, monthIndex: monthNum - 1 };
    }
  }

  const parsed = new Date(rawDate);
  if (!Number.isNaN(parsed.getTime())) {
    return {
      year: parsed.getFullYear(),
      monthIndex: parsed.getMonth(),
    };
  }

  return null;
}

export function useAdminDashboard() {
  const currentSystemYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState<number>(currentSystemYear);
  const [inventoryRows, setInventoryRows] = useState<EwasteInventoryRecord[]>([]);
  const [slips, setSlips] = useState<SlipStatusRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const maxCapacity = 1800;

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [inventoryRes, slipsRes] = await Promise.all([
        supabase.from('ewaste_inventory').select('*'),
        supabase
          .from('return_slips')
          .select('id, slip_type, status, return_slip_items(quantity)'),
      ]);

      if (!inventoryRes.error && inventoryRes.data) {
        setInventoryRows(inventoryRes.data as EwasteInventoryRecord[]);
      }

      if (!slipsRes.error && slipsRes.data) {
        setSlips(slipsRes.data as SlipStatusRow[]);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const initialLoad = async () => {
      try {
        const [inventoryRes, slipsRes] = await Promise.all([
          supabase.from('ewaste_inventory').select('*'),
          supabase
            .from('return_slips')
            .select('id, slip_type, status, return_slip_items(quantity)'),
        ]);

        if (!active) return;

        if (!inventoryRes.error && inventoryRes.data) {
          setInventoryRows(inventoryRes.data as EwasteInventoryRecord[]);
        }

        if (!slipsRes.error && slipsRes.data) {
          setSlips(slipsRes.data as SlipStatusRow[]);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void initialLoad();

    const slipsChannel = supabase
      .channel('admin-dashboard-return-slips-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'return_slips' },
        () => {
          if (active) {
            void loadDashboardData();
          }
        }
      )
      .subscribe();

    const inventoryChannel = supabase
      .channel('admin-dashboard-inventory-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ewaste_inventory' },
        () => {
          if (active) {
            void loadDashboardData();
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(slipsChannel);
      void supabase.removeChannel(inventoryChannel);
    };
  }, [loadDashboardData]);

  const availableYears = useMemo(() => {
    const yearsSet = new Set<number>([2026, currentSystemYear]);
    for (const row of inventoryRows) {
      const extracted = extractYearAndMonth(row);
      if (extracted) {
        yearsSet.add(extracted.year);
      }
    }
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [inventoryRows, currentSystemYear]);

  const rawCurrentWeight = useMemo(() => {
    const total = inventoryRows.reduce((sum, row) => {
      const w = Number(row.weight_kg) || 0;
      const q = row.quantity || 1;
      return sum + w * q;
    }, 0);
    return Number(total.toFixed(2));
  }, [inventoryRows]);

  const slipCounts = useMemo(() => {
    let pendingAdmin = 0;
    let approvedSlips = 0;

    for (const slip of slips) {
      if (isApprovedSlip(slip.status)) {
        approvedSlips += 1;
      } else if (isPendingAdminSlip(slip.status)) {
        pendingAdmin += 1;
      }
    }

    return {
      pendingAdmin,
      approvedSlips,
    };
  }, [slips]);

  const metrics = useMemo<AdminMetrics>(() => {
    const percentage = Math.min(100, Math.round((rawCurrentWeight / maxCapacity) * 100));
    let statusText = `Optimal (${100 - percentage}% Free)`;

    if (percentage >= 90) {
      statusText = 'Critical (Storage Full)';
    } else if (percentage >= 80) {
      statusText = 'Warning (High Load)';
    }

    return {
      totalEwasteVolume: `${rawCurrentWeight.toLocaleString()} kg`,
      pendingReturnSlips: slipCounts.pendingAdmin,
      systemStatus: statusText,
      arClearedItems: slipCounts.approvedSlips,
    };
  }, [rawCurrentWeight, maxCapacity, slipCounts]);

  const monthlyHazardousData = useMemo(() => {
    const monthlyKg = Array.from({ length: 12 }, () => 0);

    for (const row of inventoryRows) {
      if (!isHazardousRecord(row)) continue;

      const extracted = extractYearAndMonth(row);
      if (!extracted || extracted.year !== selectedYear) continue;

      const w = Number(row.weight_kg) || 0;
      const q = row.quantity || 1;
      monthlyKg[extracted.monthIndex] = Number(
        (monthlyKg[extracted.monthIndex] + w * q).toFixed(2)
      );
    }

    return {
      categories: MONTH_LABELS,
      seriesData: monthlyKg,
    };
  }, [inventoryRows, selectedYear]);

  return {
    metrics,
    selectedYear,
    setSelectedYear,
    availableYears,
    monthlyHazardousData,
    rawCurrentWeight,
    maxCapacity,
    loading,
    refreshDashboard: loadDashboardData,
  };
}