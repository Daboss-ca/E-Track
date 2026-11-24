import { useMemo } from 'react';
import { mockReturnSlips, type ValidatedReturnSlip } from './useWorkDispatch';

export interface AdminMetrics {
  totalEwasteVolume: string;
  pendingReturnSlips: number;
  systemStatus: string;
  arClearedItems: number;
}

export function useAdminDashboard(slips: ValidatedReturnSlip[] = mockReturnSlips) {
  const rawCurrentWeight = 120.50;
  const maxCapacity = 1800;

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
    const percentage = Math.round((rawCurrentWeight / maxCapacity) * 100);
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