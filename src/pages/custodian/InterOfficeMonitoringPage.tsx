import {
  Package,
  Wrench,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Badge from '../../components/ui/Badge/badge';
import { DataTable } from '../../components/ui/Table';
import type { DataTableColumn } from '../../components/ui/Table';
import { useInterOfficeTracking, type TrackedItem } from '../../hooks/custodian/useInterOfficeTracking';

export function InterOfficeMonitoringPage() {
  const { trackedItems, loading,} = useInterOfficeTracking();

  const pendingCount = trackedItems.filter((item) => item.status === 'pending_supply').length;
  const dismantlingCount = trackedItems.filter((item) => item.status === 'dismantling').length;

  const columns: DataTableColumn<TrackedItem>[] = [
    {
      key: 'property_number',
      header: 'Property / Tag No.',
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
              <Badge
                variant="light"
                color="warning"
                size="sm"
                startIcon={<Package className="w-3.5 h-3.5" />}
              >
                Pending at Custodian
              </Badge>
            );
          case 'dismantling':
            return (
              <Badge
                variant="light"
                color="info"
                size="sm"
                startIcon={<Wrench className="w-3.5 h-3.5" />}
              >
                Forwarded to Admin
              </Badge>
            );
          case 'completed':
            return (
              <Badge
                variant="light"
                color="success"
                size="sm"
                startIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
              >
                Approved by Admin
              </Badge>
            );
          default:
            return (
              <Badge
                variant="light"
                color="light"
                size="sm"
                startIcon={<AlertCircle className="w-3.5 h-3.5" />}
              >
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
            Track return slips from end-user submission to custodian validation and admin approval.
          </p>
        </div>
      </div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Pending at Custodian
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {loading ? '-' : pendingCount}
            </p>
          </div>
          <div className="h-12 w-12 bg-amber-50 dark:bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600 dark:text-amber-400">
            <Package className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Forwarded to Admin
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mt-1">
              {loading ? '-' : dismantlingCount}
            </p>
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
            Active Return Slip Workflow Queue
          </h2>
        </div>

        <DataTable
          columns={columns}
          data={trackedItems}
          getRowId={(item) => item.id}
          density="default"
          isLoading={loading}
          emptyMessage="No return slips found in the workflow."
        />
      </div>
    </div>
  );
}

export default InterOfficeMonitoringPage;