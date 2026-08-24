// src/pages/custodian/ValidationHubPage.tsx
import React from 'react';
import { ClipboardCheck, Search, Eye, CheckCircle2, XCircle, X } from 'lucide-react';
import Button from '../../components/ui/Button/button';
import Badge from '../../components/ui/Badge/badge';
import { Modal } from '../../components/ui/Modal/index'; 
import { useValidationHub } from '../../hooks/custodian/useValidationHub';

interface ValidationHubPageProps {
  currentNav?: string;
  onNavigate: (view: string) => void;
}

export const ValidationHubPage: React.FC<ValidationHubPageProps> = () => {
  const {
    requests,
    selectedRequest,
    isModalOpen,
    remarks,
    setRemarks,
    searchTerm,
    setSearchTerm,
    handleOpenInspection,
    handleCloseInspection,
    handleApprove,
    handleReject,
  } = useValidationHub();

  const getStatusBadgeColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'success';
      case 'rejected':
      case 'disapproved':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'info';
    }
  };

  return (
    <div className="space-y-6 font-sans antialiased">
      {/* Header & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
            Incoming Request Validation Hub
          </h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Review, verify, and validate e-waste disposal requests submitted by faculty users.
          </p>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tracking code or item..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/10 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Centralized Queue Table Card */}
      <section className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Disposal Requests Queue ({requests.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/50 dark:bg-gray-800/40 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="py-3.5 px-5 font-semibold">Tracking Code</th>
                <th className="py-3.5 px-5 font-semibold">Faculty / Dept</th>
                <th className="py-3.5 px-5 font-semibold">Item Name</th>
                <th className="py-3.5 px-5 font-semibold">Condition</th>
                <th className="py-3.5 px-5 font-semibold">Date Submitted</th>
                <th className="py-3.5 px-5 font-semibold">Status</th>
                <th className="py-3.5 px-5 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {requests.map((req) => (
                <tr key={req.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/30 transition-colors">
                  <td className="py-4 px-5 font-semibold text-emerald-600 dark:text-emerald-400">
                    {req.trackingCode}
                  </td>
                  <td className="py-4 px-5">
                    <p className="font-semibold text-gray-900 dark:text-white">{req.facultyName}</p>
                    <p className="text-xs text-gray-400">{req.department}</p>
                  </td>
                  <td className="py-4 px-5 text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{req.itemName}</span>
                    <span className="block text-xs text-gray-400">{req.category}</span>
                  </td>
                  <td className="py-4 px-5">
                    <Badge
                      variant="light"
                      color={req.condition === 'For Disposal' ? 'error' : 'warning'}
                      size="sm"
                    >
                      {req.condition}
                    </Badge>
                  </td>
                  <td className="py-4 px-5 text-gray-500 dark:text-gray-400">{req.dateSubmitted}</td>
                  <td className="py-4 px-5">
                    <Badge
                      variant="light"
                      color={getStatusBadgeColor(req.status)}
                      size="sm"
                    >
                      {req.status}
                    </Badge>
                  </td>
                  <td className="py-4 px-5 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      startIcon={<Eye className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400" />}
                      onClick={() => handleOpenInspection(req)}
                    >
                      Inspect &amp; Review
                    </Button>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    No pending requests found in the queue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Global Inspection Modal Using Custom Component */}
      {selectedRequest && (
        <Modal
          isOpen={isModalOpen}
          onClose={handleCloseInspection}
          showCloseButton={false} // Disabled built-in close button to keep our custom header design
          className="max-w-lg max-h-[85vh] flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800 shadow-2xl !rounded-2xl"
        >
          {/* Modal Header */}
          <div className="shrink-0 flex items-center justify-between border-b border-gray-100 dark:border-gray-800 p-5 bg-white dark:bg-gray-900">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Inspection Panel</h3>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                Tracking Code: {selectedRequest.trackingCode}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCloseInspection}
              className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Modal Scrollable Body */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 text-sm bg-white dark:bg-gray-900">
            <div className="grid grid-cols-2 gap-3 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
              <div>
                <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Faculty</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedRequest.facultyName}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Department</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedRequest.department}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Item Name</span>
                <span className="font-semibold text-gray-800 dark:text-gray-200">{selectedRequest.itemName}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Condition Assessment</span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">{selectedRequest.condition}</span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Description</span>
              <p className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 text-gray-700 dark:text-gray-300">
                {selectedRequest.description}
              </p>
            </div>

            {selectedRequest.photoUrl && (
              <div>
                <span className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Attached Photo Inspection
                </span>
                <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-800 h-44">
                  <img src={selectedRequest.photoUrl} alt="E-Waste Item" className="h-full w-full object-cover" />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Remarks / Feedback for Faculty
              </label>
              <textarea
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Enter remarks, approval notes, or reason if requiring repair..."
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3.5 text-sm text-gray-800 dark:text-gray-200 placeholder-gray-400 focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Modal Footer */}
          <div className="shrink-0 flex items-center justify-end gap-3 border-t border-gray-100 dark:border-gray-800 p-4 bg-white dark:bg-gray-900">
            <Button
              variant="outline"
              size="sm"
              startIcon={<XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400" />}
              className="!bg-rose-500/10 !border-rose-200/20 !text-rose-600 dark:!text-rose-400 hover:!bg-rose-500/20"
              onClick={() => handleReject(selectedRequest.id)}
            >
              Reject / Require Repair
            </Button>
            <Button
              variant="primary"
              size="sm"
              startIcon={<CheckCircle2 className="h-4 w-4 text-white" />}
              onClick={() => handleApprove(selectedRequest.id)}
            >
              Approve Request
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ValidationHubPage;