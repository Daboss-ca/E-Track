import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { type CvsuIctCategory } from '../../utils/admin/deviceCatalog';

export interface CustodianSlipItem {
  id: string;
  slipId: string;
  deviceName: string;
  quantity: number;
  unit: string;
  acquisitionCost: number;
  propertyNo?: string;
  icsNo?: string;
  returnReason?: 'Unserviceable' | 'No longer needed' | 'Reassignment' | 'Other';
  dateAcquired?: string;
  endUser?: string;
  location?: string;
  isEDevice?: boolean;
  ictCategory?: CvsuIctCategory | null;
}

export interface ValidationRequest {
  id: string;
  trackingCode: string;
  slipType: 'PRS' | 'RRSP';
  facultyName: string;
  department: string;
  custodianName: string;
  itemName: string;
  category: string;
  description: string;
  condition: 'For Disposal' | 'Needs Repair' | 'Functional';
  dateSubmitted: string;
  status: string;
  remarks?: string;
  items: CustodianSlipItem[];
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
  return_reason: CustodianSlipItem['returnReason'] | null;
  date_acquired: string | null;
  end_user: string | null;
  location: string | null;
}

interface ReturnSlipRow {
  id: string;
  tracking_code: string;
  slip_type: 'PRS' | 'RRSP';
  department: string;
  custodian_name: string;
  returned_by: string | null;
  validated_date: string;
  created_at?: string;
  status: string;
  custodian_remarks?: string | null;
  return_slip_items?: ReturnSlipItemRow[];
}

function mapSlipRowToValidationRequest(row: ReturnSlipRow): ValidationRequest {
  const mappedItems: CustodianSlipItem[] = (row.return_slip_items || []).map((item) => ({
    id: item.id,
    slipId: row.id,
    deviceName: item.device_name,
    quantity: item.quantity || 1,
    unit: item.unit || 'unit',
    acquisitionCost: Number(item.acquisition_cost) || 0,
    propertyNo: item.property_no ?? undefined,
    icsNo: item.ics_no ?? undefined,
    returnReason: item.return_reason ?? undefined,
    dateAcquired: item.date_acquired ?? undefined,
    endUser: item.end_user ?? undefined,
    location: item.location || row.department,
    isEDevice: Boolean(item.is_e_device),
    ictCategory: item.ict_category ?? null,
  }));

  const firstItem = mappedItems[0];
  const itemSummary =
    mappedItems.length > 1
      ? `${firstItem?.deviceName || 'Return Slip Items'} (+${mappedItems.length - 1} more)`
      : firstItem?.deviceName || `${row.slip_type} Return Slip`;

  const mappedCondition: ValidationRequest['condition'] =
    firstItem?.returnReason === 'Unserviceable'
      ? 'For Disposal'
      : firstItem?.returnReason === 'Other'
        ? 'Needs Repair'
        : 'Functional';

  const mappedDescription = mappedItems
    .map(
      (i) =>
        `${i.deviceName} (${i.quantity} ${i.unit})${i.returnReason ? ` - ${i.returnReason}` : ''}`
    )
    .join('; ');

  return {
    id: row.id,
    trackingCode: row.tracking_code,
    slipType: row.slip_type,
    facultyName: firstItem?.endUser || row.returned_by || row.custodian_name || 'End-User',
    department: row.department,
    custodianName: row.custodian_name,
    itemName: itemSummary,
    category: `${row.slip_type} (${mappedItems.length} ${mappedItems.length === 1 ? 'Item' : 'Items'})`,
    description: mappedDescription || 'Return slip submitted by end-user for custodian validation.',
    condition: mappedCondition,
    dateSubmitted: row.validated_date || (row.created_at ? row.created_at.slice(0, 10) : ''),
    status: row.status,
    remarks: row.custodian_remarks ?? undefined,
    items: mappedItems,
  };
}

export function useValidationHub() {
  const [requests, setRequests] = useState<ValidationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ValidationRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCustodianQueue = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('return_slips')
        .select('*, return_slip_items(*)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading custodian return slips:', error.message);
        setRequests([]);
        return;
      }

      const mapped = ((data as ReturnSlipRow[]) || []).map(mapSlipRowToValidationRequest);
      setRequests(mapped);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const loadInitialQueue = async () => {
      try {
        const { data, error } = await supabase
          .from('return_slips')
          .select('*, return_slip_items(*)')
          .order('created_at', { ascending: false });

        if (!active) return;

        if (error) {
          console.error('Error loading custodian return slips:', error.message);
          setRequests([]);
          return;
        }

        const mapped = ((data as ReturnSlipRow[]) || []).map(mapSlipRowToValidationRequest);
        setRequests(mapped);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInitialQueue();

    const channel = supabase
      .channel('custodian-return-slips-queue')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'return_slips' },
        () => {
          if (active) {
            void fetchCustodianQueue();
          }
        }
      )
      .subscribe();

    return () => {
      active = false;
      void supabase.removeChannel(channel);
    };
  }, [fetchCustodianQueue]);

  const handleOpenInspection = (req: ValidationRequest) => {
    setSelectedRequest(req);
    setRemarks(req.remarks || '');
    setIsModalOpen(true);
  };

  const handleCloseInspection = () => {
    setSelectedRequest(null);
    setRemarks('');
    setIsModalOpen(false);
  };

  const handleApprove = async (id: string) => {
    const trimmedRemarks = remarks.trim() || null;

    const { error } = await supabase
      .from('return_slips')
      .update({
        status: 'Custodian Approved',
        custodian_remarks: trimmedRemarks,
        custodian_validated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Failed to approve return slip in custodian hub:', error.message);
      return;
    }

    setRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? { ...req, status: 'Custodian Approved', remarks: trimmedRemarks ?? undefined }
          : req
      )
    );
    handleCloseInspection();
  };

  const handleReject = async (id: string) => {
    const trimmedRemarks = remarks.trim() || null;

    const { error } = await supabase
      .from('return_slips')
      .update({
        status: 'Rejected by Custodian',
        custodian_remarks: trimmedRemarks,
        custodian_validated_at: new Date().toISOString(),
      })
      .eq('id', id);

    if (error) {
      console.error('Failed to reject return slip in custodian hub:', error.message);
      return;
    }

    setRequests((prev) =>
      prev.map((req) =>
        req.id === id
          ? { ...req, status: 'Rejected by Custodian', remarks: trimmedRemarks ?? undefined }
          : req
      )
    );
    handleCloseInspection();
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    requests: filteredRequests,
    loading,
    selectedRequest,
    isModalOpen,
    remarks,
    setRemarks,
    searchTerm,
    setSearchTerm,
    handleOpenInspection,
    handleCloseInspection,
    handleApprove,
    handleReject,
    refreshQueue: fetchCustodianQueue,
  };
}