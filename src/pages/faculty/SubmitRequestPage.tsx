// src/pages/faculty/SubmitRequestPage.tsx
import React, { useState } from 'react';
import { Eye, Send, Trash2, Plus, X } from 'lucide-react';
import Sidebar from '../../components/layouts/Sidebar';
import TopHeader from '../../components/layouts/TopBar';
import FileDropzone from '../../components/ui/fileDropzone';
import { useEWasteForm } from '../../hooks/useEWasteForm';
import { RequestFormCard } from '../../components/dashboard/RequestFormCard';
import type { EquipmentCategory, UserRole } from '../../types/app';

const CATEGORY_OPTIONS: EquipmentCategory[] = [
  'IT Equipment',
  'Peripherals',
  'Networking',
  'Audio/Visual',
  'Appliances',
  'Furniture',
  'Other',
];

interface SubmitRequestPageProps {
  currentNav?: string;
  onNavigate: (view: string) => void;
}

const SubmitRequestPage: React.FC<SubmitRequestPageProps> = ({ currentNav, onNavigate }) => {
  const activeNav = currentNav || 'requests-new';
  
  const [role, setRole] = useState<UserRole>('Faculty');
  const [headerSearch, setHeaderSearch] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const { formState, setters, actions, departmentCode } = useEWasteForm();

  const handleFinalSubmit = () => {
    const isSuccess = actions.submitRequest();
    if (isSuccess) {
      setShowPreview(false);
    }
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white">
      <div className="h-full shrink-0">
        <Sidebar
          activeId={activeNav}
          onNavigate={onNavigate}
          userName="Miguel Santos"
          userRole={`${role} · ${departmentCode}`}
          onOpenSettings={() => setShowSettings(true)}
          onLogout={() => window.alert('Logged out')}
        />
      </div>

      <div className="flex h-full min-w-0 flex-1 flex-col bg-[#F3F4F6] overflow-hidden">
        <div className="shrink-0">
          <TopHeader
            searchValue={headerSearch}
            onSearchChange={setHeaderSearch}
            notifications={[]}
            onMarkAllRead={() => {}}
            currentRole={role}
            onRoleChange={setRole}
            userName="Miguel Santos"
          />
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[22px] font-bold text-gray-900">Submit E-Waste Request</h1>
              <p className="mt-0.5 text-[13px] text-gray-400">
                Log obsolete or non-functioning equipment for pickup and disposal.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2.5 text-[13px] font-medium text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <Eye className="h-4 w-4" strokeWidth={1.75} />
                Preview Request
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="flex items-center gap-1.5 rounded-lg bg-gray-900 px-4 py-2.5 text-[13px] font-medium text-white hover:bg-gray-800 transition-colors"
              >
                <Send className="h-4 w-4" strokeWidth={1.75} />
                Submit Request
              </button>
            </div>
          </div>

          {formState.submitError && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-2.5 text-[12.5px] text-red-600">
              {formState.submitError}
            </div>
          )}

          <RequestFormCard
            itemName={formState.itemName}
            category={formState.category}
            departmentCode={departmentCode}
            date={formState.date}
            trackingCodePreview={formState.trackingCodePreview}
            onItemNameChange={setters.setItemName}
            onCategoryChange={setters.setCategory}
            onDateChange={setters.setDate}
          />

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-[14px] font-semibold text-gray-800">Equipment Details</h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[11.5px] uppercase tracking-wide text-gray-400">
                    <th className="w-10 py-2 font-medium">No.</th>
                    <th className="py-2 font-medium">Description</th>
                    <th className="w-24 py-2 font-medium">Qty</th>
                    <th className="w-44 py-2 font-medium">Category</th>
                    <th className="w-16 py-2 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {formState.equipmentItems.map((row, idx) => (
                    <tr key={row.id} className="border-b border-gray-50">
                      <td className="py-2.5 text-gray-400">{idx + 1}</td>
                      <td className="py-2.5 pr-3">
                        <input
                          type="text"
                          value={row.description}
                          onChange={(e) => actions.updateEquipmentRow(row.id, { description: e.target.value })}
                          placeholder="Describe the item"
                          className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-[13px] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </td>
                      <td className="py-2.5 pr-3">
                        <input
                          type="number"
                          min={1}
                          value={row.quantity}
                          onChange={(e) =>
                            actions.updateEquipmentRow(row.id, { quantity: Math.max(1, Number(e.target.value)) })
                          }
                          className="w-full rounded-lg border border-gray-200 px-2.5 py-2 text-[13px] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </td>
                      <td className="py-2.5 pr-3">
                        <select
                          value={row.category}
                          onChange={(e) =>
                            actions.updateEquipmentRow(row.id, { category: e.target.value as EquipmentCategory })
                          }
                          className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-2 text-[13px] focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        >
                          {CATEGORY_OPTIONS.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-2.5">
                        <button
                          type="button"
                          onClick={() => actions.removeEquipmentRow(row.id)}
                          disabled={formState.equipmentItems.length === 1}
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button
              type="button"
              onClick={actions.addEquipmentRow}
              className="mt-3 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[12.5px] font-medium text-emerald-600 hover:bg-emerald-50 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2} />
              Add Equipment Item
            </button>
          </section>

          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <h3 className="mb-3 text-[13px] font-semibold text-gray-800">Photo Documentation</h3>
            <FileDropzone files={formState.photos} onFilesChange={setters.setPhotos} />
          </section>
        </main>
      </div>

      {showPreview && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-900">Preview Request</h3>
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="text-gray-300 hover:text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <dl className="space-y-2.5 text-[13px]">
              <div className="flex justify-between">
                <dt className="text-gray-400">Item Name</dt>
                <dd className="font-medium text-gray-800">{formState.itemName || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Category</dt>
                <dd className="font-medium text-gray-800">{formState.category}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Department</dt>
                <dd className="font-medium text-gray-800">{departmentCode}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Date</dt>
                <dd className="font-medium text-gray-800">{formState.date || '—'}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-400">Tracking Code</dt>
                <dd className="font-medium text-gray-800">{formState.trackingCodePreview}</dd>
              </div>
            </dl>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPreview(false)}
                className="rounded-lg border border-gray-200 px-4 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-gray-800"
              >
                Confirm &amp; Submit
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-[16px] font-bold text-gray-900">Settings</h3>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="text-gray-300 hover:text-gray-500"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[13px] text-gray-500">
              Notification preferences, default department, and account details will appear here.
            </p>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                className="rounded-lg bg-gray-900 px-4 py-2 text-[13px] font-medium text-white hover:bg-gray-800"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitRequestPage;