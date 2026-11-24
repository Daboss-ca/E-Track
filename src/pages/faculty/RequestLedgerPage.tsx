import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  ChevronDown,
  ChevronUp,
  Package,
  Tag,
  Filter,
  CheckCircle2,
  Loader2,
  AlertCircle,
  MessageSquareWarning,
  Pencil,
  Send,
  X,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Badge from '../../components/ui/Badge/badge';
import { DataTable } from '../../components/ui/Table';
import type { DataTableColumn } from '../../components/ui/Table';

interface RequestLedgerPageProps {
  currentNav?: string;
  onNavigate?: (view: string) => void;
}

interface LedgerSlipItem {
  id: string;
  slipId: string;
  deviceName: string;
  quantity: number;
  unit: string;
  acquisitionCost: number;
  propertyNo: string;
  icsNo: string;
  propertyTag: string;
  returnReason: 'Unserviceable' | 'No longer needed' | 'Reassignment' | 'Other';
  dateAcquired: string;
  endUser: string;
  location: string;
  isRejectedItem: boolean;
  rejectionFeedback: string;
}

interface LedgerReturnSlip {
  id: string;
  trackingCode: string;
  slipType: 'PRS' | 'RRSP';
  department: string;
  custodianName: string;
  returnedBy: string;
  validatedDate: string;
  status: string;
  custodianRemarks: string;
  items: LedgerSlipItem[];
}

interface EditableItemFields {
  deviceName: string;
  propertyNo: string;
  icsNo: string;
  dateAcquired: string;
  quantity: number;
  unit: string;
  acquisitionCost: number;
  endUser: string;
  location: string;
}

interface ItemEditDraft extends EditableItemFields {
  itemId: string;
  slipId: string;
  slipType: 'PRS' | 'RRSP';
  original: EditableItemFields;
}

interface DbReturnSlipItem {
  id: string;
  slip_id: string;
  device_name: string;
  quantity: number | null;
  unit: string | null;
  acquisition_cost: number | string | null;
  property_no: string | null;
  ics_no: string | null;
  property_tag?: string | null;
  return_reason: LedgerSlipItem['returnReason'] | null;
  date_acquired: string | null;
  end_user: string | null;
  location: string | null;
  is_rejected_item?: boolean | null;
  rejection_feedback?: string | null;
}

interface DbReturnSlip {
  id: string;
  tracking_code: string;
  slip_type: 'PRS' | 'RRSP';
  department: string;
  custodian_name: string;
  returned_by?: string | null;
  validated_date: string;
  created_at?: string;
  status: string;
  custodian_remarks?: string | null;
  return_slip_items?: DbReturnSlipItem[];
}

function mapSlips(rows: DbReturnSlip[]): LedgerReturnSlip[] {
  return rows.map((row) => {
    const items: LedgerSlipItem[] = (row.return_slip_items || []).map((item) => {
      const tag =
        row.slip_type === 'PRS'
          ? item.property_tag || item.property_no || ''
          : item.property_tag || item.ics_no || '';

      return {
        id: item.id,
        slipId: row.id,
        deviceName: item.device_name,
        quantity: row.slip_type === 'PRS' ? 1 : item.quantity || 1,
        unit: item.unit || 'unit',
        acquisitionCost: Number(item.acquisition_cost) || 0,
        propertyNo: item.property_no || (row.slip_type === 'PRS' ? tag : ''),
        icsNo: item.ics_no || (row.slip_type === 'RRSP' ? tag : ''),
        propertyTag: tag,
        returnReason: item.return_reason || 'Unserviceable',
        dateAcquired: item.date_acquired || row.validated_date || '2026-11-24',
        endUser: item.end_user || row.returned_by || 'End-User',
        location: item.location || row.department,
        isRejectedItem: Boolean(item.is_rejected_item),
        rejectionFeedback: item.rejection_feedback || '',
      };
    });

    const itemFeedbackSummary = items
      .filter((i) => i.isRejectedItem && i.rejectionFeedback)
      .map((i) => `${i.deviceName}: ${i.rejectionFeedback}`)
      .join(' | ');

    return {
      id: row.id,
      trackingCode: row.tracking_code,
      slipType: row.slip_type,
      department: row.department || 'N/A',
      custodianName: row.custodian_name || 'Property Custodian',
      returnedBy: row.returned_by || items[0]?.endUser || 'End-User',
      validatedDate: row.validated_date || (row.created_at ? row.created_at.slice(0, 10) : ''),
      status: row.status,
      custodianRemarks: row.custodian_remarks || itemFeedbackSummary || '',
      items,
    };
  });
}

const RequestLedgerPage: React.FC<RequestLedgerPageProps> = () => {
  const [slips, setSlips] = useState<LedgerReturnSlip[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'PRS' | 'RRSP'>('ALL');
  const [collapsedSlips, setCollapsedSlips] = useState<Record<string, boolean>>({});

  // Multi-row inline edit state keyed by itemId so multiple rejected items can be edited simultaneously
  const [editingDrafts, setEditingDrafts] = useState<Record<string, ItemEditDraft>>({});
  const [submittingSlipId, setSubmittingSlipId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchSlips = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('return_slips')
        .select('*, return_slip_items(*)')
        .order('created_at', { ascending: false });

      if (error) {
        setErrorMessage(error.message);
        setSlips([]);
        return;
      }

      setSlips(mapSlips((data as DbReturnSlip[]) || []));
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to load return slips from database.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadInitial = async () => {
      try {
        const { data, error } = await supabase
          .from('return_slips')
          .select('*, return_slip_items(*)')
          .order('created_at', { ascending: false });

        if (!active) return;

        if (error) {
          setErrorMessage(error.message);
          setSlips([]);
          return;
        }

        setSlips(mapSlips((data as DbReturnSlip[]) || []));
      } catch (err: unknown) {
        if (!active) return;
        setErrorMessage(
          err instanceof Error ? err.message : 'Failed to load return slips from database.'
        );
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInitial();

    const channel = supabase
      .channel('enduser-return-slips-ledger-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'return_slips' },
        () => {
          if (active) {
            void fetchSlips();
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [fetchSlips]);

  const toggleSlipCollapse = (trackingCode: string) => {
    setCollapsedSlips((prev) => ({
      ...prev,
      [trackingCode]: !prev[trackingCode],
    }));
  };

  const startRowEdit = (slip: LedgerReturnSlip, item: LedgerSlipItem) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const baseFields: EditableItemFields = {
      deviceName: item.deviceName,
      propertyNo: item.propertyTag || item.propertyNo || 'PRS-2026-001',
      icsNo: item.propertyTag || item.icsNo || 'ICS-2026-998',
      dateAcquired: item.dateAcquired || slip.validatedDate || '2026-11-24',
      quantity: slip.slipType === 'PRS' ? 1 : item.quantity || 1,
      unit: item.unit || 'unit',
      acquisitionCost: item.acquisitionCost || 0,
      endUser: item.endUser || slip.returnedBy || 'End-User',
      location: item.location || slip.department,
    };

    setEditingDrafts((prev) => ({
      ...prev,
      [item.id]: {
        itemId: item.id,
        slipId: slip.id,
        slipType: slip.slipType,
        ...baseFields,
        original: { ...baseFields },
      },
    }));
  };

  const cancelRowEdit = (itemId: string) => {
    setErrorMessage(null);
    setEditingDrafts((prev) => {
      const next = { ...prev };
      delete next[itemId];
      return next;
    });
  };

  const updateDraftField = <K extends keyof EditableItemFields>(
    itemId: string,
    field: K,
    value: EditableItemFields[K]
  ) => {
    setEditingDrafts((prev) => {
      const current = prev[itemId];
      if (!current) return prev;
      return {
        ...prev,
        [itemId]: {
          ...current,
          [field]: value,
        },
      };
    });
  };

  const isDraftChanged = (draft: ItemEditDraft): boolean => {
    const { original } = draft;

    if (draft.slipType === 'PRS') {
      return (
        draft.deviceName.trim() !== original.deviceName.trim() ||
        draft.propertyNo.trim() !== original.propertyNo.trim() ||
        draft.dateAcquired.trim() !== original.dateAcquired.trim() ||
        draft.unit.trim() !== original.unit.trim() ||
        Number(draft.acquisitionCost) !== Number(original.acquisitionCost)
      );
    }

    return (
      draft.deviceName.trim() !== original.deviceName.trim() ||
      draft.icsNo.trim() !== original.icsNo.trim() ||
      Number(draft.quantity) !== Number(original.quantity) ||
      draft.endUser.trim() !== original.endUser.trim() ||
      draft.location.trim() !== original.location.trim()
    );
  };

  const getChangedDraftsForSlip = (slipId: string): ItemEditDraft[] =>
    Object.values(editingDrafts).filter(
      (draft) => draft.slipId === slipId && isDraftChanged(draft)
    );

  const handleResubmitSlipChanges = async (slip: LedgerReturnSlip) => {
    const changedDrafts = getChangedDraftsForSlip(slip.id);
    if (changedDrafts.length === 0) return;

    if (changedDrafts.some((d) => !d.deviceName.trim())) {
      setErrorMessage('Item description cannot be empty on any edited row.');
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setSubmittingSlipId(slip.id);

    try {
      for (const draft of changedDrafts) {
        const originalItem = slip.items.find((i) => i.id === draft.itemId);
        const isPrs = draft.slipType === 'PRS';
        const finalQty = isPrs ? 1 : Math.max(1, Number(draft.quantity) || 1);
        const finalPropNo = draft.propertyNo.trim() || null;
        const finalIcsNo = draft.icsNo.trim() || null;
        const finalTag = isPrs ? finalPropNo : finalIcsNo;

        const { error: itemErr } = await supabase
          .from('return_slip_items')
          .update({
            device_name: draft.deviceName.trim(),
            property_no: isPrs ? finalPropNo : originalItem?.propertyNo || null,
            ics_no: !isPrs ? finalIcsNo : originalItem?.icsNo || null,
            property_tag: finalTag,
            date_acquired: isPrs
              ? draft.dateAcquired.trim() || null
              : originalItem?.dateAcquired || null,
            quantity: finalQty,
            unit: isPrs ? draft.unit.trim() || 'unit' : originalItem?.unit || 'unit',
            acquisition_cost: isPrs
              ? Number(draft.acquisitionCost) || 0
              : originalItem?.acquisitionCost || 0,
            end_user: !isPrs ? draft.endUser.trim() || null : originalItem?.endUser || null,
            location: !isPrs ? draft.location.trim() || null : originalItem?.location || null,
            is_rejected_item: false,
            rejection_feedback: null,
          })
          .eq('id', draft.itemId);

        if (itemErr) throw itemErr;
      }

      const { error: slipErr } = await supabase
        .from('return_slips')
        .update({
          status: 'Pending Custodian Approval',
          custodian_remarks: null,
        })
        .eq('id', slip.id);

      if (slipErr) throw slipErr;

      setEditingDrafts((prev) => {
        const next = { ...prev };
        for (const d of changedDrafts) {
          delete next[d.itemId];
        }
        return next;
      });

      setSuccessMessage(
        `Resubmitted ${changedDrafts.length} updated ${
          changedDrafts.length === 1 ? 'item' : 'items'
        } on ${slip.trackingCode} to Custodian.`
      );
      await fetchSlips();
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to resubmit edited items.'
      );
    } finally {
      setSubmittingSlipId(null);
    }
  };

  const getFilterButtonClass = (isActive: boolean) =>
    isActive
      ? 'inline-flex h-8 items-center justify-center rounded-lg border border-gray-300 bg-gray-200 px-3 text-xs font-semibold text-gray-900 hover:bg-gray-300 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
      : 'inline-flex h-8 items-center justify-center rounded-lg border border-gray-200 bg-white px-3 text-xs font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-white';

  const buildActionColumn = (
    slip: LedgerReturnSlip,
    slipRejected: boolean
  ): DataTableColumn<LedgerSlipItem> => ({
    key: 'action',
    header: 'Action',
    dataType: 'text',
    sortable: false,
    accessor: (item) => (item.isRejectedItem && slipRejected ? 'Editable' : '—'),
    render: (item) => {
      const canEditThisRow = slipRejected && item.isRejectedItem;
      const draft = editingDrafts[item.id];
      const isSubmittingSlip = submittingSlipId === slip.id;

      if (!canEditThisRow) {
        return <span className="text-xs text-gray-400 dark:text-gray-500">—</span>;
      }

      if (draft) {
        return (
          <div
            className="inline-flex items-center gap-1.5"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              disabled={isSubmittingSlip}
              onClick={() => cancelRowEdit(item.id)}
              className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
              Cancel
            </button>
          </div>
        );
      }

      return (
        <div onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => startRowEdit(slip, item)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-50/80 px-2.5 py-1.5 text-xs font-semibold text-amber-800 hover:bg-amber-600 hover:text-white dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300 dark:hover:bg-amber-600 dark:hover:text-white transition-colors cursor-pointer"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </button>
        </div>
      );
    },
  });

  // PRS: Lahat editable maliban sa Qty (default na 1)
  const buildPrsColumns = (
    slip: LedgerReturnSlip,
    slipRejected: boolean
  ): DataTableColumn<LedgerSlipItem>[] => [
    {
      key: 'deviceName',
      header: 'Item Description',
      dataType: 'identifier',
      pin: 'left',
      sortable: false,
      accessor: (item) => item.deviceName,
      render: (item) => {
        const draft = editingDrafts[item.id];
        if (draft) {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={draft.deviceName}
                onChange={(e) => updateDraftField(item.id, 'deviceName', e.target.value)}
                className="w-full min-w-[160px] rounded-lg border border-amber-400 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-amber-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          );
        }

        return (
          <span
            className={`font-bold ${
              item.isRejectedItem && slipRejected
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {item.deviceName}
          </span>
        );
      },
    },
    {
      key: 'propertyNo',
      header: 'Property No.',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.propertyTag || item.propertyNo || 'PRS-2026-001',
      render: (item) => {
        const draft = editingDrafts[item.id];
        if (draft) {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={draft.propertyNo}
                onChange={(e) => updateDraftField(item.id, 'propertyNo', e.target.value)}
                className="w-32 rounded-lg border border-amber-400 bg-white px-2 py-1.5 text-xs font-mono text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-amber-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          );
        }

        return (
          <span className="text-xs font-mono text-emerald-600 dark:text-emerald-400">
            {item.propertyTag || item.propertyNo || 'PRS-2026-001'}
          </span>
        );
      },
    },
    {
      key: 'dateAcquired',
      header: 'Date Acquired',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.dateAcquired || slip.validatedDate || '2026-11-24',
      render: (item) => {
        const draft = editingDrafts[item.id];
        if (draft) {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="date"
                value={draft.dateAcquired}
                onChange={(e) => updateDraftField(item.id, 'dateAcquired', e.target.value)}
                className="rounded-lg border border-amber-400 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-amber-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          );
        }

        return (
          <span className="text-xs text-gray-700 dark:text-gray-300 font-medium">
            {item.dateAcquired || slip.validatedDate || '2026-11-24'}
          </span>
        );
      },
    },
    {
      key: 'quantity',
      header: 'Qty',
      dataType: 'text',
      sortable: false,
      accessor: () => 1,
      render: () => (
        <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">1</span>
      ),
    },
    {
      key: 'unit',
      header: 'Unit',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.unit || 'unit',
      render: (item) => {
        const draft = editingDrafts[item.id];
        if (draft) {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={draft.unit}
                onChange={(e) => updateDraftField(item.id, 'unit', e.target.value)}
                className="w-20 rounded-lg border border-amber-400 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-amber-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          );
        }

        return (
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {item.unit || 'unit'}
          </span>
        );
      },
    },
    {
      key: 'acquisitionCost',
      header: 'Acquisition Cost',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.acquisitionCost || 0,
      render: (item) => {
        const draft = editingDrafts[item.id];
        if (draft) {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                min={0}
                step="any"
                value={draft.acquisitionCost}
                onChange={(e) =>
                  updateDraftField(item.id, 'acquisitionCost', Number(e.target.value) || 0)
                }
                className="w-28 rounded-lg border border-amber-400 bg-white px-2 py-1.5 text-xs font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-amber-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          );
        }

        return (
          <span className="text-xs font-medium text-gray-800 dark:text-gray-200">
            ₱{item.acquisitionCost ? item.acquisitionCost.toLocaleString() : '0'}
          </span>
        );
      },
    },
    buildActionColumn(slip, slipRejected),
  ];

  // RRSP: Lahat editable
  const buildRrspColumns = (
    slip: LedgerReturnSlip,
    slipRejected: boolean
  ): DataTableColumn<LedgerSlipItem>[] => [
    {
      key: 'deviceName',
      header: 'Item Description',
      dataType: 'identifier',
      pin: 'left',
      sortable: false,
      accessor: (item) => item.deviceName,
      render: (item) => {
        const draft = editingDrafts[item.id];
        if (draft) {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={draft.deviceName}
                onChange={(e) => updateDraftField(item.id, 'deviceName', e.target.value)}
                className="w-full min-w-[160px] rounded-lg border border-amber-400 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-amber-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          );
        }

        return (
          <span
            className={`font-bold ${
              item.isRejectedItem && slipRejected
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {item.deviceName}
          </span>
        );
      },
    },
    {
      key: 'icsNo',
      header: 'ICS / Serial No.',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.propertyTag || item.icsNo || 'ICS-2026-998',
      render: (item) => {
        const draft = editingDrafts[item.id];
        if (draft) {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={draft.icsNo}
                onChange={(e) => updateDraftField(item.id, 'icsNo', e.target.value)}
                className="w-32 rounded-lg border border-amber-400 bg-white px-2 py-1.5 text-xs font-mono text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-amber-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          );
        }

        return (
          <span className="text-xs font-mono text-blue-600 dark:text-blue-400">
            {item.propertyTag || item.icsNo || 'ICS-2026-998'}
          </span>
        );
      },
    },
    {
      key: 'quantity',
      header: 'Quantity',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.quantity || 1,
      render: (item) => {
        const draft = editingDrafts[item.id];
        if (draft) {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="number"
                min={1}
                value={draft.quantity}
                onChange={(e) =>
                  updateDraftField(item.id, 'quantity', Number(e.target.value) || 1)
                }
                className="w-20 rounded-lg border border-amber-400 bg-white px-2 py-1.5 text-xs font-semibold text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-amber-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          );
        }

        return (
          <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">
            {item.quantity || 1}
          </span>
        );
      },
    },
    {
      key: 'endUser',
      header: 'End-User',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.endUser || slip.returnedBy || 'End-User',
      render: (item) => {
        const draft = editingDrafts[item.id];
        if (draft) {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={draft.endUser}
                onChange={(e) => updateDraftField(item.id, 'endUser', e.target.value)}
                className="w-32 rounded-lg border border-amber-400 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-amber-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          );
        }

        return (
          <span className="text-xs text-gray-700 dark:text-gray-300">
            {item.endUser || slip.returnedBy || 'End-User'}
          </span>
        );
      },
    },
    {
      key: 'location',
      header: 'Location / Office',
      dataType: 'text',
      sortable: false,
      accessor: (item) => item.location || slip.department,
      render: (item) => {
        const draft = editingDrafts[item.id];
        if (draft) {
          return (
            <div onClick={(e) => e.stopPropagation()}>
              <input
                type="text"
                value={draft.location}
                onChange={(e) => updateDraftField(item.id, 'location', e.target.value)}
                className="w-36 rounded-lg border border-amber-400 bg-white px-2 py-1.5 text-xs text-gray-900 focus:border-emerald-500 focus:outline-none dark:border-amber-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
          );
        }

        return (
          <span className="text-xs text-gray-700 dark:text-gray-300">
            {item.location || slip.department}
          </span>
        );
      },
    },
    buildActionColumn(slip, slipRejected),
  ];

  const renderSlipCard = (slip: LedgerReturnSlip, variant: 'PRS' | 'RRSP') => {
    const isCollapsed = collapsedSlips[slip.trackingCode] ?? false;
    const slipRejected = slip.status.toLowerCase() === 'rejected by custodian';
    const rejectedCount = slip.items.filter((i) => i.isRejectedItem).length;
    const firstItemReason = slip.items[0]?.returnReason || 'Unserviceable';
    const changedDrafts = getChangedDraftsForSlip(slip.id);
    const isSubmittingSlip = submittingSlipId === slip.id;

    const codeBadgeClasses =
      variant === 'PRS'
        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800'
        : 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800';

    const statusBadgeClasses = slipRejected
      ? 'bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800'
      : slip.status.toLowerCase().includes('approved')
        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800'
        : 'bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';

    return (
      <div
        key={slip.id}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden transition-all"
      >
        <div
          onClick={() => toggleSlipCollapse(slip.trackingCode)}
          className="px-5 py-4 cursor-pointer bg-gray-50/80 dark:bg-gray-800/40 hover:bg-gray-100/70 dark:hover:bg-gray-800/70 transition-colors border-b border-gray-100 dark:border-gray-800 space-y-2.5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
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
                {slip.department} • {slip.returnedBy} • {slip.items.length}{' '}
                {slip.items.length === 1 ? 'Item' : 'Items'}
              </span>

              {rejectedCount > 0 && slipRejected && (
                <Badge variant="light" color="error" size="sm">
                  {rejectedCount} {rejectedCount === 1 ? 'Item' : 'Items'} Rejected
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2.5 justify-end">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold ${statusBadgeClasses}`}
              >
                {slip.status}
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

          {slipRejected && slip.custodianRemarks && (
            <div className="flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50/90 px-3.5 py-2 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
              <MessageSquareWarning className="h-4 w-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
              <div>
                <span className="font-semibold">Custodian Feedback:</span>{' '}
                <span>{slip.custodianRemarks}</span>
              </div>
            </div>
          )}
        </div>

        {!isCollapsed && (
          <div className="p-4 sm:p-5 space-y-4">
            <DataTable
              columns={
                variant === 'PRS'
                  ? buildPrsColumns(slip, slipRejected)
                  : buildRrspColumns(slip, slipRejected)
              }
              data={slip.items}
              getRowId={(item) => item.id}
              density="default"
              emptyMessage="No items found in this return slip."
            />

            {changedDrafts.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50/70 px-4 py-3 dark:border-emerald-900/60 dark:bg-emerald-950/20">
                <span className="text-xs font-medium text-emerald-800 dark:text-emerald-300">
                  {changedDrafts.length} edited {changedDrafts.length === 1 ? 'item' : 'items'} ready to resubmit.
                </span>

                <button
                  type="button"
                  disabled={isSubmittingSlip}
                  onClick={() => void handleResubmitSlipChanges(slip)}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
                >
                  {isSubmittingSlip ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                  {isSubmittingSlip
                    ? 'Resubmitting...'
                    : `Resubmit${changedDrafts.length > 1 ? ` (${changedDrafts.length})` : ''}`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredSlips = slips.filter((s) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      s.trackingCode.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.returnedBy.toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q) ||
      s.custodianRemarks.toLowerCase().includes(q) ||
      s.items.some((item) => item.deviceName.toLowerCase().includes(q))
    );
  });

  const prsSlips = filteredSlips.filter((s) => s.slipType === 'PRS');
  const rrspSlips = filteredSlips.filter((s) => s.slipType === 'RRSP');

  return (
    <div className="space-y-6 p-3 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Return Slips Ledger
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            View your submitted PRS and RRSP return slips, check custodian feedback in the slip header, and edit rejected items inline.
          </p>
        </div>
      </div>

      {errorMessage && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-medium text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/30 dark:text-rose-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{errorMessage}</span>
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
            placeholder="Search code, item, or status..."
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

export default RequestLedgerPage;