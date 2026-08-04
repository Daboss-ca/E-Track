import { useState } from 'react';

export interface EWasteRequest {
  id: string;
  trackingCode: string;
  itemType: string;
  category: string;
  quantity: number;
  dateSubmitted: string;
  status: 'Pending' | 'In Progress' | 'Completed';
}

export function useUserDashboard() {
  const [stats] = useState({
    pending: 2,
    inProgress: 1,
    completed: 5,
  });
  
  const [recentRequests] = useState<EWasteRequest[]>([
    { id: '1', trackingCode: 'EWR-CCS-2026-0046', itemType: 'Desktop Monitor', category: 'IT Equipment', quantity: 1, dateSubmitted: '2026-06-01', status: 'Pending' },
    { id: '2', trackingCode: 'EWR-CCS-2026-0042', itemType: 'System Unit / CPU', category: 'IT Equipment', quantity: 2, dateSubmitted: '2026-05-28', status: 'In Progress' },
    { id: '3', trackingCode: 'EWR-CCS-2026-0035', itemType: 'Network Switch', category: 'Networking', quantity: 1, dateSubmitted: '2026-05-20', status: 'Completed' },
  ]);

  const [loading] = useState(false);

  return {
    stats,
    recentRequests,
    loading,
  };
}