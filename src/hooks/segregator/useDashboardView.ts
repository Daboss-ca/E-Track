import { useMemo } from 'react';
import type { WorkOrder } from '../../types/segregator/segregator.types';

export interface UseDashboardViewParams {
  workOrders: WorkOrder[];
}

export function useDashboardView({ workOrders }: UseDashboardViewParams) {
  // Memoized filter para maiwasan ang re-calculation tuwing re-render
  const activeWorkOrders = useMemo(() => {
    return workOrders.filter(
      (wo) =>
        wo.status === 'Pending Review' ||
        wo.status === 'In Progress' ||
        wo.status === 'Pending Quarantine Review'
    );
  }, [workOrders]);

  // Helper para sa status badge color mapping
  const getStatusColor = (status: WorkOrder['status']): 'warning' | 'info' | 'error' | 'success' => {
    const colorMap: Record<WorkOrder['status'], 'warning' | 'info' | 'error' | 'success'> = {
      'Pending Review': 'warning',
      'In Progress': 'info',
      'Pending Quarantine Review': 'error',
      'Completed': 'success',
    };
    return colorMap[status] || 'info';
  };

  // Helper para sa calculation ng progress bar percentage
  const getStatusPercent = (status: WorkOrder['status']): number => {
    switch (status) {
      case 'Pending Review':
        return 10;
      case 'In Progress':
        return 55;
      case 'Pending Quarantine Review':
        return 75;
      case 'Completed':
        return 100;
      default:
        return 0;
    }
  };

  return {
    activeWorkOrders,
    getStatusColor,
    getStatusPercent,
  };
}