import React, { useMemo, useState } from 'react';
import { Cpu, Weight, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import type { DismantlingSessionLog, ComponentClassification } from '../../types/segregator/segregator.types';
import Badge from '../../components/ui/Badge/badge';

interface ExtendedDismantlingSessionLog extends DismantlingSessionLog {
  totalWeight?: string;
  components?: Array<{
    name: string;
    classification: ComponentClassification | string;
    hazardousSubParts?: string[];
  }>;
}

export interface CompletedLogsViewProps {
  logs: DismantlingSessionLog[];
}

function formatTimestamp(iso: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function CompletedLogsView({ logs }: CompletedLogsViewProps) {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const completedLogs = useMemo(() => logs, [logs]) as ExtendedDismantlingSessionLog[];

  const toggleExpand = (id: string) => {
    setExpandedLogId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Completed Session Logs</h1>
      </div>

      {completedLogs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-12 text-center dark:border-gray-800 dark:bg-gray-900/50">
          <Cpu className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            No completed session logs recorded yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50/80 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-gray-800/50 dark:text-gray-400 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th className="px-6 py-4 font-bold">Item / Work Order</th>
                  <th className="px-6 py-4 font-bold">Timestamp</th>
                  <th className="px-6 py-4 font-bold">Total Weight</th>
                  <th className="px-6 py-4 font-bold text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {completedLogs.map((log, index) => {
                  const logId = log.id || `log-${index}`;
                  const isExpanded = expandedLogId === logId;
                  const deviceTitle = log.deviceName || log.selectedItemName || `Work Order #${log.workOrderId}`;
                  
                  const totalWeightDisplay = log.totalWeight || 
                    (log.remarks?.match(/Total Weight:\s*([0-9.]+kg)/)?.[1]) || '—';

                  return (
                    <React.Fragment key={logId}>
                      <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <Cpu className="h-4 w-4 text-sky-500" />
                            {deviceTitle}
                          </p>
                          <span className="text-xs font-mono text-gray-400">
                            {log.referenceCode || `WO-${log.workOrderId}`}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-600 dark:text-gray-300">
                          {formatTimestamp(log.completedAt)}
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          <span className="inline-flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-100 dark:border-emerald-900">
                            <Weight className="h-3.5 w-3.5" />
                            {totalWeightDisplay}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => toggleExpand(logId)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 px-3 py-1.5 rounded-xl hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                          >
                            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                          </button>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-gray-50/60 dark:bg-gray-900/40">
                          <td colSpan={4} className="px-6 py-5">
                            <div className="space-y-4">
                              <h5 className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                                <Cpu className="h-4 w-4 text-sky-500" />
                                Extracted Component &amp; Hazardous Sub-parts Breakdown ({log.components?.length || 0} main items)
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {log.components && log.components.length > 0 ? (
                                  log.components.map((comp, cIdx) => (
                                    <div
                                      key={cIdx}
                                      className="bg-white dark:bg-gray-800 p-3.5 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm space-y-2"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-xs font-bold text-gray-800 dark:text-gray-200">
                                          {comp.name}
                                        </span>
                                        <Badge
                                          size="sm"
                                          color={
                                            comp.classification === 'Hazardous'
                                              ? 'error'
                                              : comp.classification === 'Reusable'
                                              ? 'success'
                                              : 'info'
                                          }
                                        >
                                          {comp.classification}
                                        </Badge>
                                      </div>

                                      {comp.hazardousSubParts && comp.hazardousSubParts.length > 0 && (
                                        <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 space-y-1">
                                          <span className="text-[10px] font-bold uppercase text-red-500 flex items-center gap-1">
                                            <AlertTriangle className="h-3 w-3" /> Extracted Hazardous Sub-parts:
                                          </span>
                                          <div className="flex flex-wrap gap-1">
                                            {comp.hazardousSubParts.map((subName, subIdx) => (
                                              <span
                                                key={subIdx}
                                                className="text-[11px] bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300 px-2 py-0.5 rounded-md border border-red-100 dark:border-red-900/50 font-medium"
                                              >
                                                • {subName}
                                              </span>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <span className="text-xs text-gray-400 italic">No individual components recorded.</span>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}