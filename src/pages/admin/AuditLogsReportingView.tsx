import { useState } from 'react';
import {
  ShieldCheck,
  Search,
  CheckCircle,
  X,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useAuditLogs, type ApprovedSlipReportRow, type AuditLogItem } from '../../hooks/admin/useAuditLogs';
import Card from '../../components/Card/card';
import Badge from '../../components/ui/Badge/badge';
import Button from '../../components/ui/Button/button';
import { Modal } from '../../components/ui/Modal/index';
import { DataTable } from '../../components/ui/Table';
import type { DataTableColumn } from '../../components/ui/Table';

const ACTION_STYLES: Record<string, string> = {
  Approval: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400',
  'Status Change': 'bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  'Task Assignment': 'bg-indigo-50 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400',
};

const ACTION_DOT: Record<string, string> = {
  Approval: 'bg-emerald-500',
  'Status Change': 'bg-blue-500',
  'Task Assignment': 'bg-indigo-500',
};

export function AuditLogsReportingView() {
  const {
    searchTerm,
    setSearchTerm,
    selectedFilter,
    setSelectedFilter,
    isExporting,
    loading,
    errorMessage,
    auditLogs,
    disposalReports,
    filteredLogs,
    handleGeneratePDF,
  } = useAuditLogs();

  const [previewReport, setPreviewReport] = useState<ApprovedSlipReportRow | null>(null);

  const reportColumns: DataTableColumn<ApprovedSlipReportRow>[] = [
    {
      key: 'trackingCode',
      header: 'Tracking Code & Type',
      dataType: 'identifier',
      pin: 'left',
      minWidth: '170px',
      sortable: true,
      accessor: (report) => report.trackingCode,
      render: (report) => (
        <div>
          <span className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {report.trackingCode}
          </span>
          <div className="mt-1">
            <Badge
              variant="light"
              color={report.slipType === 'PRS' ? 'success' : 'info'}
              size="sm"
            >
              {report.slipType}
            </Badge>
          </div>
        </div>
      ),
    },
    {
      key: 'itemDescription',
      header: 'Item Description',
      dataType: 'text',
      minWidth: '210px',
      sortable: true,
      accessor: (report) => report.itemDescription,
      render: (report) => (
        <span className="font-semibold text-gray-900 dark:text-white">
          {report.itemDescription}
        </span>
      ),
    },
    {
      key: 'propertyOrIcsNo',
      header: 'Property / ICS No.',
      dataType: 'text',
      minWidth: '150px',
      sortable: true,
      accessor: (report) => report.propertyOrIcsNo,
      render: (report) => (
        <span className="font-mono text-xs text-gray-700 dark:text-gray-300">
          {report.propertyOrIcsNo}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: 'Qty / Unit',
      dataType: 'numeric',
      minWidth: '120px',
      sortable: true,
      accessor: (report) => report.quantity,
      render: (report) => (
        <span className="font-mono text-xs font-semibold text-gray-800 dark:text-gray-200">
          {report.quantity} {report.unit}
        </span>
      ),
    },
    {
      key: 'department',
      header: 'Department / End-User',
      dataType: 'text',
      minWidth: '190px',
      sortable: true,
      accessor: (report) => report.department,
      render: (report) => (
        <div>
          <p className="text-xs font-medium text-gray-800 dark:text-gray-200">
            {report.department}
          </p>
          <span className="text-[11px] text-gray-400">{report.endUser}</span>
        </div>
      ),
    },
    {
      key: 'dateApproved',
      header: 'Date Approved',
      dataType: 'identifier',
      minWidth: '130px',
      sortable: true,
      accessor: (report) => report.dateApproved,
      render: (report) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
          {report.dateApproved}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      dataType: 'text',
      minWidth: '130px',
      sortable: true,
      accessor: (report) => report.status,
      render: (report) => (
        <Badge
          variant="light"
          color="success"
          size="sm"
          startIcon={<CheckCircle className="h-3 w-3" />}
        >
          {report.status}
        </Badge>
      ),
    },
  ];

  const logColumns: DataTableColumn<AuditLogItem>[] = [
    {
      key: 'id',
      header: 'Log ID',
      dataType: 'identifier',
      pin: 'left',
      minWidth: '120px',
      sortable: true,
      accessor: (log) => log.id,
      render: (log) => (
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{log.id}</span>
      ),
    },
    {
      key: 'action',
      header: 'Action Type',
      dataType: 'text',
      minWidth: '150px',
      sortable: true,
      accessor: (log) => log.action,
      render: (log) => (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
            ACTION_STYLES[log.action] ??
            'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${
              ACTION_DOT[log.action] ?? 'bg-gray-400'
            }`}
          />
          {log.action}
        </span>
      ),
    },
    {
      key: 'details',
      header: 'Details & Description',
      dataType: 'text',
      minWidth: '250px',
      accessor: (log) => log.details,
      render: (log) => (
        <p className="text-xs text-gray-800 dark:text-gray-200">{log.details}</p>
      ),
    },
    {
      key: 'performedBy',
      header: 'Performed By',
      dataType: 'text',
      minWidth: '160px',
      sortable: true,
      accessor: (log) => log.performedBy,
      render: (log) => (
        <div>
          <p className="font-medium text-xs text-gray-800 dark:text-gray-200">
            {log.performedBy}
          </p>
          <span className="text-[10px] text-gray-400">{log.role}</span>
        </div>
      ),
    },
    {
      key: 'timestamp',
      header: 'Timestamp',
      dataType: 'identifier',
      minWidth: '150px',
      sortable: true,
      accessor: (log) => log.timestamp,
      render: (log) => (
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
          {log.timestamp}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      dataType: 'text',
      minWidth: '110px',
      sortable: true,
      accessor: (log) => log.status,
      render: (log) => (
        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
          <CheckCircle className="h-3 w-3" /> {log.status}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            Audit Logs &amp; Reporting
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            System transparency tracker, immutable compliance logs, and official disposal reporting from approved return slips.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs font-medium text-red-700 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Official Disposal Reports DataTable */}
      <Card
        title="Official Disposal Reports"
        subtitle="Admin-approved PRS and RRSP return slip items marked as Disposed."
        className="dark:!bg-white/[0.03]"
      >
        <div className="w-full py-2">
          <DataTable
            columns={reportColumns}
            data={disposalReports}
            getRowId={(report) => report.id}
            isLoading={loading}
            density="default"
            emptyMessage="No admin-approved return slip disposal records found."
          />
        </div>
      </Card>

      {/* Non-editable Audit Log Section */}
      <Card
        title="Non-Editable Audit Log Trail"
        subtitle="Read-only system history tracking approvals, status updates, and return slip queue activity."
        className="dark:!bg-white/[0.03]"
      >
        <div className="w-full space-y-4 py-2">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                placeholder="Search logs or user..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-gray-200 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 dark:border-gray-800 dark:bg-gray-900 dark:text-white transition-all"
              />
            </div>

            <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto p-1 rounded-xl bg-gray-100 dark:bg-gray-800/60">
              {['All', 'Approval', 'Status Change', 'Task Assignment'].map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    selectedFilter === filter
                      ? 'bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-white'
                      : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <DataTable
            columns={logColumns}
            data={filteredLogs}
            getRowId={(log) => log.id}
            isLoading={loading}
            density="default"
            emptyMessage="No audit log records found matching your filter."
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-gray-400 px-1 pt-1">
            <span>
              Showing <strong className="text-gray-600 dark:text-gray-300">{filteredLogs.length}</strong> of{' '}
              <strong className="text-gray-600 dark:text-gray-300">{auditLogs.length}</strong> immutable records
            </span>
            <span className="flex items-center gap-1 font-mono text-gray-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Read-Only Compliance Mode Enforced
            </span>
          </div>
        </div>
      </Card>

      {/* Report Preview Modal */}
      <Modal isOpen={!!previewReport} onClose={() => setPreviewReport(null)}>
        {previewReport && (
          <div className="p-1 space-y-4">
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
              <div>
                <span className="text-[11px] font-mono text-gray-400">
                  {previewReport.slipType} · {previewReport.propertyOrIcsNo}
                </span>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">
                  Slip: {previewReport.trackingCode}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Approved {previewReport.dateApproved}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPreviewReport(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3.5">
                <span className="text-[11px] font-medium text-gray-400">Quantity</span>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1 font-mono">
                  {previewReport.quantity}{' '}
                  <span className="text-xs font-normal text-gray-400">{previewReport.unit}</span>
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3.5">
                <span className="text-[11px] font-medium text-gray-400">Status</span>
                <div className="mt-1.5">
                  <Badge
                    variant="light"
                    color="success"
                    size="sm"
                    startIcon={<CheckCircle className="h-3 w-3" />}
                  >
                    {previewReport.status}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  handleGeneratePDF(
                    previewReport.id,
                    previewReport.trackingCode,
                    (msg) => alert(msg)
                  )
                }
                disabled={isExporting}
              >
                {isExporting ? 'Generating...' : 'Export Report'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AuditLogsReportingView;