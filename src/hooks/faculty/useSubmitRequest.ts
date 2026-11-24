import { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { classifyDeviceItem } from '../../utils/admin/deviceCatalog';

export type ReturnSlipType = 'PRS' | 'RRSP';
export type ReturnReasonOption = 'Unserviceable' | 'No longer needed' | 'Reassignment' | 'Other';

export interface EquipmentRow {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  acquisitionCost: number;
  propertyNo: string;
  dateAcquired: string;
  icsNo: string;
  endUser: string;
  location: string;
}

interface UseEWasteFormReturn {
  formState: {
    slipType: ReturnSlipType;
    returnReason: ReturnReasonOption;
    department: string;
    custodianName: string;
    date: string;
    trackingCodePreview: string;
    equipmentItems: EquipmentRow[];
    photos: File[];
    loading: boolean;
    submitError: string | null;
    successMessage: string | null;
  };
  setters: {
    setSlipType: (value: ReturnSlipType) => void;
    setReturnReason: (value: ReturnReasonOption) => void;
    setDepartment: (value: string) => void;
    setCustodianName: (value: string) => void;
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

const generateTrackingCode = (slipType: ReturnSlipType): string => {
  const year = new Date().getFullYear();
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `${slipType}-${year}-${randomSuffix}`;
};

function createEmptyRow(slipType: ReturnSlipType): EquipmentRow {
  return {
    id: crypto.randomUUID(),
    description: '',
    quantity: 1,
    unit: slipType === 'PRS' ? 'unit' : 'units',
    acquisitionCost: slipType === 'PRS' ? 50000 : 5000,
    propertyNo: '',
    dateAcquired: new Date().toISOString().split('T')[0],
    icsNo: '',
    endUser: '',
    location: '',
  };
}

export function useEWasteForm(onSuccess?: () => void): UseEWasteFormReturn {
  const [slipType, setSlipTypeState] = useState<ReturnSlipType>('PRS');
  const [returnReason, setReturnReason] = useState<ReturnReasonOption>('Unserviceable');
  const [department, setDepartment] = useState<string>(
    'College of Engineering and Information Technology'
  );
  const [custodianName, setCustodianName] = useState<string>('Property Custodian');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [trackingCodePreview, setTrackingCodePreview] = useState<string>(() =>
    generateTrackingCode('PRS')
  );

  const [equipmentItems, setEquipmentItems] = useState<EquipmentRow[]>(() => [
    createEmptyRow('PRS'),
    createEmptyRow('PRS'),
    createEmptyRow('PRS'),
  ]);
  const [photos, setPhotos] = useState<File[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const setSlipType = (newType: ReturnSlipType) => {
    setSlipTypeState(newType);
    setTrackingCodePreview(generateTrackingCode(newType));
    setEquipmentItems((prev) =>
      prev.map((item) => ({
        ...item,
        quantity: newType === 'PRS' ? 1 : item.quantity,
        unit: newType === 'PRS' ? 'unit' : item.unit === 'unit' ? 'units' : item.unit,
      }))
    );
  };

  const addEquipmentRow = () => {
    setEquipmentItems((prev) => [...prev, createEmptyRow(slipType)]);
  };

  const updateEquipmentRow = (id: string, updatedFields: Partial<EquipmentRow>) => {
    setEquipmentItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const merged = { ...item, ...updatedFields };
        if (slipType === 'PRS') {
          merged.quantity = 1;
          merged.unit = 'unit';
        }
        return merged;
      })
    );
  };

  const removeEquipmentRow = (id: string) => {
    if (equipmentItems.length === 1) return;
    setEquipmentItems((prev) => prev.filter((item) => item.id !== id));
  };

  const clearSuccessMessage = () => setSuccessMessage(null);

  const resetForm = () => {
    const defaultType: ReturnSlipType = 'PRS';
    setSlipTypeState(defaultType);
    setReturnReason('Unserviceable');
    setDate(new Date().toISOString().split('T')[0]);
    setTrackingCodePreview(generateTrackingCode(defaultType));
    setEquipmentItems([createEmptyRow(defaultType)]);
    setPhotos([]);
  };

  const submitRequest = async (): Promise<boolean> => {
    setSubmitError(null);
    setSuccessMessage(null);

    if (!department.trim()) {
      setSubmitError('Required field: Please enter a department.');
      return false;
    }

    const hasValidItem = equipmentItems.some((item) => item.description.trim().length > 0);
    if (!hasValidItem) {
      setSubmitError('Required field: Please add at least one item description.');
      return false;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError || !authData.user) {
        throw new Error('Authentication session missing or expired. Please sign in again.');
      }

      const { data: slipData, error: slipError } = await supabase
        .from('return_slips')
        .insert({
          tracking_code: trackingCodePreview,
          slip_type: slipType,
          department: department.trim(),
          custodian_name: custodianName.trim() || 'Property Custodian',
          status: 'Pending Custodian Approval',
          validated_date: date,
        })
        .select()
        .single();

      if (slipError) throw slipError;

      const validRows = equipmentItems.filter((item) => item.description.trim().length > 0);
      if (validRows.length > 0 && slipData) {
        const itemsPayload = validRows.map((item) => {
          const classified = classifyDeviceItem(item.description);
          return {
            slip_id: slipData.id,
            device_name: item.description.trim(),
            is_e_device: classified.isEDevice,
            ict_category: classified.ictCategory,
            quantity: slipType === 'PRS' ? 1 : Math.max(1, item.quantity),
            unit: slipType === 'PRS' ? 'unit' : item.unit || 'units',
            acquisition_cost: Number(item.acquisitionCost) || 0,
            property_no: slipType === 'PRS' ? item.propertyNo || null : null,
            ics_no: slipType === 'RRSP' ? item.icsNo || null : null,
            return_reason: slipType === 'PRS' ? returnReason : null,
            date_acquired: slipType === 'PRS' && item.dateAcquired ? item.dateAcquired : null,
            end_user: slipType === 'RRSP' ? item.endUser || null : null,
            location: slipType === 'RRSP' ? item.location || null : null,
          };
        });

        const { error: itemsError } = await supabase
          .from('return_slip_items')
          .insert(itemsPayload);

        if (itemsError) throw itemsError;
      }

      if (photos.length > 0 && slipData) {
        for (const file of photos) {
          const fileExt = file.name.split('.').pop();
          const fileName = `${slipData.id}/${crypto.randomUUID()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('ewaste-photos')
            .upload(fileName, file);

          if (uploadError) throw uploadError;
        }
      }

      setLoading(false);
      setSuccessMessage(
        `${slipType} Return Slip submitted! Tracking Code: ${trackingCodePreview}`
      );
      resetForm();
      if (onSuccess) onSuccess();
      return true;
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : 'An unexpected error occurred during submission.';
      setSubmitError(errorMessage);
      setLoading(false);
      return false;
    }
  };

  return {
    formState: {
      slipType,
      returnReason,
      department,
      custodianName,
      date,
      trackingCodePreview,
      equipmentItems,
      photos,
      loading,
      submitError,
      successMessage,
    },
    setters: {
      setSlipType,
      setReturnReason,
      setDepartment,
      setCustodianName,
      setDate,
      setPhotos,
    },
    actions: {
      addEquipmentRow,
      updateEquipmentRow,
      removeEquipmentRow,
      submitRequest,
      clearSuccessMessage,
    },
  };
}