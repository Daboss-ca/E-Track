// src/hooks/faculty/useEWasteForm.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import type { EquipmentCategory, EWasteRequest, RequestStatus, LifecycleStage, EquipmentCondition } from '../../types/app';

export interface EquipmentRow {
  id: string;
  description: string;
  quantity: number;
  category: EquipmentCategory;
  condition: EquipmentCondition;
}

interface SupabaseWorkOrderItem {
  id: string;
  description: string;
  quantity: number;
  category: EquipmentCategory;
}

interface SupabaseWorkOrderRecord {
  id: string;
  tracking_code: string;
  item_name: string;
  category: EquipmentCategory;
  department_code: string | null;
  request_date: string;
  status: RequestStatus | null;
  work_order_items?: SupabaseWorkOrderItem[];
  request_photos?: { id: string; image_url: string }[];
}

const generateTrackingCode = (): string => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `TRK-${year}-CICS-${randomSuffix}`;
};

export function useEWasteForm() {
  const departmentCode = 'CICS';
  
  // Form States
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('IT Equipment');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [trackingCodePreview] = useState<string>(() => generateTrackingCode());
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const [equipmentItems, setEquipmentItems] = useState<EquipmentRow[]>([
    { id: crypto.randomUUID(), description: '', quantity: 1, category: 'IT Equipment', condition: 'Defective' as EquipmentCondition },
  ]);

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [ledger, setLedger] = useState<EWasteRequest[]>([]);

  // Fetch real-time requests from Supabase work_orders table
  const fetchLedger = useCallback(async () => {
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) return;

      const { data, error } = await supabase
        .from('work_orders')
        .select(`
          *,
          work_order_items (*),
          request_photos (*)
        `)
        .eq('user_id', authData.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedData = (data || []) as SupabaseWorkOrderRecord[];

      const formattedLedger: EWasteRequest[] = typedData.map((order) => {
        // Binago sa valid type union: 'Pending Approval' sa halip na 'Pending'
        const status: RequestStatus = order.status || 'Pending Approval';
        
        return {
          id: order.id,
          trackingCode: order.tracking_code,
          itemName: order.item_name,
          category: order.category,
          departmentCode: order.department_code || departmentCode,
          departmentName: 'College of Information and Computing Sciences',
          requestedBy: 'Miguel Santos',
          dateSubmitted: order.request_date,
          status: status,
          photoCount: order.request_photos?.length || 0,
          equipmentItems: (order.work_order_items || []).map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            category: item.category,
            condition: 'Defective' as EquipmentCondition,
          })),
          lifecycle: [
            { 
              stage: 'submitted' as LifecycleStage, 
              label: 'Request Submitted', 
              isComplete: true, 
              isCurrent: false, 
              completedAt: order.request_date, 
              completedBy: 'Miguel Santos' 
            },
            { 
              stage: 'storage_intake' as LifecycleStage, 
              label: 'Storage Room Intake', 
              isComplete: status === 'In Transit' || status === 'Processing' || status === 'Completed', 
              isCurrent: status === 'Pending Approval',
              completedAt: status === 'In Transit' || status === 'Processing' || status === 'Completed' ? 'Verified' : undefined,
              completedBy: status === 'In Transit' || status === 'Processing' || status === 'Completed' ? 'Admin' : undefined,
            },
            { 
              stage: 'disassembly' as LifecycleStage, 
              label: 'Dismantling & Sorting', 
              isComplete: status === 'Processing' || status === 'Completed', 
              isCurrent: status === 'In Transit',
              completedAt: status === 'Processing' || status === 'Completed' ? 'Processed' : undefined,
              completedBy: status === 'Processing' || status === 'Completed' ? 'Segregator' : undefined,
            },
            { 
              stage: 'final_disposal' as LifecycleStage, 
              label: 'Final Recycling / Disposal', 
              isComplete: status === 'Completed', 
              isCurrent: status === 'Processing',
              completedAt: status === 'Completed' ? 'Finalized' : undefined,
              completedBy: status === 'Completed' ? 'System' : undefined,
            },
          ],
        };
      });

      setLedger(formattedLedger);
    } catch (err) {
      console.error('Error fetching ledger data:', err);
    }
  }, [departmentCode]);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      if (isMounted) {
        await fetchLedger();
      }
    };
    loadData();
    return () => {
      isMounted = false;
    };
  }, [fetchLedger]);

  // Equipment Table Actions
  const addEquipmentRow = () => {
    setEquipmentItems((prev) => [
      ...prev,
      { id: crypto.randomUUID(), description: '', quantity: 1, category, condition: 'Defective' as EquipmentCondition },
    ]);
  };

  const removeEquipmentRow = (id: string) => {
    if (equipmentItems.length === 1) return;
    setEquipmentItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateEquipmentRow = (id: string, updatedFields: Partial<EquipmentRow>) => {
    setEquipmentItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  // Submit Action with Database Connection
  const submitRequest = async (): Promise<boolean> => {
    if (!itemName.trim()) {
      setSubmitError('Please enter an item name or batch title.');
      return false;
    }

    const hasEmptyDesc = equipmentItems.some((item) => !item.description.trim());
    if (hasEmptyDesc) {
      setSubmitError('Please fill in the description for all equipment items.');
      return false;
    }

    setSubmitError(null);
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('Authentication session missing or expired. Please sign in again.');
      }
      const user = authData.user;

      // 1. Insert main work order record
      const { data: requestData, error: requestError } = await supabase
        .from('work_orders')
        .insert({
          user_id: user.id,
          item_name: itemName.trim(),
          category,
          department_code: departmentCode,
          request_date: date,
          tracking_code: trackingCodePreview,
          status: 'Pending Approval' // Binago upang umayon sa RequestStatus type
        })
        .select()
        .single();

      if (requestError) throw requestError;

      // 2. Insert related equipment items
      if (equipmentItems.length > 0 && requestData) {
        const itemsPayload = equipmentItems.map(item => ({
          request_id: requestData.id,
          description: item.description,
          quantity: item.quantity,
          category: item.category
        }));

        const { error: itemsError } = await supabase
          .from('work_order_items')
          .insert(itemsPayload);

        if (itemsError) throw itemsError;
      }

      // 3. Upload and attach photos if any exist
      if (photos.length > 0 && requestData) {
        for (const file of photos) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${requestData.id}/${crypto.randomUUID()}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from('ewaste-photos')
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: urlData } = supabase.storage
            .from('ewaste-photos')
            .getPublicUrl(fileName);

          const { error: photoDbError } = await supabase.from('request_photos').insert({
            request_id: requestData.id,
            image_url: urlData.publicUrl
          });

          if (photoDbError) throw photoDbError;
        }
      }

      setLoading(false);
      window.alert('E-Waste request successfully submitted to the database!');

      // Reset form
      setItemName('');
      setPhotos([]);
      setEquipmentItems([{ id: crypto.randomUUID(), description: '', quantity: 1, category: 'IT Equipment', condition: 'Defective' as EquipmentCondition }]);

      // Refresh ledger list
      await fetchLedger();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during submission.';
      setSubmitError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  return {
    departmentCode,
    formState: {
      itemName,
      category,
      date,
      trackingCodePreview,
      photos,
      equipmentItems,
      submitError,
      loading,
    },
    setters: {
      setItemName,
      setCategory,
      setDate,
      setPhotos,
    },
    actions: {
      addEquipmentRow,
      removeEquipmentRow,
      updateEquipmentRow,
      submitRequest,
    },
    ledger,
  };
}