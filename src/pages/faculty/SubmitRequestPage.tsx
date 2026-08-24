// src/pages/faculty/SubmitRequestPage.tsx
import React, { useState } from 'react';
import { Eye, Send, Trash2, Plus, X, Loader2, CheckCircle2 } from 'lucide-react';
import FileDropzone from '../../components/ui/fileDropzone';
import { useEWasteForm } from '../../hooks/faculty/useSubmitRequest';
import { RequestFormCard } from '../../components/dashboard/RequestFormCard';
import Button from '../../components/ui/Button/button';
import Badge from '../../components/ui/Badge/badge';
import { Modal } from '../../components/ui/Modal/index'; 

interface SubmitRequestPageProps {
  currentNav?: string;
  onNavigate: (view: string) => void;
}

const SubmitRequestPage: React.FC<SubmitRequestPageProps> = () => {
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);

  const { formState, setters, actions } = useEWasteForm(() => {
    setShowPreview(false);
  });

  const handleFinalSubmit = async () => {
    await actions.submitRequest();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Page Header Action Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Submit E-Waste Request
          </h1>
          <p className="mt-1 text-theme-sm text-gray-500 dark:text-gray-400">
            Log obsolete or non-functioning equipment for secure pickup and disposal.
          </p>
        </div>
        
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="md"
            startIcon={<Eye className="h-4 w-4" strokeWidth={1.75} />}
            onClick={() => setShowPreview(true)}
            disabled={formState.loading}
          >
            Preview Request
          </Button>

          <Button
            variant="primary"
            size="md"
            startIcon={
              formState.loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" strokeWidth={1.75} />
              )
            }
            onClick={handleFinalSubmit}
            disabled={formState.loading}
          >
            {formState.loading ? 'Submitting to Cloud...' : 'Submit Request'}
          </Button>
        </div>
      </div>

      {/* Alert Banners */}
      {formState.submitError && (
        <div className="rounded-xl border border-red-100 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10 px-4 py-3 text-theme-sm text-red-600 dark:text-red-400 flex items-center justify-between shadow-sm">
          <span>{formState.submitError}</span>
        </div>
      )}

      {formState.successMessage && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10 px-4 py-3 text-theme-sm text-emerald-700 dark:text-emerald-400 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-500 shrink-0" />
            <span>{formState.successMessage}</span>
          </div>
          <button 
            type="button"
            onClick={actions.clearSuccessMessage}
            className="text-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Request Form Card */}
      <RequestFormCard
        itemName={formState.itemName}
        category={formState.category}
        departmentCode={formState.departmentCode}
        date={formState.date}
        trackingCodePreview={formState.trackingCodePreview}
        onItemNameChange={setters.setItemName}
        onCategoryChange={setters.setCategory}
        onDateChange={setters.setDate}
      />

      {/* Equipment Details Table */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
        <h2 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">Equipment Details</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-theme-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 text-theme-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="w-10 pb-3 font-semibold">No.</th>
                <th className="pb-3 font-semibold">Description</th>
                <th className="w-24 pb-3 font-semibold">Qty</th>
                <th className="w-48 pb-3 font-semibold">Category (Synced)</th>
                <th className="w-16 pb-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {formState.equipmentItems.map((row, idx) => (
                <tr key={row.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                  <td className="py-3 text-gray-400 dark:text-gray-500 font-medium">{idx + 1}</td>
                  <td className="py-3 pr-3">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) => actions.updateEquipmentRow(row.id, { description: e.target.value })}
                      placeholder="Describe the item specs"
                      className="w-full rounded-xl border border-gray-200 bg-transparent dark:border-gray-800 dark:text-white px-3 py-2 text-theme-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <input
                      type="number"
                      min={1}
                      value={row.quantity}
                      onChange={(e) =>
                        actions.updateEquipmentRow(row.id, { quantity: Math.max(1, Number(e.target.value)) })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-transparent dark:border-gray-800 dark:text-white px-3 py-2 text-theme-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </td>
                  <td className="py-3 pr-3">
                    <Badge color="light" variant="light" size="sm">
                      {formState.category}
                    </Badge>
                  </td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => actions.removeEquipmentRow(row.id)}
                      disabled={formState.equipmentItems.length === 1}
                      className="flex h-9 w-9 items-center justify-center rounded-xl text-gray-400 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 dark:hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            startIcon={<Plus className="h-3.5 w-3.5" strokeWidth={2} />}
            onClick={actions.addEquipmentRow}
          >
            Add Equipment Item
          </Button>
        </div>
      </section>

      {/* Photo Documentation */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Photo Documentation</h3>
        <FileDropzone files={formState.photos} onFilesChange={setters.setPhotos} />
      </section>

      {/* Preview Request Modal (Refactored to use generic Modal) */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        showCloseButton={false}
        className="max-w-lg p-6 border border-gray-200 dark:border-gray-800 shadow-2xl !rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Preview Request Summary</h3>
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <dl className="space-y-3 text-theme-sm divide-y divide-gray-100 dark:divide-gray-800/60">
          <div className="flex justify-between pt-2">
            <dt className="text-gray-500 dark:text-gray-400">Item Name</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">{formState.itemName || '—'}</dd>
          </div>
          <div className="flex justify-between pt-2 items-center">
            <dt className="text-gray-500 dark:text-gray-400">Category</dt>
            <dd>
              <Badge color="info" variant="light" size="sm">{formState.category}</Badge>
            </dd>
          </div>
          <div className="flex justify-between pt-2">
            <dt className="text-gray-500 dark:text-gray-400">Department</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">{formState.departmentCode}</dd>
          </div>
          <div className="flex justify-between pt-2">
            <dt className="text-gray-500 dark:text-gray-400">Date</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">{formState.date || '—'}</dd>
          </div>
          <div className="flex justify-between pt-2 items-center">
            <dt className="text-gray-500 dark:text-gray-400">Tracking Code</dt>
            <dd>
              <Badge color="success" variant="light" size="sm">
                {formState.trackingCodePreview}
              </Badge>
            </dd>
          </div>
        </dl>
        <div className="mt-6 flex justify-end gap-2.5">
          <Button variant="outline" size="sm" onClick={() => setShowPreview(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            startIcon={formState.loading ? <Loader2 className="h-4 w-4 animate-spin" /> : undefined}
            onClick={handleFinalSubmit}
            disabled={formState.loading}
          >
            Confirm &amp; Submit
          </Button>
        </div>
      </Modal>

      {/* Settings Modal (Refactored to use generic Modal) */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        showCloseButton={false}
        className="max-w-sm p-6 border border-gray-200 dark:border-gray-800 shadow-2xl !rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Settings</h3>
          <button
            type="button"
            onClick={() => setShowSettings(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-theme-sm text-gray-500 dark:text-gray-400">
          Notification configurations and account settings are managed securely.
        </p>
        <div className="mt-5 flex justify-end">
          <Button variant="primary" size="sm" onClick={() => setShowSettings(false)}>
            Done
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default SubmitRequestPage;