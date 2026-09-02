import { Search, UserCheck, CheckCircle2, Hash, Building2, User, Clock } from 'lucide-react';
import { useWorkDispatch } from '../../hooks/admin/useWorkDispatch';
import Badge from '../../components/ui/Badge/badge';
import Button from '../../components/ui/Button/button';
import { Modal } from '../../components/ui/Modal/index'; 

export function WorkDispatchView() {
  const {
    slips,
    workers,
    searchTerm,
    setSearchTerm,
    selectedSlip,
    selectedWorkerId,
    setSelectedWorkerId,
    handleOpenDispatchModal,
    handleCloseDispatchModal,
    handleConfirmDispatch,
  } = useWorkDispatch();

  return (
    <div className="space-y-6">
      {/* Header Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Work Management & Dispatch</h1>
        </div>
        <Badge variant="light" color="info" size="md">
          {slips.filter((s) => s.status === 'Pending Admin Approval').length} Pending Validation
        </Badge>
      </div>

      {/* Filter and Search Input Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tracking code, device, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-4 text-xs text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-200 dark:focus:bg-transparent"
          />
        </div>
      </div>

      {/* Slips Table Layout */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
              <tr>
                <th className="px-6 py-4 font-bold">Return Slip / Tracking Code</th>
                <th className="px-6 py-4 font-bold">Department & Custodian</th>
                <th className="px-6 py-4 font-bold">Urgency</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {slips.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-gray-400 italic">
                    No validated return slips found.
                  </td>
                </tr>
              ) : (
                slips.map((slip) => {
                  const isPending = slip.status === 'Pending Admin Approval';
                  return (
                    <tr key={slip.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                          {slip.deviceName}
                        </p>
                        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                          <Hash className="h-3 w-3" />
                          {slip.trackingCode} ({slip.quantity} Unit/s)
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          {slip.department}
                        </p>
                        <span className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                          <User className="h-3 w-3" />
                          Validated by: {slip.custodianName}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <Badge
                          variant="light"
                          size="sm"
                          color={slip.urgency === 'High' ? 'error' : slip.urgency === 'Medium' ? 'warning' : 'info'}
                        >
                          {slip.urgency} Urgency
                        </Badge>
                      </td>

                      <td className="px-6 py-4">
                        {isPending ? (
                          <Badge variant="light" color="warning" size="sm" startIcon={<Clock className="h-3 w-3" />}>
                            Pending Dispatch
                          </Badge>
                        ) : (
                          <div>
                            <Badge variant="solid" color="success" size="sm" startIcon={<CheckCircle2 className="h-3 w-3" />}>
                              Dispatched
                            </Badge>
                            <span className="block text-[10px] text-gray-400 mt-1 font-medium">
                              To: {slip.assignedSegregatorName}
                            </span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isPending ? (
                          <Button
                            variant="primary"
                            size="sm"
                            startIcon={<UserCheck className="h-3.5 w-3.5" />}
                            onClick={() => handleOpenDispatchModal(slip)}
                          >
                            Approve & Dispatch
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            Dispatched
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dispatch Modal Prompt gamit ang Reusable Modal Component */}
      <Modal
        isOpen={Boolean(selectedSlip)}
        onClose={handleCloseDispatchModal}
        className="max-w-lg p-6 m-4"
        showCloseButton={false}
      >
        {selectedSlip && (
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Dispatch Task to Segregator</h3>
                <Badge variant="light" color="warning" size="sm">
                  {selectedSlip.trackingCode}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Assign <strong className="text-gray-800 dark:text-gray-200">{selectedSlip.deviceName}</strong> ({selectedSlip.quantity} units) from {selectedSlip.department} to a worker.
              </p>
            </div>

            <div className="space-y-3">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                Select Segregator / Worker:
              </label>
              <div className="space-y-2">
                {workers.map((worker) => {
                  const isSelected = selectedWorkerId === worker.id;
                  return (
                    <div
                      key={worker.id}
                      onClick={() => setSelectedWorkerId(worker.id)}
                      className={[
                        'flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all',
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/20 dark:bg-emerald-950/30'
                          : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800/40 hover:border-emerald-300',
                      ].join(' ')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 font-bold text-xs">
                          {worker.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 dark:text-white">{worker.name}</p>
                          <span className="text-[10px] text-gray-400">Active Tasks: {worker.activeTasks}</span>
                        </div>
                      </div>
                      <Badge
                        variant="light"
                        size="sm"
                        color={worker.status === 'Available' ? 'success' : worker.status === 'Busy' ? 'warning' : 'light'}
                      >
                        {worker.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button variant="outline" size="sm" onClick={handleCloseDispatchModal}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={!selectedWorkerId}
                startIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                onClick={handleConfirmDispatch}
              >
                Confirm Dispatch
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default WorkDispatchView;