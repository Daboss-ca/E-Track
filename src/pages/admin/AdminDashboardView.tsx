import React from 'react';
import { ClipboardList, CheckCircle2, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import { useCapacityGuard } from '../../hooks/admin/useCapacityGuard';
import BarChartOne from '../../components/chart/BarGraph';
import GaugeChart from '../../components/chart/GaugeChart';
import Card from '../../components/Card/card';
import Badge from '../../components/ui/Badge/badge';
import Button from '../../components/ui/Button/button';

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

export function AdminDashboardView() {
  const { metrics, workflowData, rawCurrentWeight, maxCapacity } = useAdminDashboard();
  
  // Isinabay natin ang capacity hook sa iisang data source
  const capacity = useCapacityGuard(rawCurrentWeight, maxCapacity);

  const gaugeBadgeColor =
    capacity.percentage >= 90 ? 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-500/15 dark:text-red-400 dark:border-red-900/50' :
    capacity.percentage >= 80 ? 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-900/50' :
    capacity.percentage >= 50 ? 'bg-amber-50 text-amber-600 border border-amber-200 dark:bg-amber-500/15 dark:text-amber-400 dark:border-amber-900/50' :
    'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border-emerald-900/50';

  const dynamicCardStyle = 
    capacity.statusLevel === 'critical' 
      ? '!bg-red-50/40 !border-red-200 dark:!bg-red-950/20 dark:!border-red-900/50' 
      : capacity.statusLevel === 'warning'
      ? '!bg-amber-50/40 !border-amber-200 dark:!bg-amber-950/20 dark:!border-amber-900/50'
      : 'dark:!bg-white/[0.03]';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="solid" color="success" size="md">
            System Live
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            endIcon={<ArrowRight className="h-3.5 w-3.5" />}
            onClick={() => alert('Exporting summary report...')}
          >
            Generate Report
          </Button>
        </div>
      </div>

      {/* Global Alert Banner */}
      {capacity.statusLevel !== 'optimal' && (
        <div className={`p-4 rounded-xl border flex items-center gap-3 shadow-sm ${
          capacity.statusLevel === 'critical'
            ? 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/30 dark:border-red-900/50 dark:text-red-300'
            : 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-300'
        }`}>
          <ShieldAlert className="h-5 w-5 shrink-0" />
          <div className="text-sm">
            <span className="font-bold uppercase tracking-wide mr-2">Alert Indicator:</span>
            {capacity.alertMessage}
          </div>
        </div>
      )}

      {/* Overview Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total E-Waste Volume"
          value={metrics.totalEwasteVolume}
          icon={<Cpu className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />}
          accent="bg-emerald-50 dark:bg-emerald-500/10"
        />
        <MetricCard
          label="Active Disposal Requests"
          value={metrics.activeDisposalRequests}
          icon={<ClipboardList className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          accent="bg-blue-50 dark:bg-blue-500/10"
        />
        <MetricCard
          label="Completed Disposals"
          value={metrics.completedDisposals}
          icon={<CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />}
          accent="bg-indigo-50 dark:bg-indigo-500/10"
        />
        <MetricCard
          label="System Status"
          value={metrics.systemStatus}
          icon={<ShieldAlert className="h-4 w-4 text-amber-600 dark:text-amber-400" />}
          accent="bg-amber-50 dark:bg-amber-500/10"
        />
      </div>

      {/* Grid Section: Bar Chart Analytics & Capacity Guard Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task Workflow Pipeline Analytics Card */}
        <div className="lg:col-span-2">
          <Card
            className="dark:!bg-white/[0.03]"
            title="Task Workflow Pipeline Analytics"
            subtitle="Monitoring the progression of e-waste from approval stages down to final institutional disposal."
            action={
              <Badge variant="light" color="info" size="sm">
                Real-time Pipeline
              </Badge>
            }
          >
            <BarChartOne categories={workflowData.categories} seriesData={workflowData.seriesData} />
          </Card>
        </div>

        {/* Capacity Guard Monitoring Card */}
        <div className="lg:col-span-1">
          <Card
            className={dynamicCardStyle}
            title="Capacity Guard Monitoring"
            subtitle="Facility storage threshold tracker"
            action={
              <span className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold transition-colors duration-300 ${gaugeBadgeColor}`}>
                {capacity.statusBadgeText}
              </span>
            }
            footer={
              <div className="w-full flex items-center justify-between text-xs">
                <span>Current Load: <strong className="text-gray-800 dark:text-gray-200">{capacity.currentWeight} kg</strong></span>
                <span>Max Limit: <strong className="text-gray-800 dark:text-gray-200">{capacity.maxCapacity} kg</strong></span>
              </div>
            }
          >
            <div className="w-full py-4">
              <GaugeChart currentWeight={capacity.currentWeight} maxCapacity={capacity.maxCapacity} />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboardView;