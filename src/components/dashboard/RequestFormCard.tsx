// src/components/dashboard/RequestFormCard.tsx
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
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-white/[0.03] sm:p-6">
      <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
        Request Details
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-theme-xs font-medium text-gray-500 dark:text-gray-400">
            Item Name
          </label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => onItemNameChange(e.target.value)}
            placeholder="e.g. Dell OptiPlex Desktop Unit"
            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-theme-sm text-gray-800 placeholder:text-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-800 dark:text-white/90 dark:placeholder:text-gray-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-theme-xs font-medium text-gray-500 dark:text-gray-400">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as EquipmentCategory)}
            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-theme-sm text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-800 dark:bg-gray-900 dark:text-white/90"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c} className="bg-white text-gray-800 dark:bg-gray-900 dark:text-white">
                {c}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-theme-xs font-medium text-gray-500 dark:text-gray-400">
            Department Code
          </label>
          <input
            type="text"
            value={departmentCode}
            disabled
            className="w-full cursor-not-allowed rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-theme-sm text-gray-400 dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-500"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-theme-xs font-medium text-gray-500 dark:text-gray-400">
            Date
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-transparent px-3 py-2 text-theme-sm text-gray-800 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 dark:border-gray-800 dark:text-white/90 [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>
      </div>

      {/* Tracking Code Preview Area */}
      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-gray-100 bg-gray-50/60 p-3 dark:border-gray-800 dark:bg-white/[0.02]">
        <Tag className="h-4 w-4 text-emerald-600 dark:text-emerald-500" strokeWidth={1.75} />
        <span className="text-theme-xs text-gray-500 dark:text-gray-400">
          Tracking Code Preview:
        </span>
        <Badge color="success" variant="light" size="sm">
          {trackingCodePreview}
        </Badge>
      </div>
    </section>
  );
};