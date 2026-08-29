import React from 'react';
import {
  ClipboardList,
  CheckCircle2,
  ShieldAlert,
  Timer,
  ArrowRight,
  ListChecks,
} from 'lucide-react';
import Button from '../../components/ui/Button/button';
import Badge from '../../components/ui/Badge/badge';
import type { DashboardMetrics, WorkOrder } from '../../types/segregator/segregator.types';
import { useDashboardView } from '../../hooks/segregator/useDashboardView';

export interface DashboardViewProps {
  metrics: DashboardMetrics;
  workOrders: WorkOrder[];
  onGoToWorkQueue: () => void;
  onGoToLogs: () => void;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  accent: string;
}

function MetricCard({ label, value, icon, accent }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</span>
        <span className={`rounded-lg p-2 ${accent}`}>{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">{value}</p>
    </div>
  );
}

export function DashboardView({ metrics, workOrders, onGoToWorkQueue, onGoToLogs }: DashboardViewProps) {
  const { activeWorkOrders, getStatusColor, getStatusPercent } = useDashboardView({ workOrders });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Dashboard</h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Active Assigned Tasks"
          value={metrics.activeAssignedTasks}
          icon={<ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          accent="bg-blue-50 dark:bg-blue-500/10"
        />
        <MetricCard
          label="Completed Today"
          value={metrics.completedToday}
          icon={<CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          accent="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <MetricCard
          label="Total Quarantined Items"
          value={metrics.totalQuarantined}
          icon={<ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />}
          accent="bg-red-50 dark:bg-red-500/10"
        />
        <MetricCard
          label="Total Processing Time"
          value={`${metrics.totalProcessingTimeMinutes}m`}
          icon={<Timer className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          accent="bg-amber-50 dark:bg-amber-500/10"
        />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Workflow Status</h2>
          <Button
            variant="outline"
            size="sm"
            className="border-none shadow-none hover:bg-gray-100 dark:hover:bg-white/5"
            endIcon={<ArrowRight className="h-3.5 w-3.5" />}
            onClick={onGoToWorkQueue}
          >
            Open Work Queue
          </Button>
        </div>

        {activeWorkOrders.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No active work orders right now. New assignments from the Supply Office will appear here.
          </p>
        ) : (
          <ul className="space-y-4">
            {activeWorkOrders.map((wo) => {
              const percent = getStatusPercent(wo.status);
              return (
                <li key={wo.id}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-200">{wo.deviceName}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{wo.referenceCode}</p>
                    </div>
                    <Badge color={getStatusColor(wo.status)} size="sm">
                      {wo.status}
                    </Badge>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-white/[0.06]">
                    <div
                      className={[
                        'h-full rounded-full transition-all',
                        wo.status === 'Pending Quarantine Review' ? 'bg-red-500' : 'bg-emerald-500',
                      ].join(' ')}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <button
          onClick={onGoToWorkQueue}
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-emerald-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-emerald-700"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Go to Work Queue</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Review and start assigned dismantling sessions</p>
          </div>
          <ListChecks className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </button>

        <button
          onClick={onGoToLogs}
          className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-5 text-left shadow-sm transition-colors hover:border-red-300 dark:border-gray-800 dark:bg-white/[0.03] dark:hover:border-red-700"
        >
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">View Quarantine Log</p>
            <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">Check completed and quarantined items</p>
          </div>
          <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
}