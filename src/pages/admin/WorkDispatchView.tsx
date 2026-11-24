import { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Building2,
  FileText,
  ChevronDown,
  ChevronUp,
  Package,
  Tag,
  Filter,
} from 'lucide-react';
import { useWorkDispatch } from '../../hooks/admin/useWorkDispatch';
import { CVSU_ICT_CATALOG, type CvsuIctCategory } from '../../utils/admin/deviceCatalog';
import Badge from '../../components/ui/Badge/badge';
import Button from '../../components/ui/Button/button';
import { DataTable } from '../../components/ui/Table';
import type { DataTableColumn } from '../../components/ui/Table';
import { generatePrsDocx } from './utils/generatePrsDocx';
import { generateRrspDocx } from './utils/generateRrspDocx';

const ICT_CATEGORY_OPTIONS: CvsuIctCategory[] = CVSU_ICT_CATALOG.map((r) => r.category);
const DEFAULT_ICT_CATEGORY: CvsuIctCategory = ICT_CATEGORY_OPTIONS[0] ?? 'Servers';

export function WorkDispatchView() {
  const {
    slips,
    searchTerm,
    setSearchTerm,
    handleToggleItemEDevice,
    handleApproveSlip,
  } = useWorkDispatch();

  type SlipItem = (typeof slips)[number]['items'][number];

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PRS' | 'RRSP'>('ALL');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED'>('ALL');
  const [collapsedSlips, setCollapsedSlips] = useState<Record<string, boolean>>({});

  const toggleSlipCollapse = (trackingCode: string) => {
    setCollapsedSlips((prev) => ({
      ...prev,
      [trackingCode]: !prev[trackingCode],
    }));
  };

  const matchesStatusFilter = (status: (typeof slips)[number]['status']) => {
    if (statusFilter === 'PENDING') return status === 'Pending Admin Approval';
    if (statusFilter === 'APPROVED') return status === 'Approved';
    return true;
  };

  const prsSlips = slips.filter(
    (s) => s.slipType === 'PRS' && matchesStatusFilter(s.status)
  );
  const rrspSlips = slips.filter(
    (s) => s.slipType === 'RRSP' && matchesStatusFilter(s.status)
  );

  const getFilterButtonClass = (isActive: boolean) =>
    isActive
      ? 'inline-flex h-8 items-center justify-center rounded-lg border border-gray-300 bg-gray-200 px-3 text-xs font-semibold text-gray-900 hover:bg-gray-300 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
      : 'inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white';

  const renderStatusFilterButtons = () => (
    <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
      <button
        type="button"
        onClick={() => setStatusFilter('ALL')}
        className={getFilterButtonClass(statusFilter === 'ALL')}
      >
        All Status
      </button>
      <button
        type="button"
        onClick={() => setStatusFilter('PENDING')}
        className={getFilterButtonClass(statusFilter === 'PENDING')}
      >
        Pending
      </button>
      <button
        type="button"
        onClick={() => setStatusFilter('APPROVED')}
        className={getFilterButtonClass(statusFilter === 'APPROVED')}
      >
        Approved
      </button>
    </div>
  );

  const buildEDeviceActionColumn = (
    slipId: string,
    isSlipApproved: boolean
  ): DataTableColumn<SlipItem> => ({
    key: 'eDeviceAction',
    header: 'E-Device Action',
    dataType: 'text',
    sortable: false,
    accessor: (item) => (item.isEDevice ? item.ictCategory || 'E-Device' : 'Unchecked'),
    render: (item) => {
      const checked = Boolean(item.isEDevice);
      const selectedCategory = item.ictCategory || DEFAULT_ICT_CATEGORY;

      return (
        <div className="flex flex-col gap-1.5" onClick={(e) => e.stopPropagation()}>
          <label
            className={`inline-flex items-center gap-2 text-xs font-medium select-none ${
              isSlipApproved ? 'cursor-default opacity-80' : 'cursor-pointer'
            }`}
          >
            <input
              type="checkbox"
              checked={checked}
              disabled={isSlipApproved}
              onChange={(e) =>
                void handleToggleItemEDevice(
                  slipId,
                  item.id,
                  e.target.checked,
                  e.target.checked ? selectedCategory : null
                )
              }
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 dark:border-gray-700 dark:bg-gray-800"
            />
            <span
              className={
                checked
                  ? 'text-emerald-700 dark:text-emerald-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300'
              }
            >
              E-Device
            </span>
          </label>

          {checked && (
            <select
              value={selectedCategory}
              disabled={isSlipApproved}
              onChange={(e) =>
                void handleToggleItemEDevice(
                  slipId,
                  item.id,
                  true,
                  e.target.value as CvsuIctCategory
                )
              }
              className="rounded-lg border border-gray-200 bg-white px-2 py-1 text-[11px] font-medium text-gray-700 focus:border-emerald-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200"
            >
              <option value="" disabled hidden>
                Select E-Device Type
              </option>
              {ICT_CATEGORY_OPTIONS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
        </div>
      );
    },
  });

  const buildPrsColumns = (slipId: string, isSlipApproved: boolean): DataTableColumn<SlipItem>[] => [
    {
      key: 'deviceName',
      header: 'Item Description',
      dataType: 'identifier',
      pin: 'left',
      sortable: false,
      accessor: (item) => item.deviceName,
      render: (item) => (
        <span className="font-bold text-gray-900 dark:text-white">
          {item.deviceName}
        </span>
      ),
    },
    {
      key: 'propertyNo',
      header: 'Property No.',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.propertyNo || 'PRS-2026-001',
      render: (item) => (
        <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
          {item.propertyNo || 'PRS-2026-001'}
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
      accessor: () => 1,
      render: () => (
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
          1
        </span>
      ),
    },
    {
      key: 'unit',
      header: 'Unit',
      dataType: 'text',
      sortable: false,
      accessor: () => 'unit',
      render: () => (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          unit
        </span>
      ),
    },
    {
      key: 'acquisitionCost',
      header: 'Acquisition Cost',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.acquisitionCost || 50000,
      render: (item) => (
        <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
          ₱{item.acquisitionCost ? item.acquisitionCost.toLocaleString() : '50,000'}
        </span>
      ),
    },
    buildEDeviceActionColumn(slipId, isSlipApproved),
  ];

  const buildRrspColumns = (
    slipId: string,
    slipDepartment: string,
    isSlipApproved: boolean
  ): DataTableColumn<SlipItem>[] => [
    {
      key: 'deviceName',
      header: 'Item Description',
      dataType: 'identifier',
      pin: 'left',
      sortable: false,
      accessor: (item) => item.deviceName,
      render: (item) => (
        <span className="font-bold text-gray-900 dark:text-white">
          {item.deviceName}
        </span>
      ),
    },
    {
      key: 'icsNo',
      header: 'ICS / Serial No.',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.icsNo || 'ICS-2026-998',
      render: (item) => (
        <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
          {item.icsNo || 'ICS-2026-998'}
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
      accessor: (item) => item.endUser || 'Juan Dela Cruz',
      render: (item) => (
        <span className="text-xs text-gray-700 dark:text-gray-300">
          {item.endUser || 'Juan Dela Cruz'}
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
    buildEDeviceActionColumn(slipId, isSlipApproved),
  ];

  return (
    <div className="space-y-6">
      {/* Header Title Section & Pending Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">Return Slips</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Manage and review Property Return Slips (PRS) and Receipt of Returned Property Semi-Expendable (RRSP) submitted by departments.
          </p>
        </div>

      </div>

      {/* Toolbar: Filter Buttons (PRS/RRSP) & Compact Search Bar */}
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

      {/* SECTION 1: Property Return Slips (PRS) */}
      {(activeFilter === 'ALL' || activeFilter === 'PRS') && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-emerald-600" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Property Return Slips (PRS)
              </h2>
            </div>
            {renderStatusFilterButtons()}
          </div>

          {prsSlips.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
              No PRS return slips found.
            </div>
          ) : (
            prsSlips.map((slip) => {
              const isCollapsed = collapsedSlips[slip.trackingCode] ?? true;
              const isPending = slip.status === 'Pending Admin Approval';
              const firstItemReason = slip.items[0]?.returnReason || 'Unserviceable';

              return (
                <div
                  key={slip.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
                >
                  <div
                    onClick={() => toggleSlipCollapse(slip.trackingCode)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 cursor-pointer bg-gray-50/70 dark:bg-gray-800/50 hover:bg-gray-100/60 transition-colors border-b border-gray-100 dark:border-gray-800 gap-3"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
                        {slip.trackingCode}
                      </span>

                      <Badge variant="light" color="error" size="sm">
                        {firstItemReason}
                      </Badge>

                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <span className="text-gray-500 dark:text-gray-400">
                          Custodian: {slip.custodianName} ({slip.items.length} Items)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
                      {!isPending && (
                        <Button
                          variant="outline"
                          size="sm"
                          startIcon={<FileText className="h-3.5 w-3.5 text-emerald-600" />}
                          onClick={() => generatePrsDocx(slip)}
                        >
                          Export Word
                        </Button>
                      )}

                      {isPending ? (
                        <Button
                          variant="primary"
                          size="sm"
                          startIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                          onClick={() => void handleApproveSlip(slip.id)}
                        >
                          Approve
                        </Button>
                      ) : (
                        <span className="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                          Approved
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleSlipCollapse(slip.trackingCode)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 ml-1"
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
                    <div className="p-4">
                      <DataTable
                        columns={buildPrsColumns(slip.id, !isPending)}
                        data={slip.items}
                        getRowId={(item) => item.id}
                        density="default"
                        emptyMessage="No items found in this slip."
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* SECTION 2: Semi-Expendable Property Slips (RRSP) */}
      {(activeFilter === 'ALL' || activeFilter === 'RRSP') && (
        <div className="space-y-4 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Tag className="h-5 w-5 text-blue-600" />
              <h2 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">
                Receipt of Returned Property Semi-Expendable (RRSP)
              </h2>
            </div>
            {activeFilter === 'RRSP' && renderStatusFilterButtons()}
          </div>

          {rrspSlips.length === 0 ? (
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 text-center text-xs text-gray-400">
              No RRSP return slips found.
            </div>
          ) : (
            rrspSlips.map((slip) => {
              const isCollapsed = collapsedSlips[slip.trackingCode] ?? true;
              const isPending = slip.status === 'Pending Admin Approval';

              return (
                <div
                  key={slip.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden"
                >
                  <div
                    onClick={() => toggleSlipCollapse(slip.trackingCode)}
                    className="flex items-center justify-between p-4 cursor-pointer bg-gray-50/70 dark:bg-gray-800/50 hover:bg-gray-100/60 transition-colors border-b border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                        {slip.trackingCode}
                      </span>

                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <span className="text-gray-500 dark:text-gray-400">
                          Custodian: {slip.custodianName} ({slip.items.length} Items)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                      {!isPending && (
                        <Button
                          variant="outline"
                          size="sm"
                          startIcon={<FileText className="h-3.5 w-3.5 text-blue-600" />}
                          onClick={() => generateRrspDocx(slip)}
                        >
                          Export Word
                        </Button>
                      )}

                      {isPending ? (
                        <Button
                          variant="primary"
                          size="sm"
                          startIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                          onClick={() => void handleApproveSlip(slip.id)}
                        >
                          Approve
                        </Button>
                      ) : (
                        <span className="inline-flex h-9 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3.5 text-xs font-semibold text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300">
                          Approved
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleSlipCollapse(slip.trackingCode)}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 ml-1"
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
                    <div className="p-4">
                      <DataTable
                        columns={buildRrspColumns(slip.id, slip.department, !isPending)}
                        data={slip.items}
                        getRowId={(item) => item.id}
                        density="default"
                        emptyMessage="No items found in this slip."
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

export default WorkDispatchView;