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

export const useInterOfficeTracking = () => {
  const [trackedItems, setTrackedItems] = useState<TrackedItem[]>([]);
  // Naka-true na ito by default para sa initial load
  const [loading, setLoading] = useState(true); 
  const [isLive, setIsLive] = useState(false);

  // Nagdagdag tayo ng isRefresh parameter
  const fetchTrackedItems = useCallback(async (isRefresh = false) => {
    // I-set lang ang loading to true kung manual refresh ito, para iwas ESLint error sa useEffect
    if (isRefresh) {
      setLoading(true);
    }

    const { data, error } = await supabase
      .from('disposal_workflow')
      .select('*')
      .in('status', ['pending_supply', 'dismantling', 'completed'])
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching tracked items:', error);
    } else {
      setTrackedItems(data as TrackedItem[]);
    }
    
    setLoading(false);
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchTrackedItems();
    }, 0);

    const trackingChannel = supabase
      .channel('inter-office-tracking')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'disposal_workflow',
        },
        (payload) => {
          console.log('Realtime update received!', payload);
          // Background sync, kaya hindi na natin ipinapasa ang true para hindi mag-flicker ang UI
          void fetchTrackedItems();
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setIsLive(true);
        }
      });

    return () => {
      window.clearTimeout(timeoutId);
      supabase.removeChannel(trackingChannel);
      setIsLive(false);
    };
  }, [fetchTrackedItems]);

  return {
    trackedItems,
    loading,
    isLive,
    refreshData: () => fetchTrackedItems(true), // Dito natin ipapasa ang true para mag-loading spinner
  };
};