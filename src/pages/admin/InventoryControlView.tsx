import { Search, Boxes, ShieldAlert, Weight } from 'lucide-react';
import { useInventoryControl } from '../../hooks/admin/useInventoryControl';
import Badge from '../../components/ui/Badge/badge';
import Card from '../../components/Card/card';
import { DataTable } from '../../components/ui/Table';
import type { DataTableColumn } from '../../components/ui/Table';

export function InventoryControlView() {
  const {
    items,
    searchTerm,
    setSearchTerm,
  } = useInventoryControl();

  const hazardousItems = items.filter((item) => item.category === 'Hazardous');

  const totalReturnItems = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const hazardousItemCount = hazardousItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalHazardousWeight = hazardousItems.reduce(
    (acc, item) => acc + ((item.weightKg || 0) * (item.quantity || 1)),
    0
  );

  const columns: DataTableColumn<typeof items[number]>[] = [
    {
      key: 'componentName',
      header: 'Component Name',
      dataType: 'identifier',
      pin: 'left',
      sortable: true,
      accessor: (item) => item.componentName,
      render: (item) => (
        <div>
          <p className="font-bold text-gray-900 dark:text-white">{item.componentName}</p>
          <span className="text-[11px] text-gray-400">
            Added: {item.dateAdded}
            {item.trackingCode ? ` • ${item.trackingCode}` : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Classification',
      dataType: 'text',
      sortable: true,
      accessor: (item) => item.category,
      render: (item) => (
        <Badge variant="light" size="sm" color="error">
          {item.category}
        </Badge>
      ),
    },
    {
      key: 'sourceDevice',
      header: 'Source Device',
      dataType: 'identifier',
      sortable: true,
      accessor: (item) => item.sourceDevice,
      render: (item) => (
        <div>
          <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{item.sourceDevice}</p>
          {item.ictCategory && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {item.ictCategory}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      dataType: 'numeric',
      sortable: true,
      accessor: (item) => item.quantity,
      render: (item) => (
        <span className="font-bold text-gray-900 dark:text-white font-mono">{item.quantity}</span>
      ),
    },
    {
      key: 'weightKg',
      header: 'Weight (kg)',
      dataType: 'numeric',
      sortable: true,
      accessor: (item) => item.weightKg,
      render: (item) => (
        <span className="font-mono text-gray-800 dark:text-gray-200">{item.weightKg.toFixed(2)} kg</span>
      ),
    },
    {
      key: 'dismantledBy',
      header: 'Dismantled By',
      dataType: 'text',
      sortable: true,
      accessor: (item) => item.dismantledBy,
      render: (item) => (
        <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {item.dismantledBy}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Title & Plain Search Bar*/}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">E-Waste Inventory Control</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Monitor and track hazardous e-waste components and materials securely.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search hazardous component, device..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-9 pr-4 text-xs text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:outline-none dark:border-gray-800 dark:bg-gray-900 dark:text-gray-200 shadow-sm"
          />
        </div>
      </div>

      {/* KPI Summary Cards*/}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <div className="w-full flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">No. of Return Items</span>
            <span className="rounded-xl p-2.5 bg-emerald-50 dark:bg-emerald-500/10">
              <Boxes className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </span>
          </div>
          <div className="w-full text-left mt-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalReturnItems} Items</p>
          </div>
        </Card>

        <Card>
          <div className="w-full flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">No. of Hazardous Items</span>
            <span className="rounded-xl p-2.5 bg-red-50 dark:bg-red-500/10">
              <ShieldAlert className="h-5 w-5 text-red-600 dark:text-red-400" />
            </span>
          </div>
          <div className="w-full text-left mt-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{hazardousItemCount} Items</p>
          </div>
        </Card>

        <Card>
          <div className="w-full flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Hazardous Weight</span>
            <span className="rounded-xl p-2.5 bg-amber-50 dark:bg-amber-500/10">
              <Weight className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </span>
          </div>
          <div className="w-full text-left mt-3">
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalHazardousWeight.toFixed(2)} kg</p>
          </div>
        </Card>
      </div>

      {/* Master Inventory DataTable Layout (Hazardous Only) */}
      <DataTable
        columns={columns}
        data={hazardousItems}
        getRowId={(item) => item.id}
        density="default"
        emptyMessage="No hazardous inventory records found."
      />
    </div>
  );
}

export default InventoryControlView;