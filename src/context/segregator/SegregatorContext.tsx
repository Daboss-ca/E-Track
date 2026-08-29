// src/context/segregator/SegregatorContext.tsx
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type {
  DashboardMetrics,
  DismantlingSessionLog,
  WorkOrder,
  WorkOrderStatus,
} from '../../types/segregator/segregator.types';
import { initialWorkOrders } from '../../data/mockSegregatorData';

interface SegregatorContextValue {
  workOrders: WorkOrder[];
  logs: DismantlingSessionLog[];
  metrics: DashboardMetrics;
  setWorkOrderStatus: (workOrderId: string, status: WorkOrderStatus) => void;
  recordSessionLog: (log: DismantlingSessionLog) => void;
}

const SegregatorContext = createContext<SegregatorContextValue | undefined>(undefined);

function isSameDay(isoA: string, isoB: string): boolean {
  return new Date(isoA).toDateString() === new Date(isoB).toDateString();
}

export function SegregatorProvider({ children }: { children: React.ReactNode }) {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>(initialWorkOrders);
  const [logs, setLogs] = useState<DismantlingSessionLog[]>([]);

  const setWorkOrderStatus = useCallback((workOrderId: string, status: WorkOrderStatus) => {
    setWorkOrders((prev) => prev.map((wo) => (wo.id === workOrderId ? { ...wo, status } : wo)));
  }, []);

  const recordSessionLog = useCallback((log: DismantlingSessionLog) => {
    setLogs((prev) => [log, ...prev]);
  }, []);

  const metrics: DashboardMetrics = useMemo(() => {
    const now = new Date().toISOString();
    const activeAssignedTasks = workOrders.filter(
      (wo) => wo.status === 'Pending Review' || wo.status === 'In Progress'
    ).length;
    const completedToday = logs.filter(
      (log) => log.outcome === 'Segregated' && isSameDay(log.completedAt, now)
    ).length;
    const totalQuarantined = logs.filter((log) => log.outcome === 'Quarantined').length;
    const totalProcessingTimeMinutes = Math.round(
      logs.reduce((sum, log) => sum + log.durationSeconds, 0) / 60
    );

    return { activeAssignedTasks, completedToday, totalQuarantined, totalProcessingTimeMinutes };
  }, [workOrders, logs]);

  const value: SegregatorContextValue = {
    workOrders,
    logs,
    metrics,
    setWorkOrderStatus,
    recordSessionLog,
  };

  return <SegregatorContext.Provider value={value}>{children}</SegregatorContext.Provider>;
}

export function useSegregatorContext(): SegregatorContextValue {
  const ctx = useContext(SegregatorContext);
  if (!ctx) {
    throw new Error('useSegregatorContext must be used within a SegregatorProvider');
  }
  return ctx;
}