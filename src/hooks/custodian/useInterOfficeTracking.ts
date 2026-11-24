import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';

export type TrackingStatus = 'pending_supply' | 'dismantling' | 'completed';

export interface TrackedItem {
  id: string;
  property_number: string;
  item_name: string;
  status: TrackingStatus;
  office_origin: string;
  updated_at: string;
  admin_note?: string;
}

interface ReturnSlipTrackingItem {
  id: string;
  device_name: string;
  property_no: string | null;
  ics_no: string | null;
  property_tag: string | null;
  location: string | null;
}

interface ReturnSlipTrackingRow {
  id: string;
  tracking_code: string;
  slip_type: 'PRS' | 'RRSP';
  department: string;
  status: string;
  updated_at?: string;
  created_at?: string;
  custodian_remarks?: string | null;
  return_slip_items?: ReturnSlipTrackingItem[];
}

function mapSlipStatusToTrackingStatus(slipStatus: string): TrackingStatus {
  const normalized = slipStatus.toLowerCase();
  if (normalized === 'approved' || normalized === 'completed' || normalized === 'disposed') {
    return 'completed';
  }
  if (normalized === 'pending admin approval' || normalized === 'transferred_to_admin') {
    return 'dismantling';
  }
  return 'pending_supply';
}

function flattenTrackingRows(rows: ReturnSlipTrackingRow[]): TrackedItem[] {
  return rows.flatMap((slip) => {
    const mappedStatus = mapSlipStatusToTrackingStatus(slip.status);
    const timestamp = slip.updated_at || slip.created_at || new Date().toISOString();
    const items = slip.return_slip_items || [];

    if (items.length === 0) {
      return [
        {
          id: slip.id,
          property_number: slip.tracking_code,
          item_name: `${slip.slip_type} Return Slip (${slip.status})`,
          status: mappedStatus,
          office_origin: slip.department,
          updated_at: timestamp,
          admin_note: slip.custodian_remarks ?? undefined,
        },
      ];
    }

    return items.map((item) => ({
      id: item.id,
      property_number:
        item.property_tag || item.property_no || item.ics_no || slip.tracking_code,
      item_name: item.device_name,
      status: mappedStatus,
      office_origin: item.location || slip.department,
      updated_at: timestamp,
      admin_note: slip.custodian_remarks ?? undefined,
    }));
  });
}

export const useInterOfficeTracking = () => {
  const [trackedItems, setTrackedItems] = useState<TrackedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);

  const fetchTrackedItems = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setLoading(true);
    }

    try {
      const { data, error } = await supabase
        .from('return_slips')
        .select(
          'id, tracking_code, slip_type, department, status, updated_at, created_at, custodian_remarks, return_slip_items(id, device_name, property_no, ics_no, property_tag, location)'
        )
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching return slip tracking items:', error.message);
        setTrackedItems([]);
        return;
      }

      setTrackedItems(flattenTrackingRows((data as ReturnSlipTrackingRow[]) || []));
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
          .select(
            'id, tracking_code, slip_type, department, status, updated_at, created_at, custodian_remarks, return_slip_items(id, device_name, property_no, ics_no, property_tag, location)'
          )
          .order('updated_at', { ascending: false });

        if (!active) return;

        if (error) {
          console.error('Error fetching return slip tracking items:', error.message);
          setTrackedItems([]);
          return;
        }

        setTrackedItems(flattenTrackingRows((data as ReturnSlipTrackingRow[]) || []));
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void loadInitial();

    const trackingChannel = supabase
      .channel('inter-office-return-slips-tracking')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'return_slips',
        },
        () => {
          if (active) {
            void fetchTrackedItems();
          }
        }
      )
      .subscribe((status) => {
        if (active && status === 'SUBSCRIBED') {
          setIsLive(true);
        }
      });

    return () => {
      active = false;
      void supabase.removeChannel(trackingChannel);
      setIsLive(false);
    };
  }, [fetchTrackedItems]);

  return {
    trackedItems,
    loading,
    isLive,
    refreshData: () => fetchTrackedItems(true),
  };
};