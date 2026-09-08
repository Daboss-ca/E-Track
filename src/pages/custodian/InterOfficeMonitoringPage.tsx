import { 
  Activity, 
  RefreshCw, 
  Package, 
  Wrench, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react';
import Badge from '../../components/ui/Badge/badge';
import { DataTable } from '../../components/ui/Table';
import type { DataTableColumn } from '../../components/ui/Table';
import { useInterOfficeTracking, type TrackedItem } from '../../hooks/custodian/useInterOfficeTracking';

export function InterOfficeMonitoringPage() {
  const { trackedItems, loading, isLive, refreshData } = useInterOfficeTracking();

  const pendingCount = trackedItems.filter(item => item.status === 'pending_supply').length;
  const dismantlingCount = trackedItems.filter(item => item.status === 'dismantling').length;

  // DataTable Columns
  const columns: DataTableColumn<TrackedItem>[] = [
    {
      key: 'property_number',
      header: 'Property No.',
      dataType: 'identifier',
      pin: 'left',
      minWidth: '160px',
      sortable: true,
      accessor: (item) => item.property_number,
      render: (item) => (
        <span className="font-bold font-mono text-gray-900 dark:text-white">
          {item.property_number}
        </span>
      ),
    },
    {
      key: 'item_name',
      header: 'Item Description',
      dataType: 'text',
      minWidth: '220px',
      sortable: true,
      accessor: (item) => item.item_name,
      render: (item) => (
        <span className="font-medium text-gray-800 dark:text-gray-200">
          {item.item_name}
        </span>
      ),
    },
    {
      key: 'office_origin',
      header: 'Originating Office',
      dataType: 'text',
      minWidth: '180px',
      sortable: true,
      accessor: (item) => item.office_origin,
      render: (item) => (
        <span className="text-gray-600 dark:text-gray-400">
          {item.office_origin}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Workflow Status',
      dataType: 'text',
      minWidth: '190px',
      sortable: true,
      accessor: (item) => item.status,
      render: (item) => {
        switch (item.status) {
          case 'pending_supply':
            return (
              <Badge variant="light" color="warning" size="sm" startIcon={<Package className="w-3.5 h-3.5" />}>
                Pending at Supply
              </Badge>
            );
          case 'dismantling':
            return (
              <Badge variant="light" color="info" size="sm" startIcon={<Wrench className="w-3.5 h-3.5" />}>
                Dismantling in Progress
              </Badge>
            );
          case 'completed':
            return (
              <Badge variant="light" color="success" size="sm" startIcon={<CheckCircle2 className="w-3.5 h-3.5" />}>
                Disposal Completed
              </Badge>
            );
          default:
            return (
              <Badge variant="light" color="light" size="sm" startIcon={<AlertCircle className="w-3.5 h-3.5" />}>
                Unknown
              </Badge>
            );
        }
      },
    },
    {
      key: 'updated_at',
      header: 'Last Updated',
      dataType: 'identifier',
      minWidth: '160px',
      sortable: true,
      accessor: (item) => item.updated_at,
      render: (item) => (
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
          {new Date(item.updated_at).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6 font-sans antialiased">
      {/* Header Row */}
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Status Monitoring
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Track return slips and equipment disposal progress in real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex items-center px-3 py-1.5 rounded-full text-xs font-medium border ${isLive ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400' : 'bg-gray-50 dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-500'}`}>
            {isLive ? (
              <>
                <span className="relative flex h-2.5 w-2.5 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                Live Sync Active
              </>
            ) : (
              <>
                <Activity className="w-3.5 h-3.5 mr-1.5" />
                Connecting...
              </>
            )}
          </div>

          <button 
            onClick={refreshData}
            disabled={loading}
            className="p-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            title="Manual Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Pending at Supply</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{loading ? '-' : pendingCount}</p>
          </div>
          <div className="h-12 w-12 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Package className="h-6 w-6" />
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Currently Dismantling</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">{loading ? '-' : dismantlingCount}</p>
          </div>
          <div className="h-12 w-12 bg-blue-50 dark:bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Wrench className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Active Disposal Queue Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">
            Active Disposal Workflow Queue
          </h2>
        </div>

        <DataTable
          columns={columns}
          data={trackedItems}
          getRowId={(item) => item.id}
          density="default"
          isLoading={loading}
          emptyMessage="No pending or active dismantling tasks found."
        />
      </div>
    </div>
  );
}

export default InterOfficeMonitoringPage;