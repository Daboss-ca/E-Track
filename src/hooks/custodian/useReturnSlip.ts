import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export interface RequestedItem {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  propertyTag: string;
  serialNumber: string;
}

export interface ApprovedRequest {
  id: string;
  controlNumber: string;
  department: string;
  requestedBy: string;
  dateApproved: string;
  items: RequestedItem[];
}

interface SupabaseProfile {
  full_name: string | null;
}

interface SupabaseRequestItem {
  id: string;
  item_name: string;
  category: string;
  quantity: number;
  property_tag: string | null;
  serial_number: string | null;
}

interface SupabaseResponse {
  id: string;
  control_number: string | null;
  department: string | null;
  updated_at: string;
  profiles: SupabaseProfile | SupabaseProfile[] | null;
  request_items: SupabaseRequestItem[];
}

export const useReturnSlip = (requestId?: string) => {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requestData, setRequestData] = useState<ApprovedRequest | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!requestId) return;

    const fetchApprovedRequest = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: fetchError } = await supabase
          .from('ewaste_requests')
          .select(`
            id,
            control_number,
            department,
            profiles:user_id (full_name),
            updated_at,
            request_items (id, item_name, category, quantity, property_tag, serial_number)
          `)
          .eq('id', requestId)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          // Cast sa SupabaseResponse interface
          const rawData = data as unknown as SupabaseResponse;
          const profileData = Array.isArray(rawData.profiles)
            ? rawData.profiles[0]
            : rawData.profiles;

          setRequestData({
            id: rawData.id,
            controlNumber: rawData.control_number || `RS-${Date.now().toString().slice(-6)}`,
            department: rawData.department || 'N/A',
            requestedBy: profileData?.full_name || 'Faculty Member',
            dateApproved: new Date(rawData.updated_at).toLocaleDateString(),
            items: (rawData.request_items || []).map((item) => ({
              id: item.id,
              itemName: item.item_name,
              category: item.category,
              quantity: item.quantity,
              propertyTag: item.property_tag || '',
              serialNumber: item.serial_number || '',
            })),
          });
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Failed to auto-populate request data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchApprovedRequest();
  }, [requestId]);

  const handleItemTagChange = (
    itemId: string,
    field: 'propertyTag' | 'serialNumber',
    value: string
  ) => {
    if (!requestData) return;

    setRequestData({
      ...requestData,
      items: requestData.items.map((item) =>
        item.id === itemId ? { ...item, [field]: value } : item
      ),
    });
  };

  const isFormValid = Boolean(
    requestData &&
      requestData.items.length > 0 &&
      requestData.items.every((item) => item.propertyTag.trim() !== '')
  );

  const sendToAdmin = async (onSuccess?: () => void) => {
    if (!isFormValid || !requestData) {
      setError('Please fill in all required Property Tags before submitting.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      for (const item of requestData.items) {
        const { error: itemUpdateError } = await supabase
          .from('request_items')
          .update({
            property_tag: item.propertyTag,
            serial_number: item.serialNumber,
          })
          .eq('id', item.id);

        if (itemUpdateError) throw itemUpdateError;
      }

      const { error: requestUpdateError } = await supabase
        .from('ewaste_requests')
        .update({
          status: 'transferred_to_admin',
          return_slip_generated_at: new Date().toISOString(),
        })
        .eq('id', requestData.id);

      if (requestUpdateError) throw requestUpdateError;

      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to transfer Return Slip to Admin.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    loading,
    submitting,
    requestData,
    error,
    isFormValid,
    handleItemTagChange,
    sendToAdmin,
  };
};