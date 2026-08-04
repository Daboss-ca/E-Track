// src/pages/custodian/ValidationHubPage.tsx
import React, { useState } from 'react';
import { ClipboardCheck, Search, Eye, CheckCircle2, XCircle, X } from 'lucide-react';
import Sidebar from '../../components/layouts/Sidebar';
import TopHeader from '../../components/layouts/TopBar';
import StatusBadge from '../../components/ui/StatusBadge';
import { useValidationHub } from '../../hooks/custodian/useValidationHub';


interface ValidationHubPageProps {
  currentNav?: string;
  onNavigate: (view: string) => void;
}

export const ValidationHubPage: React.FC<ValidationHubPageProps> = ({ currentNav, onNavigate }) => {
  const activeNav = currentNav || 'custodian-validation';
  const [headerSearch, setHeaderSearch] = useState('');

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

  return (
    <div className="flex h-screen w-full overflow-hidden bg-white font-sans antialiased">
      {/* Sidebar Integration */}
      <div className="h-full shrink-0">
        <Sidebar
          activeId={activeNav}
          onNavigate={onNavigate}
          onOpenSettings={() => {}}
        />
      </div>

      {/* Main Content Container */}
      <div className="flex h-full min-w-0 flex-1 flex-col bg-[#F3F4F6] overflow-hidden">
        <div className="shrink-0">
          <TopHeader
            searchValue={headerSearch}
            onSearchChange={setHeaderSearch}
            notifications={[]}
            onMarkAllRead={() => {}}
          />
        </div>

        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-5">
          {/* Header Row */}
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-[22px] font-bold text-gray-900">Incoming Request Validation Hub</h1>
              <p className="mt-0.5 text-[13px] text-gray-400">
                Review, verify, and validate e-waste disposal requests submitted by faculty users.
              </p>
            </div>
            
            {/* Search Input bar */}
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search tracking code or item..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-4 text-[13px] text-gray-800 placeholder-gray-400 focus:border-gray-900 focus:outline-none"
              />
            </div>
          </div>

          {/* Centralized Queue Table Card */}
          <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-[14px] font-semibold text-gray-800 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-emerald-600" />
                Disposal Requests Queue ({requests.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-[13px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[11.5px] uppercase tracking-wide text-gray-400">
                    <th className="py-2.5 font-medium">Tracking Code</th>
                    <th className="py-2.5 font-medium">Faculty / Dept</th>
                    <th className="py-2.5 font-medium">Item Name</th>
                    <th className="py-2.5 font-medium">Condition</th>
                    <th className="py-2.5 font-medium">Date Submitted</th>
                    <th className="py-2.5 font-medium">Status</th>
                    <th className="py-2.5 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req.id} className="border-b border-gray-50 hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 font-medium text-gray-700">{req.trackingCode}</td>
                      <td className="py-3.5">
                        <p className="font-medium text-gray-800">{req.facultyName}</p>
                        <p className="text-[11.5px] text-gray-400">{req.department}</p>
                      </td>
                      <td className="py-3.5 text-gray-600">
                        {req.itemName}
                        <span className="block text-[11.5px] text-gray-400">{req.category}</span>
                      </td>
                      <td className="py-3.5">
                        <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-[11.5px] font-medium ${
                          req.condition === 'For Disposal' ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {req.condition}
                        </span>
                      </td>
                      <td className="py-3.5 text-gray-500">{req.dateSubmitted}</td>
                      <td className="py-3.5">
                        <StatusBadge status={req.status as React.ComponentProps<typeof StatusBadge>['status']} size="sm" />
                      </td>
                      <td className="py-3.5 text-right">
                        <button
                          type="button"
                          onClick={() => handleOpenInspection(req)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
                        >
                          <Eye className="h-3.5 w-3.5 text-gray-500" />
                          Inspect &amp; Review
                        </button>
                      </td>
                    </tr>
                  ))}
                  {requests.length === 0 && (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[12.5px] text-gray-400">
                        No pending requests found in the queue.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* Inspection Panel Modal */}
      {isModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <h3 className="text-[16px] font-bold text-gray-900">Inspection Panel</h3>
                <p className="text-[12px] text-gray-400">Tracking Code: {selectedRequest.trackingCode}</p>
              </div>
              <button
                type="button"
                onClick={handleCloseInspection}
                className="text-gray-300 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 text-[13px]">
              <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <span className="block text-[11.5px] text-gray-400 uppercase tracking-wider">Faculty</span>
                  <span className="font-medium text-gray-800">{selectedRequest.facultyName}</span>
                </div>
                <div>
                  <span className="block text-[11.5px] text-gray-400 uppercase tracking-wider">Department</span>
                  <span className="font-medium text-gray-800">{selectedRequest.department}</span>
                </div>
                <div>
                  <span className="block text-[11.5px] text-gray-400 uppercase tracking-wider">Item Name</span>
                  <span className="font-medium text-gray-800">{selectedRequest.itemName}</span>
                </div>
                <div>
                  <span className="block text-[11.5px] text-gray-400 uppercase tracking-wider">Condition Assessment</span>
                  <span className="font-medium text-amber-600">{selectedRequest.condition}</span>
                </div>
              </div>

              <div>
                <span className="block text-[11.5px] font-medium text-gray-400 uppercase tracking-wider mb-1">Description</span>
                <p className="rounded-lg border border-gray-200 bg-white p-3 text-gray-700">
                  {selectedRequest.description}
                </p>
              </div>

              {selectedRequest.photoUrl && (
                <div>
                  <span className="block text-[11.5px] font-medium text-gray-400 uppercase tracking-wider mb-1">Attached Photo Inspection</span>
                  <div className="overflow-hidden rounded-xl border border-gray-200 bg-gray-100 h-40">
                    <img src={selectedRequest.photoUrl} alt="E-Waste Item" className="h-full w-full object-cover" />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11.5px] font-medium text-gray-400 uppercase tracking-wider mb-1">
                  Remarks / Feedback for Faculty
                </label>
                <textarea
                  rows={3}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter remarks, approval notes, or reason if requiring repair..."
                  className="w-full rounded-lg border border-gray-200 p-3 text-[13px] text-gray-800 placeholder-gray-400 focus:border-gray-900 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => handleReject(selectedRequest.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-50 px-4 py-2 text-[13px] font-medium text-rose-700 hover:bg-rose-100 transition-colors"
              >
                <XCircle className="h-4 w-4" />
                Reject / Require Repair
              </button>
              <button
                type="button"
                onClick={() => handleApprove(selectedRequest.id)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-[13px] font-medium text-white hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4" />
                Approve Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ValidationHubPage;