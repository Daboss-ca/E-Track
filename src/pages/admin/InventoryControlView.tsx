import React from 'react';
import { Search, Boxes, ShieldAlert, RefreshCw, Cpu, Layers } from 'lucide-react';
import { useInventoryControl } from '../../hooks/admin/useInventoryControl';
import Badge from '../../components/ui/Badge/badge';

export function InventoryControlView() {
  const {
    items,
    summary,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
  } = useInventoryControl();

  const categories = ['All', 'Hazardous', 'Reusable', 'Recyclable'];

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">E-Waste Inventory Control</h1>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="solid" color="success" size="md" startIcon={<RefreshCw className="h-3.5 w-3.5 animate-spin" />}>
            Supabase Realtime Sync Active
          </Badge>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Component Weight</span>
            <span className="rounded-lg p-2 bg-emerald-50 dark:bg-emerald-500/10">
              <Boxes className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">{summary.totalWeight} kg</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Hazardous Parts</span>
            <span className="rounded-lg p-2 bg-red-50 dark:bg-red-500/10">
              <ShieldAlert className="h-4 w-4 text-red-600 dark:text-red-400" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">{summary.hazardousCount} Items</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Reusable Parts</span>
            <span className="rounded-lg p-2 bg-blue-50 dark:bg-blue-500/10">
              <Cpu className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">{summary.reusableCount} Items</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Recyclable Parts</span>
            <span className="rounded-lg p-2 bg-indigo-50 dark:bg-indigo-500/10">
              <Layers className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            </span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-gray-900 dark:text-gray-100">{summary.recyclableCount} Items</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search component, source device, or worker..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-xs text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-200 dark:focus:bg-transparent"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={[
                  'px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors cursor-pointer whitespace-nowrap',
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700',
                ].join(' ')}
              >
                {cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Master Inventory Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-bold">Component Name</th>
                <th className="px-6 py-4 font-bold">Classification</th>
                <th className="px-6 py-4 font-bold">Source Device</th>
                <th className="px-6 py-4 font-bold">Quantity & Weight</th>
                <th className="px-6 py-4 font-bold">Dismantled By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-gray-400 italic">
                    No inventory records match your filter criteria.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 dark:text-white">{item.componentName}</p>
                      <span className="text-[11px] text-gray-400">Added: {item.dateAdded}</span>
                    </td>

                    <td className="px-6 py-4">
                      <Badge
                        variant="light"
                        size="sm"
                        color={
                          item.category === 'Hazardous'
                            ? 'error'
                            : item.category === 'Reusable'
                            ? 'info'
                            : 'success'
                        }
                      >
                        {item.category}
                      </Badge>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-gray-800 dark:text-gray-200">{item.sourceDevice}</p>
                    </td>

                    <td className="px-6 py-4 font-mono text-xs">
                      <span className="font-bold text-gray-900 dark:text-white">{item.quantity} pcs</span>
                      <span className="text-gray-400 ml-1.5">({item.weightKg} kg/pc)</span>
                    </td>

                    <td className="px-6 py-4 text-xs font-medium text-gray-700 dark:text-gray-300">
                      {item.dismantledBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default InventoryControlView;