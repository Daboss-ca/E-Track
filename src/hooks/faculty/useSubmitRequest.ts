// src/hooks/faculty/useEWasteForm.ts (o useSubmitRequest.ts)
import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import type { EquipmentCategory } from '../../types/app';

export interface EquipmentRow {
  id: string;
  description: string;
  quantity: number;
  category: EquipmentCategory;
}

interface UseEWasteFormReturn {
  formState: {
    itemName: string;
    category: EquipmentCategory;
    departmentCode: string;
    date: string;
    trackingCodePreview: string;
    equipmentItems: EquipmentRow[];
    photos: File[];
    loading: boolean;
    submitError: string | null;
    successMessage: string | null;
  };
  setters: {
    setItemName: (value: string) => void;
    setCategory: (value: EquipmentCategory) => void;
    setDepartmentCode: (value: string) => void;
    setDate: (value: string) => void;
    setPhotos: (files: File[]) => void;
  };
  actions: {
    addEquipmentRow: () => void;
    updateEquipmentRow: (id: string, updatedFields: Partial<EquipmentRow>) => void;
    removeEquipmentRow: (id: string) => void;
    submitRequest: () => Promise<boolean>;
    clearSuccessMessage: () => void;
  };
}

const generateTrackingCode = (): string => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  return `EW-${year}-${randomSuffix}`;
};

export function useEWasteForm(onSuccess?: () => void): UseEWasteFormReturn {
  const [itemName, setItemName] = useState<string>('');
  const [category, setCategoryState] = useState<EquipmentCategory>('IT Equipment');
  const [departmentCode, setDepartmentCode] = useState<string>('ITECH');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Safe lazy initial state: satisfies both React purity and avoids set-state-in-effect linter warnings
  const [trackingCodePreview, setTrackingCodePreview] = useState<string>(() => generateTrackingCode());

  const [equipmentItems, setEquipmentItems] = useState<EquipmentRow[]>([
    { id: crypto.randomUUID(), description: '', quantity: 1, category: 'IT Equipment' }
  ]);
  const [photos, setPhotos] = useState<File[]>([]);
  
  const [loading, setLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const setCategory = (newCategory: EquipmentCategory) => {
    setCategoryState(newCategory);
    setEquipmentItems(prev =>
      prev.map(item => ({ ...item, category: newCategory }))
    );
  };

  const addEquipmentRow = () => {
    setEquipmentItems(prev => [
      ...prev,
      { id: crypto.randomUUID(), description: '', quantity: 1, category }
    ]);
  };

  const updateEquipmentRow = (id: string, updatedFields: Partial<EquipmentRow>) => {
    setEquipmentItems(prev =>
      prev.map(item => (item.id === id ? { ...item, ...updatedFields } : item))
    );
  };

  const removeEquipmentRow = (id: string) => {
    if (equipmentItems.length === 1) return;
    setEquipmentItems(prev => prev.filter(item => item.id !== id));
  };

  const clearSuccessMessage = () => setSuccessMessage(null);

  const resetForm = () => {
    setItemName('');
    setCategoryState('IT Equipment');
    setDate(new Date().toISOString().split('T')[0]);
    setTrackingCodePreview(generateTrackingCode());
    setEquipmentItems([
      { id: crypto.randomUUID(), description: '', quantity: 1, category: 'IT Equipment' }
    ]);
    setPhotos([]);
  };

  const submitRequest = async (): Promise<boolean> => {
    setSubmitError(null);
    setSuccessMessage(null);

    if (!itemName.trim()) {
      setSubmitError('Required field: Please enter an item name or request title.');
      return false;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('Authentication session missing or expired. Please sign in again.');
      }
      const user = authData.user;

      const { data: requestData, error: requestError } = await supabase
        .from('work_orders')
        .insert({
          user_id: user.id,
          item_name: itemName,
          category,
          department_code: departmentCode,
          request_date: date,
          tracking_code: trackingCodePreview,
          status: 'Pending'
        })
        .select()
        .single();

      if (requestError) throw requestError;

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
      setSuccessMessage(`E-Waste request successfully submitted! Tracking Code: ${trackingCodePreview}`);
      resetForm();
      if (onSuccess) onSuccess();
      return true;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred during submission.';
      setSubmitError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  return {
    formState: {
      itemName,
      category,
      departmentCode,
      date,
      trackingCodePreview,
      equipmentItems,
      photos,
      loading,
      submitError,
      successMessage,
    },
    setters: {
      setItemName,
      setCategory,
      setDepartmentCode,
      setDate,
      setPhotos,
    },
    actions: {
      addEquipmentRow,
      updateEquipmentRow,
      removeEquipmentRow,
      submitRequest,
      clearSuccessMessage,
    }
  };
}