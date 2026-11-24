import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { type CvsuIctCategory } from '../../utils/admin/deviceCatalog';
import { useInventoryControl } from './useInventoryControl';

export interface ReturnSlipItem {
  id: string;
  deviceName: string;
  quantity: number;
  unit: string;
  acquisitionCost: number;
  isEDevice?: boolean;
  ictCategory?: CvsuIctCategory | null;
  propertyNo?: string;
  returnReason?: 'Unserviceable' | 'No longer needed' | 'Reassignment' | 'Other';
  dateAcquired?: string;
  icsNo?: string;
  endUser?: string;
  location?: string;
  isRejectedItem?: boolean;
  rejectionFeedback?: string;
}

export interface ValidatedReturnSlip {
  id: string;
  trackingCode: string;
  slipType: 'PRS' | 'RRSP';
  department: string;
  custodianName: string;
  validatedDate: string;
  status: 'Pending Admin Approval' | 'Approved' | 'Rejected';
  items: ReturnSlipItem[];
}

interface ReturnSlipItemRow {
  id: string;
  slip_id: string;
  device_name: string;
  is_e_device: boolean | null;
  ict_category: CvsuIctCategory | null;
  quantity: number;
  unit: string;
  acquisition_cost: number | string;
  property_no: string | null;
  ics_no: string | null;
  return_reason: ReturnSlipItem['returnReason'] | null;
  date_acquired: string | null;
  end_user: string | null;
  location: string | null;
  is_rejected_item?: boolean | null;
  rejection_feedback?: string | null;
}

interface ReturnSlipRow {
  id: string;
  tracking_code: string;
  slip_type: 'PRS' | 'RRSP';
  department: string;
  custodian_name: string;
  validated_date: string;
  status: ValidatedReturnSlip['status'];
  return_slip_items?: ReturnSlipItemRow[];
}

const ADMIN_VISIBLE_STATUSES = ['Pending Admin Approval', 'Approved'];

function mapRowToSlip(row: ReturnSlipRow): ValidatedReturnSlip {
  const mappedItems: ReturnSlipItem[] = (row.return_slip_items || []).map((itemRow) => {
    const resolvedIsEDevice = Boolean(itemRow.is_e_device);
    const resolvedCategory = resolvedIsEDevice ? (itemRow.ict_category ?? null) : null;

    return {
      id: itemRow.id,
      deviceName: itemRow.device_name,
      quantity: itemRow.quantity || 1,
      unit: itemRow.unit || 'unit',
      acquisitionCost: Number(itemRow.acquisition_cost) || 0,
      isEDevice: resolvedIsEDevice,
      ictCategory: resolvedCategory,
      propertyNo: itemRow.property_no ?? undefined,
      returnReason: itemRow.return_reason ?? undefined,
      dateAcquired: itemRow.date_acquired ?? undefined,
      icsNo: itemRow.ics_no ?? undefined,
      endUser: itemRow.end_user ?? undefined,
      location: itemRow.location || row.department,
      isRejectedItem: Boolean(itemRow.is_rejected_item),
      rejectionFeedback: itemRow.rejection_feedback ?? undefined,
    };
  });

  return {
    id: row.id,
    trackingCode: row.tracking_code,
    slipType: row.slip_type,
    department: row.department,
    custodianName: row.custodian_name,
    validatedDate: row.validated_date,
    status: row.status,
    items: mappedItems,
  };
}

export function useWorkDispatch() {
  const [slips, setSlips] = useState<ValidatedReturnSlip[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const { syncEDevicesFromApprovedSlip } = useInventoryControl();

  const refreshSlips = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('return_slips')
        .select('*, return_slip_items(*)')
        .in('status', ADMIN_VISIBLE_STATUSES)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch return slips:', error.message);
        setSlips([]);
        return;
      }

      setSlips(((data as ReturnSlipRow[]) || []).map(mapRowToSlip));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialSlips() {
      const { data, error } = await supabase
        .from('return_slips')
        .select('*, return_slip_items(*)')
        .in('status', ADMIN_VISIBLE_STATUSES)
        .order('created_at', { ascending: false });

      if (!active) return;

      if (error) {
        console.error('Failed to load return slips:', error.message);
        setSlips([]);
      } else {
        setSlips(((data as ReturnSlipRow[]) || []).map(mapRowToSlip));
      }
      setLoading(false);
    }

    void loadInitialSlips();

    const channel = supabase
      .channel('admin-return-slips-queue')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'return_slips' },
        () => {
          void refreshSlips();
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [refreshSlips]);

  const filteredSlips = useMemo(() => {
    return slips.filter(
      (slip) =>
        slip.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.items.some((item) => item.deviceName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [slips, searchTerm]);

  const handleToggleItemEDevice = useCallback(
    async (
      slipId: string,
      itemId: string,
      nextIsEDevice: boolean,
      nextCategory?: CvsuIctCategory | null
    ) => {
      const resolvedCategory: CvsuIctCategory | null = nextIsEDevice
        ? (nextCategory ?? null)
        : null;

      setSlips((prev) =>
        prev.map((slip) => {
          if (slip.id !== slipId) return slip;
          return {
            ...slip,
            items: slip.items.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    isEDevice: nextIsEDevice,
                    ictCategory: resolvedCategory,
                  }
                : item
            ),
          };
        })
      );

      const { error } = await supabase
        .from('return_slip_items')
        .update({
          is_e_device: nextIsEDevice,
          ict_category: resolvedCategory,
        })
        .eq('id', itemId);

      if (error) {
        console.error('Failed to update item E-Device flag:', error.message);
      }
    },
    []
  );

  const handleApproveSlip = useCallback(
    async (slipId: string) => {
      const targetSlip = slips.find((s) => s.id === slipId);
      if (!targetSlip) return;

      const { error } = await supabase
        .from('return_slips')
        .update({ status: 'Approved' })
        .eq('id', slipId);

      if (error) {
        console.error('Failed to update return_slips status:', error.message);
        return;
      }

      setSlips((prev) =>
        prev.map((item) =>
          item.id === slipId ? { ...item, status: 'Approved' } : item
        )
      );

      const checkedEDeviceItems = targetSlip.items.filter(
        (item) => Boolean(item.isEDevice) && Boolean(item.ictCategory)
      );

      await syncEDevicesFromApprovedSlip({
        id: targetSlip.id,
        trackingCode: targetSlip.trackingCode,
        custodianName: targetSlip.custodianName,
        items: checkedEDeviceItems,
      });
    },
    [slips, syncEDevicesFromApprovedSlip]
  );

  return {
    slips: filteredSlips,
    loading,
    searchTerm,
    setSearchTerm,
    handleToggleItemEDevice,
    handleApproveSlip,
    refreshSlips,
  };
}