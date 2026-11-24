import { useState } from 'react';
import { Search, CheckCircle2, Building2, FileText, ChevronDown, ChevronUp, Package, Tag, Filter } from 'lucide-react';
import { useWorkDispatch } from '../../hooks/admin/useWorkDispatch';
import Badge from '../../components/ui/Badge/badge';
import Button from '../../components/ui/Button/button';
import { DataTable } from '../../components/ui/Table';
import type { DataTableColumn } from '../../components/ui/Table';
import { generatePrsDocx } from './utils/generatePrsDocx';
import { generateRrspDocx } from './utils/generateRrspDocx';

export function WorkDispatchView() {
  const {
    slips,
    searchTerm,
    setSearchTerm,
    handleApproveSlip,
  } = useWorkDispatch();

  type SlipItem = (typeof slips)[number]['items'][number];

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PRS' | 'RRSP'>('ALL');

  const [collapsedSlips, setCollapsedSlips] = useState<Record<string, boolean>>({});

  const toggleSlipCollapse = (trackingCode: string) => {
    setCollapsedSlips((prev) => ({
      ...prev,
      [trackingCode]: !prev[trackingCode],
    }));
  };

  const prsSlips = slips.filter((s) => s.slipType === 'PRS');
  const rrspSlips = slips.filter((s) => s.slipType === 'RRSP');

  const prsColumns: DataTableColumn<SlipItem>[] = [
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
  ];

  const rrspColumns: DataTableColumn<SlipItem>[] = [
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
      accessor: (item) => item.location || 'Office',
      render: (item) => (
        <span className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
          <Building2 className="h-3.5 w-3.5 text-gray-400" />
          {item.location || 'Office'}
        </span>
      ),
    },
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
        <Badge variant="light" color="info" size="md">
          {slips.filter((s) => s.status === 'Pending Admin Approval').length} Pending Approval
        </Badge>
      </div>

      {/* Toolbar: Filter Buttons (PRS/RRSP) & Compact Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm">
        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 flex items-center gap-1 mr-1">
            <Filter className="h-3.5 w-3.5" /> Filter:
          </span>
          <Button
            size="sm"
            variant={activeFilter === 'ALL' ? 'primary' : 'outline'}
            onClick={() => setActiveFilter('ALL')}
          >
            All Slips
          </Button>
          <Button
            size="sm"
            variant={activeFilter === 'PRS' ? 'primary' : 'outline'}
            onClick={() => setActiveFilter('PRS')}
          >
            PRS
          </Button>
          <Button
            size="sm"
            variant={activeFilter === 'RRSP' ? 'primary' : 'outline'}
            onClick={() => setActiveFilter('RRSP')}
          >
            RRSP
          </Button>
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
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-semibold">{slip.department}</span>
                        <span className="text-gray-400">| Custodian: {slip.custodianName} ({slip.items.length} Items)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-end">
                      {isPending ? (
                        <Badge variant="light" color="warning" size="sm">
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="solid" color="success" size="sm">
                          Approved
                        </Badge>
                      )}

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          startIcon={<FileText className="h-3.5 w-3.5 text-emerald-600" />}
                          onClick={() => generatePrsDocx(slip)}
                        >
                          Export Word
                        </Button>

                        {isPending ? (
                          <Button
                            variant="primary"
                            size="sm"
                            startIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                            onClick={() => handleApproveSlip(slip.id)}
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            Approved
                          </Button>
                        )}
                      </div>

                      <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 ml-2">
                        {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="p-4">
                      <DataTable
                        columns={prsColumns}
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
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-800">
                        {slip.trackingCode}
                      </span>
                      <div className="flex items-center gap-2 text-xs text-gray-700 dark:text-gray-300">
                        <Building2 className="h-3.5 w-3.5 text-gray-400" />
                        <span className="font-semibold">{slip.department}</span>
                        <span className="text-gray-400">| Custodian: {slip.custodianName} ({slip.items.length} Items)</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {isPending ? (
                        <Badge variant="light" color="warning" size="sm">
                          Pending
                        </Badge>
                      ) : (
                        <Badge variant="solid" color="success" size="sm">
                          Approved
                        </Badge>
                      )}

                      <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="sm"
                          startIcon={<FileText className="h-3.5 w-3.5 text-blue-600" />}
                          onClick={() => generateRrspDocx(slip)}
                        >
                          Export Word
                        </Button>

                        {isPending ? (
                          <Button
                            variant="primary"
                            size="sm"
                            startIcon={<CheckCircle2 className="h-3.5 w-3.5" />}
                            onClick={() => handleApproveSlip(slip.id)}
                          >
                            Approve
                          </Button>
                        ) : (
                          <Button variant="outline" size="sm" disabled>
                            Approved
                          </Button>
                        )}
                      </div>

                      <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 ml-2">
                        {isCollapsed ? <ChevronDown className="h-5 w-5" /> : <ChevronUp className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {!isCollapsed && (
                    <div className="p-4">
                      <DataTable
                        columns={rrspColumns}
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