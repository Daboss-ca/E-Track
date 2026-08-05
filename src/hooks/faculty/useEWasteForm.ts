// src/hooks/useEWasteForm.ts
import { useState } from 'react';
import type { EquipmentCategory, EWasteRequest, RequestStatus, LifecycleStage, EquipmentCondition } from '../../types/app';

export interface EquipmentRow {
  id: string;
  description: string;
  quantity: number;
  category: EquipmentCategory;
  condition: EquipmentCondition;
}

export function useEWasteForm() {
  const departmentCode = 'CICS';
  
  // Form States
  const [itemName, setItemName] = useState('');
  const [category, setCategory] = useState<EquipmentCategory>('IT Equipment');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [trackingCodePreview] = useState('TRK-2026-CICS-8492');
  const [photos, setPhotos] = useState<File[]>([]);
  
  const [equipmentItems, setEquipmentItems] = useState<EquipmentRow[]>([
    { id: 'eq-1', description: '', quantity: 1, category: 'IT Equipment', condition: 'Defective' as EquipmentCondition },
  ]);

  const [submitError, setSubmitError] = useState<string | null>(null);

  // Ledger State (Mock initial data)
  const [ledger, setLedger] = useState<EWasteRequest[]>([
    {
      id: 'req-1',
      trackingCode: 'TRK-2026-CICS-1042',
      itemName: 'Defective Laboratory Monitors',
      category: 'IT Equipment',
      departmentCode,
      departmentName: 'College of Information and Computing Sciences',
      requestedBy: 'Miguel Santos',
      dateSubmitted: '2026-05-10',
      status: 'Pending' as RequestStatus,
      photoCount: 0,
      equipmentItems: [
        { id: 'eq-1', description: 'Defective Laboratory Monitors', quantity: 1, category: 'IT Equipment', condition: 'Defective' as EquipmentCondition }
      ],
      lifecycle: [
        { 
          stage: 'submitted' as LifecycleStage, 
          label: 'Request Submitted', 
          isComplete: true, 
          isCurrent: false, 
          completedAt: '2026-05-10', 
          completedBy: 'Miguel Santos' 
        },
        { 
          stage: 'storage_intake' as LifecycleStage, 
          label: 'Storage Room Intake', 
          isComplete: false, 
          isCurrent: true 
        },
        { 
          stage: 'disassembly' as LifecycleStage, 
          label: 'Dismantling & Sorting', 
          isComplete: false, 
          isCurrent: false 
        },
        { 
          stage: 'final_disposal' as LifecycleStage, 
          label: 'Final Recycling / Disposal', 
          isComplete: false, 
          isCurrent: false 
        },
      ],
    },
  ]);

  // Equipment Table Actions
  const addEquipmentRow = () => {
    setEquipmentItems((prev) => [
      ...prev,
      { id: `eq-${Date.now()}`, description: '', quantity: 1, category, condition: 'Defective' as EquipmentCondition },
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

  // Submit Action
  const submitRequest = (): boolean => {
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

    const newRequest: EWasteRequest = {
      id: `req-${Date.now()}`,
      trackingCode: trackingCodePreview,
      itemName: itemName.trim(),
      category,
      departmentCode,
      departmentName: 'College of Information and Computing Sciences',
      requestedBy: 'Miguel Santos',
      dateSubmitted: date,
      status: 'Pending' as RequestStatus,
      photoCount: photos.length,
      equipmentItems: equipmentItems.map(item => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
        category: item.category,
        condition: item.condition,
      })),
      lifecycle: [
        { 
          stage: 'submitted' as LifecycleStage, 
          label: 'Request Submitted', 
          isComplete: true, 
          isCurrent: false, 
          completedAt: date, 
          completedBy: 'Miguel Santos' 
        },
        { 
          stage: 'storage_intake' as LifecycleStage, 
          label: 'Storage Room Intake', 
          isComplete: false, 
          isCurrent: true 
        },
        { 
          stage: 'disassembly' as LifecycleStage, 
          label: 'Dismantling & Sorting', 
          isComplete: false, 
          isCurrent: false 
        },
        { 
          stage: 'final_disposal' as LifecycleStage, 
          label: 'Final Recycling / Disposal', 
          isComplete: false, 
          isCurrent: false 
        },
      ],
    };

    setLedger((prev) => [newRequest, ...prev]);

    // Reset form
    setItemName('');
    setPhotos([]);
    setEquipmentItems([{ id: `eq-${Date.now()}`, description: '', quantity: 1, category: 'IT Equipment', condition: 'Defective' as EquipmentCondition }]);

    window.alert('E-Waste request successfully submitted!');
    return true;
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