import { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../lib/supabase';
import type { ValidatedReturnSlip } from './useWorkDispatch';

export interface AdminMetrics {
  totalEwasteVolume: string;
  pendingReturnSlips: number;
  systemStatus: string;
  arClearedItems: number;
}

interface EwasteWeightRow {
  weight_kg: number | string | null;
  quantity: number | null;
}

export function useAdminDashboard(slips: ValidatedReturnSlip[] = []) {
  const [dbWeightKg, setDbWeightKg] = useState<number>(0);
  const maxCapacity = 1800;

  useEffect(() => {
    let active = true;

    async function loadInventoryWeight() {
      const { data, error } = await supabase
        .from('ewaste_inventory')
        .select('weight_kg, quantity');

      if (!active || error || !data) return;

      const total = (data as EwasteWeightRow[]).reduce((sum, row) => {
        const w = Number(row.weight_kg) || 0;
        const q = row.quantity || 1;
        return sum + w * q;
      }, 0);

      setDbWeightKg(Number(total.toFixed(2)));
    }

    void loadInventoryWeight();

    return () => {
      active = false;
    };
  }, [slips]);

  const rawCurrentWeight = dbWeightKg;

  const { pendingCount, approvedCount, clearedItemQty, prsCount, rrspCount } = useMemo(() => {
    let pending = 0;
    let approved = 0;
    let clearedQty = 0;
    let prs = 0;
    let rrsp = 0;

    for (const slip of slips) {
      if (slip.slipType === 'PRS') prs += 1;
      if (slip.slipType === 'RRSP') rrsp += 1;

      if (slip.status === 'Pending Admin Approval') {
        pending += 1;
      } else if (slip.status === 'Approved') {
        approved += 1;
        clearedQty += slip.items.reduce((sum, item) => sum + (item.quantity || 1), 0);
      }
    }

    return {
      pendingCount: pending,
      approvedCount: approved,
      clearedItemQty: clearedQty,
      prsCount: prs,
      rrspCount: rrsp,
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
      pendingReturnSlips: pendingCount,
      systemStatus: statusText,
      arClearedItems: clearedItemQty,
    };
  }, [rawCurrentWeight, maxCapacity, pendingCount, clearedItemQty]);

  const workflowData = useMemo(() => {
    const totalSlips = slips.length;
    const validatedSlips = slips.filter((s) => s.status !== 'Rejected').length;

    return {
      categories: [
        'Submitted',
        'Custodian Review',
        'Pending Approval',
        'PRS / RRSP Issued',
        'Hazard Tagged',
        'AR Cleared',
      ],
      seriesData: [
        totalSlips,
        validatedSlips,
        pendingCount,
        prsCount + rrspCount,
        approvedCount,
        clearedItemQty,
      ],
    };
  }, [slips, pendingCount, prsCount, rrspCount, approvedCount, clearedItemQty]);

  return {
    metrics,
    workflowData,
    rawCurrentWeight,
    maxCapacity,
  };
}