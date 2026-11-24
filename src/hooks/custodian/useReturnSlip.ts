import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export interface CustodianReturnSlipItem {
  id: string;
  slipId: string;
  deviceName: string;
  quantity: number;
  unit: string;
  acquisitionCost: number;
  propertyNo: string;
  icsNo: string;
  propertyTag: string;
  serialNumber: string;
  returnReason: 'Unserviceable' | 'No longer needed' | 'Reassignment' | 'Other';
  dateAcquired: string;
  endUser: string;
  location: string;
  isRejectedItem: boolean;
  rejectionFeedback: string;
}

export interface CustodianReturnSlip {
  id: string;
  trackingCode: string;
  slipType: 'PRS' | 'RRSP';
  department: string;
  custodianName: string;
  returnedBy: string;
  validatedDate: string;
  status: string;
  items: CustodianReturnSlipItem[];
}

interface SlipItemRecord {
  id: string;
  slip_id: string;
  device_name: string;
  quantity: number | null;
  unit: string | null;
  acquisition_cost: number | string | null;
  property_no: string | null;
  ics_no: string | null;
  property_tag: string | null;
  serial_number: string | null;
  return_reason: CustodianReturnSlipItem['returnReason'] | null;
  date_acquired: string | null;
  end_user: string | null;
  location: string | null;
  is_rejected_item?: boolean | null;
  rejection_feedback?: string | null;
}

interface ReturnSlipRecord {
  id: string;
  tracking_code: string;
  slip_type: 'PRS' | 'RRSP';
  department: string;
  custodian_name: string;
  returned_by?: string | null;
  validated_date: string;
  created_at?: string;
  status: string;
  return_slip_items?: SlipItemRecord[];
}

function mapSlipRecords(rows: ReturnSlipRecord[]): CustodianReturnSlip[] {
  return rows.map((row) => {
    const items = (row.return_slip_items || []).map((item) => {
      const existingTag =
        row.slip_type === 'PRS'
          ? item.property_tag || item.property_no || ''
          : item.property_tag || item.ics_no || '';

      return {
        id: item.id,
        slipId: row.id,
        deviceName: item.device_name,
        quantity: item.quantity || 1,
        unit: item.unit || 'unit',
        acquisitionCost: Number(item.acquisition_cost) || 0,
        propertyNo: item.property_no || '',
        icsNo: item.ics_no || '',
        propertyTag: existingTag,
        serialNumber: item.serial_number || '',
        returnReason: item.return_reason || 'Unserviceable',
        dateAcquired: item.date_acquired || '',
        endUser: item.end_user || row.returned_by || '',
        location: item.location || row.department,
        isRejectedItem: Boolean(item.is_rejected_item),
        rejectionFeedback: item.rejection_feedback || '',
      };
    });

    const firstEndUser = items.find((i) => i.endUser)?.endUser;

    return {
      id: row.id,
      trackingCode: row.tracking_code,
      slipType: row.slip_type,
      department: row.department || 'N/A',
      custodianName: row.custodian_name || 'Property Custodian',
      returnedBy: firstEndUser || row.returned_by || 'End-User',
      validatedDate: row.validated_date || (row.created_at ? row.created_at.slice(0, 10) : ''),
      status: row.status,
      items,
    };
  });
}

export const useReturnSlip = (propRequestId?: string) => {
  const activeSlipId =
    propRequestId || localStorage.getItem('custodian_active_request_id') || null;

  const [slips, setSlips] = useState<CustodianReturnSlip[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [submittingSlipId, setSubmittingSlipId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadSlips = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('return_slips')
        .select('*, return_slip_items(*)')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setSlips(mapSlipRecords((data as ReturnSlipRecord[]) || []));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load return slips from database.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadInitialSlips = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('return_slips')
          .select('*, return_slip_items(*)')
          .order('created_at', { ascending: false });

        if (!active) return;
        if (fetchError) throw fetchError;

        setSlips(mapSlipRecords((data as ReturnSlipRecord[]) || []));
      } catch (err: unknown) {
        if (!active) return;
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to load return slips from database.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInitialSlips();

    const channel = supabase
      .channel('custodian-return-slips-checker-sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'return_slips' },
        () => {
          if (active) {
            void loadSlips();
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [loadSlips]);

  const handleToggleItemReject = useCallback((slipId: string, itemId: string, rejected: boolean) => {
    setError(null);
    setSuccessMessage(null);

    setSlips((prev) =>
      prev.map((slip) =>
        slip.id === slipId
          ? {
              ...slip,
              items: slip.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      isRejectedItem: rejected,
                      rejectionFeedback: rejected ? item.rejectionFeedback : '',
                    }
                  : item
              ),
            }
          : slip
      )
    );
  }, []);

  const handleItemFeedbackChange = useCallback(
    (slipId: string, itemId: string, feedback: string) => {
      setError(null);
      setSlips((prev) =>
        prev.map((slip) =>
          slip.id === slipId
            ? {
                ...slip,
                items: slip.items.map((item) =>
                  item.id === itemId ? { ...item, rejectionFeedback: feedback } : item
                ),
              }
            : slip
        )
      );
    },
    []
  );

  const handleApproveAndForwardSlip = useCallback(
    async (slipId: string, onSuccess?: () => void) => {
      const targetSlip = slips.find((s) => s.id === slipId);
      if (!targetSlip) return;

      const rejectedItems = targetSlip.items.filter((item) => item.isRejectedItem);
      const validItems = targetSlip.items.filter((item) => !item.isRejectedItem);

      if (rejectedItems.some((item) => item.rejectionFeedback.trim() === '')) {
        setError('Please enter feedback/reason for every rejected item before approving.');
        return;
      }

      if (validItems.length === 0) {
        setError(
          'All items are marked as rejected. At least one non-rejected item is required to forward to Admin.'
        );
        return;
      }

      setError(null);
      setSuccessMessage(null);
      setSubmittingSlipId(slipId);

      try {
        for (const rejectedItem of rejectedItems) {
          const { error: deleteError } = await supabase
            .from('return_slip_items')
            .delete()
            .eq('id', rejectedItem.id);

          if (deleteError) throw deleteError;
        }

        const rejectedNotes = rejectedItems
          .map((item) => `${item.deviceName}: ${item.rejectionFeedback.trim()}`)
          .join(' | ');

        const { error: slipError } = await supabase
          .from('return_slips')
          .update({
            status: 'Pending Admin Approval',
            custodian_remarks: rejectedNotes || null,
            custodian_validated_at: new Date().toISOString(),
          })
          .eq('id', targetSlip.id);

        if (slipError) throw slipError;

        setSlips((prev) =>
          prev.map((s) =>
            s.id === targetSlip.id
              ? {
                  ...s,
                  status: 'Pending Admin Approval',
                  items: validItems,
                }
              : s
          )
        );

        setSuccessMessage(
          rejectedItems.length > 0
            ? `Slip ${targetSlip.trackingCode} forwarded to Admin excluding ${rejectedItems.length} rejected item(s).`
            : `Slip ${targetSlip.trackingCode} approved and forwarded to Admin.`
        );

        if (onSuccess) onSuccess();
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to approve and forward return slip to Admin.');
        }
      } finally {
        setSubmittingSlipId(null);
      }
    },
    [slips]
  );

  const filteredSlips = slips.filter((s) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      s.trackingCode.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q) ||
      s.custodianName.toLowerCase().includes(q) ||
      s.items.some((item) => item.deviceName.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (activeSlipId && propRequestId) {
      return s.id === activeSlipId;
    }
    return true;
  });

  return {
    slips: filteredSlips,
    loading,
    submittingSlipId,
    searchTerm,
    setSearchTerm,
    error,
    successMessage,
    handleToggleItemReject,
    handleItemFeedbackChange,
    handleApproveAndForwardSlip,
    refreshSlips: loadSlips,
  };
};