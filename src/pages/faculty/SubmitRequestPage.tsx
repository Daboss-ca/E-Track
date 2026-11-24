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

  const isPrs = formState.slipType === 'PRS';

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Page Header Action Row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
            Submit Return Slip Request
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Complete return slip details are recorded; qualifying E-Devices are routed to inventory upon approval.
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
            {formState.loading ? 'Submitting Slip...' : 'Submit Return Slip'}
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

      {/* Return Slip Header Card */}
      <RequestFormCard
        slipType={formState.slipType}
        returnReason={formState.returnReason}
        department={formState.department}
        custodianName={formState.custodianName}
        date={formState.date}
        trackingCodePreview={formState.trackingCodePreview}
        onSlipTypeChange={setters.setSlipType}
        onReturnReasonChange={setters.setReturnReason}
        onDepartmentChange={setters.setDepartment}
        onCustodianNameChange={setters.setCustodianName}
        onDateChange={setters.setDate}
      />

      {/* Dynamic Equipment / Return Items Table */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-semibold text-gray-800 dark:text-white/90">
            {isPrs ? 'PRS Item Details (Individual Property)' : 'RRSP Item Details (Semi-Expendable)'}
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {isPrs
              ? 'PRS items are recorded 1 unit per entry with Property No. and Cost.'
              : 'RRSP items support multiple quantities with ICS No., End-User / Location & Cost.'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-x-3 border-spacing-y-2 text-left text-theme-sm">
            <thead>
              <tr className="text-theme-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                <th className="w-10 pb-2 font-semibold">No.</th>
                <th className="min-w-[230px] pb-2 font-semibold">Item / Device Description</th>
                <th className="w-24 pb-2 font-semibold">Qty</th>
                <th className="w-36 pb-2 font-semibold">Cost (₱)</th>
                {isPrs ? (
                  <>
                    <th className="w-44 pb-2 font-semibold">Property No.</th>
                    <th className="w-40 pb-2 font-semibold">Date Acquired</th>
                  </>
                ) : (
                  <>
                    <th className="w-40 pb-2 font-semibold">ICS No.</th>
                    <th className="w-48 pb-2 font-semibold">End-User / Location</th>
                  </>
                )}
                <th className="w-16 pb-2 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {formState.equipmentItems.map((row, idx) => (
                <tr key={row.id} className="transition-colors hover:bg-gray-50/50 dark:hover:bg-white/[0.02]">
                  <td className="py-2 text-gray-400 dark:text-gray-500 font-medium">{idx + 1}</td>

                  <td className="py-2">
                    <input
                      type="text"
                      value={row.description}
                      onChange={(e) =>
                        actions.updateEquipmentRow(row.id, { description: e.target.value })
                      }
                      placeholder={
                        isPrs
                          ? 'e.g. Dell PowerEdge Server or Office Table'
                          : 'e.g. Epson L3210 Printer or Keyboard Set'
                      }
                      className="w-full rounded-xl border border-gray-200 bg-transparent dark:border-gray-800 dark:text-white px-3 py-2 text-theme-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </td>

                  <td className="py-2">
                    <input
                      type="number"
                      min={1}
                      disabled={isPrs}
                      value={isPrs ? 1 : row.quantity}
                      onChange={(e) =>
                        actions.updateEquipmentRow(row.id, {
                          quantity: Math.max(1, Number(e.target.value)),
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-transparent disabled:bg-gray-50 disabled:text-gray-400 dark:border-gray-800 dark:disabled:bg-white/[0.02] dark:text-white px-3 py-2 text-theme-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </td>

                  <td className="py-2">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.acquisitionCost}
                      onChange={(e) =>
                        actions.updateEquipmentRow(row.id, {
                          acquisitionCost: Math.max(0, Number(e.target.value)),
                        })
                      }
                      className="w-full rounded-xl border border-gray-200 bg-transparent dark:border-gray-800 dark:text-white px-3 py-2 text-theme-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </td>

                  {isPrs ? (
                    <>
                      <td className="py-2">
                        <input
                          type="text"
                          value={row.propertyNo}
                          onChange={(e) =>
                            actions.updateEquipmentRow(row.id, { propertyNo: e.target.value })
                          }
                          placeholder="e.g. PRS-2026-001"
                          className="w-full rounded-xl border border-gray-200 bg-transparent dark:border-gray-800 dark:text-white px-3 py-2 text-theme-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="date"
                          value={row.dateAcquired}
                          onChange={(e) =>
                            actions.updateEquipmentRow(row.id, { dateAcquired: e.target.value })
                          }
                          className="w-full rounded-xl border border-gray-200 bg-transparent dark:border-gray-800 dark:text-white [color-scheme:light] dark:[color-scheme:dark] px-3 py-2 text-theme-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="py-2">
                        <input
                          type="text"
                          value={row.icsNo}
                          onChange={(e) =>
                            actions.updateEquipmentRow(row.id, { icsNo: e.target.value })
                          }
                          placeholder="e.g. ICS-2026-998"
                          className="w-full rounded-xl border border-gray-200 bg-transparent dark:border-gray-800 dark:text-white px-3 py-2 text-theme-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </td>
                      <td className="py-2">
                        <input
                          type="text"
                          value={row.location}
                          onChange={(e) =>
                            actions.updateEquipmentRow(row.id, { location: e.target.value })
                          }
                          placeholder="e.g. Room 204 / End-User"
                          className="w-full rounded-xl border border-gray-200 bg-transparent dark:border-gray-800 dark:text-white px-3 py-2 text-theme-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                      </td>
                    </>
                  )}

                  <td className="py-2">
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
            Add Item Row
          </Button>
        </div>
      </section>

      {/* Photo Documentation */}
      <section className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] sm:p-6 shadow-sm space-y-4">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">Photo Documentation</h3>
        <FileDropzone files={formState.photos} onFilesChange={setters.setPhotos} />
      </section>

      {/* Preview Request Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        showCloseButton={false}
        className="max-w-lg p-6 border border-gray-200 dark:border-gray-800 shadow-2xl !rounded-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">Preview Return Slip</h3>
          <button
            type="button"
            onClick={() => setShowPreview(false)}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <dl className="space-y-3 text-theme-sm divide-y divide-gray-100 dark:divide-gray-800/60">
          <div className="flex justify-between pt-2 items-center">
            <dt className="text-gray-500 dark:text-gray-400">Slip Type</dt>
            <dd>
              <Badge color="info" variant="light" size="sm">{formState.slipType}</Badge>
            </dd>
          </div>
          {isPrs && (
            <div className="flex justify-between pt-2">
              <dt className="text-gray-500 dark:text-gray-400">Return Reason</dt>
              <dd className="font-medium text-gray-800 dark:text-gray-200">{formState.returnReason}</dd>
            </div>
          )}
          <div className="flex justify-between pt-2">
            <dt className="text-gray-500 dark:text-gray-400">Department</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">{formState.department || '—'}</dd>
          </div>
          <div className="flex justify-between pt-2">
            <dt className="text-gray-500 dark:text-gray-400">Custodian</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">{formState.custodianName || '—'}</dd>
          </div>
          <div className="flex justify-between pt-2">
            <dt className="text-gray-500 dark:text-gray-400">Date</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">{formState.date || '—'}</dd>
          </div>
          <div className="flex justify-between pt-2">
            <dt className="text-gray-500 dark:text-gray-400">Total Line Items</dt>
            <dd className="font-medium text-gray-800 dark:text-gray-200">
              {formState.equipmentItems.filter((i) => i.description.trim()).length}
            </dd>
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

      {/* Settings Modal */}
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