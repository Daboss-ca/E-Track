import React from 'react';
import { ClipboardList, CheckCircle2, ShieldAlert, Cpu, ArrowRight } from 'lucide-react';
import { useAdminDashboard } from '../../hooks/admin/useAdminDashboard';
import BarChartOne from '../../components/chart/BarGraph';
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
  const { metrics, workflowData } = useAdminDashboard();

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

      {/* Visual Analytics Bar Graph Card */}
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Task Workflow Pipeline Analytics</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Monitoring the progression of e-waste from approval stages down to final institutional disposal.
            </p>
          </div>
          <Badge variant="light" color="info" size="sm">
            Real-time Pipeline
          </Badge>
        </div>

        <BarChartOne categories={workflowData.categories} seriesData={workflowData.seriesData} />
      </div>
    </div>
  );
}

export default AdminDashboardView;