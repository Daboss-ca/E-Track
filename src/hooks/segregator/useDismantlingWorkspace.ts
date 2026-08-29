import { useState, useMemo } from 'react';
import type {
  DismantlingSessionLog,
  WorkOrder,
} from '../../types/segregator/segregator.types';

export interface ItemCardOption {
  id: string;
  name: string;
  type: 'high' | 'low';
  illustrationType: 'cpu' | 'laptop' | 'printer' | 'scanner' | 'server' | 'smartboard' | 'keyboard' | 'monitor' | 'ups' | 'router' | 'cable';
}

const itemCardsList: ItemCardOption[] = [
  // High Items
  { id: 'high-1', name: 'Desktop Computer Systems (CPU Unit)', type: 'high', illustrationType: 'cpu' },
  { id: 'high-2', name: 'Laptops & Notebooks', type: 'high', illustrationType: 'laptop' },
  { id: 'high-3', name: 'Printers', type: 'high', illustrationType: 'printer' },
  { id: 'high-4', name: 'Multi-Function Scanners', type: 'high', illustrationType: 'scanner' },
  { id: 'high-5', name: 'Servers & Network Racks', type: 'high', illustrationType: 'server' },
  { id: 'high-6', name: 'Smartboards & Interactive Flat Panels', type: 'high', illustrationType: 'smartboard' },

  // Low Items
  { id: 'low-1', name: 'Keyboards & Computer Mice', type: 'low', illustrationType: 'keyboard' },
  { id: 'low-2', name: 'Computer Monitors & LCD Screens', type: 'low', illustrationType: 'monitor' },
  { id: 'low-3', name: 'Uninterruptible Power Supplies (UPS)', type: 'low', illustrationType: 'ups' },
  { id: 'low-4', name: 'Network Switches, Hubs & Routers', type: 'low', illustrationType: 'router' },
  { id: 'low-5', name: 'Cables, Wires & Power Adapters', type: 'low', illustrationType: 'cable' },
];

export interface UseDismantlingWorkspaceParams {
  workOrder: WorkOrder;
  onExit: (log: DismantlingSessionLog) => void;
}

export function useDismantlingWorkspace({ workOrder, onExit }: UseDismantlingWorkspaceParams) {
  const [activeTab, setActiveTab] = useState<'high' | 'low'>('high');

  const currentItems = useMemo(() => {
    return itemCardsList.filter((item) => item.type === activeTab);
  }, [activeTab]);

  const handleBackToReview = () => {
    const dummyLog: DismantlingSessionLog = {
      workOrderId: workOrder.id,
      durationSeconds: 0,
      formattedTime: '00:00',
      completedAt: new Date().toISOString(),
      components: [],
      classificationSummary: { Hazardous: 0, Reusable: 0, Recyclable: 0 },
      status: 'in-progress',
      remarks: 'Returned to review page',
    };
    onExit(dummyLog);
  };

  return {
    activeTab,
    setActiveTab,
    currentItems,
    handleBackToReview,
  };
}