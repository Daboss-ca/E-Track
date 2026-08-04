import React from 'react';
import { Tag } from 'lucide-react';
import type { EquipmentCategory } from '../../types/app';

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
    <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <h2 className="mb-4 text-[14px] font-semibold text-gray-800">Request Details</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-gray-500">Item Name</label>
          <input
            type="text"
            value={itemName}
            onChange={(e) => onItemNameChange(e.target.value)}
            placeholder="e.g. Dell OptiPlex Desktop Unit"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] text-gray-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-gray-500">Category</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value as EquipmentCategory)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-[13px] text-gray-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-gray-500">Department Code</label>
          <input
            type="text"
            value={departmentCode}
            disabled
            className="w-full cursor-not-allowed rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-[13px] text-gray-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-[12px] font-medium text-gray-500">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-[13px] text-gray-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 px-4 py-2.5">
        <Tag className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />
        <span className="text-[12px] text-gray-500">Tracking Code Preview:</span>
        <span className="rounded-md bg-white px-2 py-0.5 text-[12.5px] font-semibold text-gray-800 ring-1 ring-gray-200">
          {trackingCodePreview}
        </span>
      </div>
    </section>
  );
};