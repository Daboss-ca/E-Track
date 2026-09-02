import { useState, useMemo } from 'react';

export interface AdminMetrics {
  totalEwasteVolume: string;
  activeDisposalRequests: number;
  systemStatus: string;
  completedDisposals: number;
}

export function useAdminDashboard() {
  // Mock data states para sa admin overview metrics
  const [metrics] = useState<AdminMetrics>({
    totalEwasteVolume: '1,420.50 kg',
    activeDisposalRequests: 14,
    systemStatus: 'Optimal (98.2%)',
    completedDisposals: 86,
  });

  // Data mapping para sa Task Workflow Pipeline bar graph gamit ang ApexCharts categories
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
  };
}