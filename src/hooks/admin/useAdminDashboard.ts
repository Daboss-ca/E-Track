import {  useMemo } from 'react';

export interface AdminMetrics {
  totalEwasteVolume: string;
  activeDisposalRequests: number;
  systemStatus: string;
  completedDisposals: number;
}

export function useAdminDashboard() {
  const rawCurrentWeight = 120.50;
  const maxCapacity = 1800;

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
      activeDisposalRequests: 14,
      systemStatus: statusText,
      completedDisposals: 86,
    };
  }, [rawCurrentWeight, maxCapacity]);

  const workflowData = useMemo(() => {
    return {
      categories: [
        'Submitted',
        'Custodian Validated',
        'Pending Admin Approval',
        'Dispatched / In Progress',
        'Dismantled & Logged',
        'Final Disposal',
      ],
      seriesData: [45, 32, 14, 18, 27, 86],
    };
  }, []);

  return {
    metrics,
    workflowData,
    rawCurrentWeight,
    maxCapacity,
  };
}