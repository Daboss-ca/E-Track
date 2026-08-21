import React from 'react';
import { Tag } from 'lucide-react';
import type { EquipmentCategory } from '../../types/app';
import Badge from '../ui/Badge/badge';

const CATEGORY_OPTIONS: EquipmentCategory[] = [
  'IT Equipment',
  'Peripherals',
  'Networking',
  'Audio/Visual',
  'Appliances',
  'Furniture',
  'Other',
];

interface Props {
  itemName: string;
  category: EquipmentCategory;
  departmentCode: string;
  date: string;
  trackingCodePreview: string;
  onItemNameChange: (val: string) => void;
  onCategoryChange: (val: EquipmentCategory) => void;
  onDateChange: (val: string) => void;
}

export const RequestFormCard: React.FC<Props> = ({
  itemName,
  category,
  departmentCode,
  date,
  trackingCodePreview,
  onItemNameChange,
  onCategoryChange,
  onDateChange,
}) => {
  return (
    // Inayos ang dark:bg sa dark:bg-white/[0.03] (o dark:bg-gray-dark) para pantay sa Equipment Details
    <section className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 transition-all">
      <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
        Request Details
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Item Name
          </label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => onItemNameChange(e.target.value)}
            placeholder="e.g. Dell OptiPlex Desktop Unit"
            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-800 dark:text-white dark:placeholder:text-gray-500 transition-all"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as EquipmentCategory)}
            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white transition-all cursor-pointer"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c} className="bg-white text-gray-800 dark:bg-gray-900 dark:text-white">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Department Code
          </label>
          <input
            type="text"
            value={departmentCode}
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50/80 px-3 py-2 text-sm text-gray-400 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-sm text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-800 dark:text-white [color-scheme:light] dark:[color-scheme:dark] transition-all"
          />
        </div>
      </div>

      {/* Tracking Code Preview Inner Box */}
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-gray-100 bg-gray-50/70 p-3.5 dark:border-gray-800/60 dark:bg-white/[0.02]">
        <div className="flex items-center gap-2.5">
          <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} />
          <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
            Tracking Code Preview:
          </span>
        </div>
        <Badge color="success" variant="light" size="sm">
          {trackingCodePreview}
        </Badge>
      </div>
    </section>
  );
};