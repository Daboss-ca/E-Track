import React, { useState } from 'react';
import { ShieldCheck, Search, CheckCircle, X, Calendar } from 'lucide-react';
import { useAuditLogs } from '../../hooks/admin/useAuditLogs';
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
    auditLogs,
    disposalReports,
    filteredLogs,
    handleGeneratePDF,
  } = useAuditLogs();

  const [previewReport, setPreviewReport] = useState<typeof disposalReports[number] | null>(null);

  // Helper function para kalkulahin ang breakdown base sa category
  const getCategoryData = (extractedParts: typeof disposalReports[number]['extractedParts'], targetCategory: 'Hazardous' | 'Reusable' | 'Recyclable') => {
    const matchedParts = extractedParts.filter((p) => p.category === targetCategory);
    const count = matchedParts.reduce((sum, p) => sum + p.count, 0);
    const weightKg = matchedParts.reduce((sum, p) => sum + p.weightKg, 0);

    return {
      count,
      weightKg: weightKg.toFixed(2),
      hasItems: matchedParts.length > 0,
    };
  };

  // Columns for Official Disposal Reports Table
  const reportColumns: DataTableColumn<typeof disposalReports[number]>[] = [
    {
      key: 'batchCode',
      header: 'Report & Batch Code',
      dataType: 'identifier',
      pin: 'left',
      minWidth: '180px',
      sortable: true,
      accessor: (report) => report.batchCode,
      render: (report) => (
        <div>
          <span className="text-[11px] font-mono text-gray-400">{report.reportId}</span>
          <p className="font-bold text-gray-900 dark:text-white mt-0.5">{report.batchCode}</p>
        </div>
      ),
    },
    {
      key: 'totalWeightKg',
      header: 'Total Weight',
      dataType: 'numeric',
      minWidth: '130px',
      sortable: true,
      accessor: (report) => report.totalWeightKg,
      render: (report) => (
        <span className="font-mono font-bold text-gray-900 dark:text-white">
          {report.totalWeightKg.toLocaleString()} kg
        </span>
      ),
    },
    {
      key: 'hazardousParts',
      header: 'Hazardous Parts',
      dataType: 'numeric',
      minWidth: '150px',
      sortable: true,
      accessor: (report) => getCategoryData(report.extractedParts, 'Hazardous').count,
      render: (report) => {
        const data = getCategoryData(report.extractedParts, 'Hazardous');
        return data.hasItems ? (
          <div className="font-mono text-xs text-right">
            <span className="font-bold text-red-600 dark:text-red-400">{data.count} pcs</span>
            <span className="text-gray-400 block text-[11px]">({data.weightKg} kg)</span>
          </div>
        ) : (
          <span className="text-gray-300 dark:text-gray-700 block text-right">-</span>
        );
      },
    },
    {
      key: 'reusableParts',
      header: 'Reusable Parts',
      dataType: 'numeric',
      minWidth: '150px',
      sortable: true,
      accessor: (report) => getCategoryData(report.extractedParts, 'Reusable').count,
      render: (report) => {
        const data = getCategoryData(report.extractedParts, 'Reusable');
        return data.hasItems ? (
          <div className="font-mono text-xs text-right">
            <span className="font-bold text-blue-600 dark:text-blue-400">{data.count} pcs</span>
            <span className="text-gray-400 block text-[11px]">({data.weightKg} kg)</span>
          </div>
        ) : (
          <span className="text-gray-300 dark:text-gray-700 block text-right">-</span>
        );
      },
    },
    {
      key: 'recyclableParts',
      header: 'Recyclable Parts',
      dataType: 'numeric',
      minWidth: '150px',
      sortable: true,
      accessor: (report) => getCategoryData(report.extractedParts, 'Recyclable').count,
      render: (report) => {
        const data = getCategoryData(report.extractedParts, 'Recyclable');
        return data.hasItems ? (
          <div className="font-mono text-xs text-right">
            <span className="font-bold text-emerald-600 dark:text-emerald-400">{data.count} pcs</span>
            <span className="text-gray-400 block text-[11px]">({data.weightKg} kg)</span>
          </div>
        ) : (
          <span className="text-gray-300 dark:text-gray-700 block text-right">-</span>
        );
      },
    },
    {
      key: 'dateGenerated',
      header: 'Date Generated',
      dataType: 'identifier',
      minWidth: '130px',
      sortable: true,
      accessor: (report) => report.dateGenerated,
      render: (report) => (
        <span className="font-mono text-xs text-gray-600 dark:text-gray-400">
          {report.dateGenerated}
        </span>
      ),
    },
    {
      key: 'complianceStatus',
      header: 'Compliance Status',
      dataType: 'text',
      minWidth: '150px',
      sortable: true,
      accessor: (report) => report.complianceStatus,
      render: (report) => (
        <Badge variant="light" color="success" size="sm" startIcon={<CheckCircle className="h-3 w-3" />}>
          {report.complianceStatus}
        </Badge>
      ),
    },
  ];

  // Columns for Audit Log Trail Table
  const logColumns: DataTableColumn<typeof auditLogs[number]>[] = [
    {
      key: 'id',
      header: 'Log ID',
      dataType: 'identifier',
      pin: 'left',
      minWidth: '120px',
      sortable: true,
      accessor: (log) => log.id,
      render: (log) => <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{log.id}</span>,
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
            ACTION_STYLES[log.action] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${ACTION_DOT[log.action] ?? 'bg-gray-400'}`} />
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
      render: (log) => <p className="text-xs text-gray-800 dark:text-gray-200">{log.details}</p>,
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
          <p className="font-medium text-xs text-gray-800 dark:text-gray-200">{log.performedBy}</p>
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
      render: (log) => <span className="font-mono text-xs text-gray-500 dark:text-gray-400">{log.timestamp}</span>,
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
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Audit Logs & Reporting</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            System transparency tracker, immutable compliance logs, and official disposal reporting.
          </p>
        </div>

        <Badge variant="solid" color="success" size="md" startIcon={<ShieldCheck className="h-3.5 w-3.5" />}>
          Immutable Logs Active
        </Badge>
      </div>

      {/* Official Disposal Reports DataTable */}
      <Card
        title="Official Disposal Reports"
        subtitle="Compliance-certified summaries of total weights and extracted e-waste components."
        className="dark:!bg-white/[0.03]"
      >
        <div className="w-full py-2">
          <DataTable
            columns={reportColumns}
            data={disposalReports}
            getRowId={(report) => report.reportId}
            density="default"
            emptyMessage="No disposal reports found."
          />
        </div>
      </Card>

      {/* Non-editable Audit Log Section */}
      <Card
        title="Non-Editable Audit Log Trail"
        subtitle="Read-only system history tracking all approvals, status changes, and task assignments."
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
                <span className="text-[11px] font-mono text-gray-400">{previewReport.reportId}</span>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mt-0.5">
                  Batch: {previewReport.batchCode}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Generated {previewReport.dateGenerated}
                </p>
              </div>
              <button
                onClick={() => setPreviewReport(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300 transition-colors"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 py-2">
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3.5">
                <span className="text-[11px] font-medium text-gray-400">Total Weight</span>
                <p className="text-xl font-semibold text-gray-900 dark:text-gray-100 mt-1 font-mono">
                  {previewReport.totalWeightKg.toLocaleString()} <span className="text-xs font-normal text-gray-400">kg</span>
                </p>
              </div>
              <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-3.5">
                <span className="text-[11px] font-medium text-gray-400">Compliance Status</span>
                <div className="mt-1.5">
                  <Badge variant="light" color="success" size="sm" startIcon={<CheckCircle className="h-3 w-3" />}>
                    {previewReport.complianceStatus}
                  </Badge>
                </div>
              </div>
            </div>

            <div>
              <span className="text-[11px] font-medium text-gray-400">Extracted Components</span>
              <div className="mt-2 border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400">
                      <th className="p-2.5 text-left font-medium">Component</th>
                      <th className="p-2.5 text-right font-medium">Count</th>
                      <th className="p-2.5 text-right font-medium">Weight</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {previewReport.extractedParts.map((part, idx) => (
                      <tr key={idx}>
                        <td className="p-2.5 text-gray-800 dark:text-gray-200">{part.partName}</td>
                        <td className="p-2.5 text-right text-gray-500 dark:text-gray-400 font-mono">{part.count} pcs</td>
                        <td className="p-2.5 text-right font-mono font-medium text-gray-800 dark:text-gray-200">{part.weightKg} kg</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  handleGeneratePDF(previewReport.reportId, previewReport.batchCode, (msg) => alert(msg))
                }
                disabled={isExporting}
              >
                {isExporting ? 'Generating...' : 'Export Official PDF Report'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default AuditLogsReportingView;