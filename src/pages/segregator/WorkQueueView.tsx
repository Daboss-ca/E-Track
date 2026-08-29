import { useState, useMemo } from 'react';
import { Hash, Eye, Search, Filter } from 'lucide-react';
import Button from '../../components/ui/Button/button';
import Badge from '../../components/ui/Badge/badge';
import type { WorkOrder } from '../../types/segregator/segregator.types';

export interface WorkQueueViewProps {
  workOrders: WorkOrder[];
  onReview: (workOrder: WorkOrder) => void;
}

type FilterStatus = 'all' | 'Pending Review' | 'In Progress';

function WorkOrderStatusBadge({ status }: { status: WorkOrder['status'] }) {
  const isPending = status === 'Pending Review' || status === 'Pending Quarantine Review';
  const label = isPending ? 'Pending' : 'In Progress';
  const color = isPending ? 'warning' : 'info';

  return <Badge color={color} size="sm">{label}</Badge>;
}

function WorkOrderCard({ workOrder, onReview }: { workOrder: WorkOrder; onReview: (wo: WorkOrder) => void }) {
  const isActionable = workOrder.status === 'Pending Review' || workOrder.status === 'In Progress';

  return (
    <div className="flex flex-col justify-between rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-gray-800 dark:bg-white/[0.03]">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-gray-900 dark:text-gray-100">{workOrder.deviceName}</p>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
              <Hash className="h-3 w-3" />
              <span className="font-mono">{workOrder.referenceCode}</span>
            </div>
          </div>
          <WorkOrderStatusBadge status={workOrder.status} />
        </div>
      </div>

      <div className="mt-6 flex justify-end border-t border-gray-100 pt-3 dark:border-gray-800">
        <Button
          variant={isActionable ? 'primary' : 'outline'}
          size="sm"
          startIcon={<Eye className="h-3.5 w-3.5" />}
          onClick={() => onReview(workOrder)}
        >
          {workOrder.status === 'In Progress' ? 'Continue' : 'Review'}
        </Button>
      </div>
    </div>
  );
}

export function WorkQueueView({ workOrders, onReview }: WorkQueueViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterStatus>('all');

  const filteredWorkOrders = useMemo(() => {
    return workOrders.filter((wo) => {
      if (wo.status === 'Completed') return false;

      const matchesSearch =
        wo.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.referenceCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        wo.sourceDepartment.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === 'all'
          ? true
          : statusFilter === 'Pending Review'
          ? wo.status === 'Pending Review' || wo.status === 'Pending Quarantine Review'
          : wo.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [workOrders, searchTerm, statusFilter]);

  const counts = useMemo(() => {
    const activeList = workOrders.filter((w) => w.status !== 'Completed');
    return {
      all: activeList.length,
      pending: activeList.filter((w) => w.status === 'Pending Review' || w.status === 'Pending Quarantine Review').length,
      inProgress: activeList.filter((w) => w.status === 'In Progress').length,
    };
  }, [workOrders]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Assigned Work Queue</h1>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search device, code, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-xs text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-200"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-800 dark:bg-white/[0.03]">
          <button
            onClick={() => setStatusFilter('all')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-emerald-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
            }`}
          >
            All ({counts.all})
          </button>
          <button
            onClick={() => setStatusFilter('Pending Review')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === 'Pending Review'
                ? 'bg-amber-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
            }`}
          >
            Pending ({counts.pending})
          </button>
          <button
            onClick={() => setStatusFilter('In Progress')}
            className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
              statusFilter === 'In Progress'
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5'
            }`}
          >
            In Progress ({counts.inProgress})
          </button>
        </div>
      </div>

      {filteredWorkOrders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-gray-700 dark:bg-white/[0.02]">
          <Filter className="mx-auto h-6 w-6 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">No matching work orders found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredWorkOrders.map((wo) => (
            <WorkOrderCard key={wo.id} workOrder={wo} onReview={onReview} />
          ))}
        </div>
      )}
    </div>
  );
}