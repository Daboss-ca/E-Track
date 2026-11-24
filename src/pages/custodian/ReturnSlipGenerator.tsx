import React, { useState } from 'react';
import {
  Search,
  Building2,
  ChevronDown,
  ChevronUp,
  Package,
  Tag,
  Filter,
  CheckCircle2,
  Loader2,
  AlertCircle,
  Ban,
} from 'lucide-react';
import {
  useReturnSlip,
  type CustodianReturnSlip,
  type CustodianReturnSlipItem,
} from '../../hooks/custodian/useReturnSlip';
import Badge from '../../components/ui/Badge/badge';
import Button from '../../components/ui/Button/button';
import { DataTable } from '../../components/ui/Table';
import type { DataTableColumn } from '../../components/ui/Table';

interface ReturnSlipGeneratorProps {
  requestId?: string;
  currentNav?: string;
  onNavigate?: (view: string) => void;
  onSuccess?: () => void;
}

export const ReturnSlipGenerator: React.FC<ReturnSlipGeneratorProps> = ({
  requestId,
  onSuccess,
}) => {
  const {
    slips,
    loading,
    submittingSlipId,
    searchTerm,
    setSearchTerm,
    error,
    successMessage,
    handleToggleItemReject,
    handleItemFeedbackChange,
    handleApproveAndForwardSlip,
  } = useReturnSlip(requestId);

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PRS' | 'RRSP'>('ALL');
  const [collapsedSlips, setCollapsedSlips] = useState<Record<string, boolean>>({});

  const toggleSlipCollapse = (trackingCode: string) => {
    setCollapsedSlips((prev) => ({
      ...prev,
      [trackingCode]: !prev[trackingCode],
    }));
  };

  const isSlipForwardedToAdmin = (status: string) => {
    const normalized = status.toLowerCase();
    return normalized === 'pending admin approval' || normalized === 'approved';
  };

  const prsSlips = slips.filter((s) => s.slipType === 'PRS');
  const rrspSlips = slips.filter((s) => s.slipType === 'RRSP');

  const getFilterButtonClass = (isActive: boolean) =>
    isActive
      ? 'inline-flex h-8 items-center justify-center rounded-lg border border-gray-300 bg-gray-200 px-3 text-xs font-semibold text-gray-900 hover:bg-gray-300 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
      : 'inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white';

  const buildCheckerActionColumn = (
    slipId: string,
    locked: boolean
  ): DataTableColumn<CustodianReturnSlipItem> => ({
    key: 'checkerAction',
    header: 'Checker Action (Reject Item)',
    dataType: 'text',
    sortable: false,
    accessor: (item) =>
      item.isRejectedItem ? `Rejected: ${item.rejectionFeedback || 'Yes'}` : 'Included',
    render: (item) => {
      const rejected = Boolean(item.isRejectedItem);

      return (
        <div
          className="flex flex-col gap-2 min-w-[220px]"
          onClick={(e) => e.stopPropagation()}
        >
          <label
            className={`inline-flex items-center gap-2 text-xs font-medium select-none ${
              locked ? 'cursor-default opacity-75' : 'cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              checked={rejected}
              disabled={locked}
              onChange={(e) => handleToggleItemReject(slipId, item.id, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500 dark:border-gray-700 dark:bg-gray-800"
            />
            <span
              className={
                rejected
                  ? 'inline-flex items-center gap-1 font-semibold text-rose-600 dark:text-rose-400'
                  : 'text-gray-700 dark:text-gray-300'
              }
            >
              {rejected && <Ban className="h-3.5 w-3.5 shrink-0" />}
              {rejected ? 'Rejected (Excluded)' : 'Mark as Reject'}
            </span>
          </label>

          {rejected && (
            <input
              type="text"
              disabled={locked}
              value={item.rejectionFeedback}
              onChange={(e) => handleItemFeedbackChange(slipId, item.id, e.target.value)}
              placeholder="Required: feedback for rejected item..."
              className="w-full rounded-lg border border-rose-200 bg-rose-50/50 px-2.5 py-1.5 text-[11px] text-gray-800 placeholder-rose-400/80 focus:border-rose-500 focus:bg-white focus:outline-none dark:border-rose-900/60 dark:bg-rose-950/20 dark:text-gray-200"
            />
          )}
        </div>
      );
    },
  });

  const buildPrsColumns = (
    slipId: string,
    locked: boolean
  ): DataTableColumn<CustodianReturnSlipItem>[] => [
    {
      key: 'deviceName',
      header: 'Item Description',
      dataType: 'identifier',
      pin: 'left',
      sortable: false,
      accessor: (item) => item.deviceName,
      render: (item) => (
        <span
          className={`font-bold ${
            item.isRejectedItem
              ? 'line-through text-rose-600 dark:text-rose-400'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          {item.deviceName}
        </span>
      ),
    },
    {
      key: 'propertyNo',
      header: 'Property No.',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.propertyTag || item.propertyNo || 'PRS-2026-001',
      render: (item) => (
        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
          {item.propertyTag || item.propertyNo || 'PRS-2026-001'}
        </span>
      ),
    },
    {
      key: 'dateAcquired',
      header: 'Date Acquired',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.dateAcquired || '2023-05-12',
      render: (item) => (
        <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
          {item.dateAcquired || '2023-05-12'}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: 'Qty',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.quantity || 1,
      render: (item) => (
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
          {item.quantity || 1}
        </span>
      ),
    },
    {
      key: 'unit',
      header: 'Unit',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.unit || 'unit',
      render: (item) => (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {item.unit || 'unit'}
        </span>
      ),
    },
    {
      key: 'acquisitionCost',
      header: 'Acquisition Cost',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.acquisitionCost || 0,
      render: (item) => (
        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
          ₱{item.acquisitionCost ? item.acquisitionCost.toLocaleString() : '0'}
        </span>
      ),
    },
    buildCheckerActionColumn(slipId, locked),
  ];

  const buildRrspColumns = (
    slipId: string,
    slipDepartment: string,
    locked: boolean
  ): DataTableColumn<CustodianReturnSlipItem>[] => [
    {
      key: 'deviceName',
      header: 'Item Description',
      dataType: 'identifier',
      pin: 'left',
      sortable: false,
      accessor: (item) => item.deviceName,
      render: (item) => (
        <span
          className={`font-bold ${
            item.isRejectedItem
              ? 'line-through text-rose-600 dark:text-rose-400'
              : 'text-gray-900 dark:text-white'
          }`}
        >
          {item.deviceName}
        </span>
      ),
    },
    {
      key: 'icsNo',
      header: 'ICS / Serial No.',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.propertyTag || item.icsNo || 'ICS-2026-998',
      render: (item) => (
        <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
          {item.propertyTag || item.icsNo || 'ICS-2026-998'}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: 'Quantity',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.quantity || 1,
      render: (item) => (
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
          {item.quantity || 1}
        </span>
      ),
    },
    {
      key: 'endUser',
      header: 'End-User',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.endUser || 'End-User',
      render: (item) => (
        <span className="text-xs text-gray-700 dark:text-gray-300">
          {item.endUser || 'End-User'}
        </span>
      ),
    },
    {
      key: 'location',
      header: 'Location / Office',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.location || slipDepartment,
      render: (item) => (
        <span className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
          {item.location || slipDepartment}
        </span>
      ),
    },
    buildCheckerActionColumn(slipId, locked),
  ];

  const renderSlipCard = (slip: CustodianReturnSlip, variant: 'PRS' | 'RRSP') => {
    const isCollapsed = collapsedSlips[slip.trackingCode] ?? false;
    const locked = isSlipForwardedToAdmin(slip.status);
    const isSubmitting = submittingSlipId === slip.id;
    const rejectedCount = slip.items.filter((i) => i.isRejectedItem).length;
    const includedCount = slip.items.length - rejectedCount;
    const firstItemReason = slip.items[0]?.returnReason || 'Unserviceable';

    const codeBadgeClasses =
      variant === 'PRS'
        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
        : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800';

    return (
      <div
        key={slip.id}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-all"
      >
        <div
          onClick={() => toggleSlipCollapse(slip.trackingCode)}
          className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-4 cursor-pointer bg-gray-50/80 dark:bg-gray-800/40 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 transition-colors border-b border-gray-100 dark:border-gray-800 gap-3"
        >
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${codeBadgeClasses}`}
            >
              {slip.trackingCode}
            </span>

            {variant === 'PRS' && (
              <Badge variant="light" color="error" size="sm">
                {firstItemReason}
              </Badge>
            )}

            <span className="text-xs text-gray-600 dark:text-gray-300 font-medium">
              {slip.department} • {slip.items.length} {slip.items.length === 1 ? 'Item' : 'Items'}
            </span>

            {rejectedCount > 0 && (
              <Badge variant="light" color="error" size="sm">
                {rejectedCount} {rejectedCount === 1 ? 'Item' : 'Items'} Excluded
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2.5 justify-end">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                locked
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800'
              }`}
            >
              {locked ? 'Forwarded to Admin' : 'Pending Check'}
            </span>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleSlipCollapse(slip.trackingCode);
              }}
              aria-label="Toggle slip items"
              className="rounded-lg p-1 text-gray-500 hover:bg-gray-200/60 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {isCollapsed ? (
                <ChevronDown className="h-5 w-5" />
              ) : (
                <ChevronUp className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {!isCollapsed && (
          <div className="p-4 sm:p-5 space-y-4">
            <DataTable
              columns={
                variant === 'PRS'
                  ? buildPrsColumns(slip.id, locked)
                  : buildRrspColumns(slip.id, slip.department, locked)
              }
              data={slip.items}
              getRowId={(item) => item.id}
              density="default"
              emptyMessage="No items found in this return slip."
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {locked ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-medium">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    Approved and forwarded to Admin.
                  </span>
                ) : rejectedCount > 0 ? (
                  <span className="text-amber-700 dark:text-amber-400 font-medium">
                    {includedCount} item(s) will be sent to Admin; {rejectedCount} rejected item(s) will be excluded.
                  </span>
                ) : (
                  <span>
                    All {includedCount} item(s) will be included when approved and sent to Admin.
                  </span>
                )}
              </div>

              {!locked && (
                <Button
                  variant="primary"
                  size="sm"
                  disabled={isSubmitting}
                  onClick={() => void handleApproveAndForwardSlip(slip.id, onSuccess)}
                  startIcon={
                    isSubmitting ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    )
                  }
                >
                  {isSubmitting ? 'Approving...' : 'Approve & Send to Admin'}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Return Slips</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Review PRS and RRSP items, flag rejected items with feedback so they are excluded, and approve to send remaining items to Admin.
          </p>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-medium text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/30 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 mr-1">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>
          <button
            type="button"
            onClick={() => setActiveFilter('ALL')}
            className={getFilterButtonClass(activeFilter === 'ALL')}
          >
            All Slips
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('PRS')}
            className={getFilterButtonClass(activeFilter === 'PRS')}
          >
            PRS
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('RRSP')}
            className={getFilterButtonClass(activeFilter === 'RRSP')}
          >
            RRSP
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search code or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2 pl-9 pr-4 text-xs text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-gray-800 dark:bg-white/[0.03] dark:text-gray-200 dark:focus:bg-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex h-48 items-center justify-center rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
          <div className="inline-flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
            Loading return slips...
          </div>
        </div>
      ) : (
        <>
          {(activeFilter === 'ALL' || activeFilter === 'PRS') && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-emerald-600" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Property Return Slips (PRS)
                </h2>
              </div>

              {prsSlips.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
                  No PRS return slips found.
                </div>
              ) : (
                prsSlips.map((slip) => renderSlipCard(slip, 'PRS'))
              )}
            </div>
          )}

          {(activeFilter === 'ALL' || activeFilter === 'RRSP') && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-2">
                <Tag className="h-5 w-5 text-blue-600" />
                <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                  Receipt of Returned Property Semi-Expendable (RRSP)
                </h2>
              </div>

              {rrspSlips.length === 0 ? (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
                  No RRSP return slips found.
                </div>
              ) : (
                rrspSlips.map((slip) => renderSlipCard(slip, 'RRSP'))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReturnSlipGenerator;