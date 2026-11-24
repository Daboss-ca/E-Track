import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { classifyDeviceItem, type CvsuIctCategory } from '../../utils/admin/deviceCatalog';

export interface InventoryItem {
  id: string;
  componentName: string;
  category: 'Hazardous' | 'Reusable' | 'Recyclable';
  sourceDevice: string;
  ictCategory?: CvsuIctCategory | string;
  trackingCode?: string;
  weightKg: number;
  quantity: number;
  dismantledBy: string;
  dateAdded: string;
}

export interface ApprovableSlipItemInput {
  id: string;
  deviceName: string;
  quantity: number;
  isEDevice?: boolean;
  ictCategory?: CvsuIctCategory | null;
}

export interface ApprovableSlipInput {
  id: string;
  trackingCode: string;
  custodianName: string;
  items: ApprovableSlipItemInput[];
}

interface EwasteInventoryRow {
  id: string;
  slip_item_id: string | null;
  tracking_code: string;
  source_device: string;
  ict_category: string;
  component_name: string;
  classification: 'Hazardous' | 'Non-Hazardous';
  quantity: number;
  weight_kg: number | string;
  dismantled_by: string | null;
  created_at: string;
}

function mapRowToInventoryItem(row: EwasteInventoryRow): InventoryItem {
  return {
    id: row.id,
    componentName: row.component_name,
    category: row.classification === 'Hazardous' ? 'Hazardous' : 'Reusable',
    sourceDevice: row.source_device,
    ictCategory: row.ict_category,
    trackingCode: row.tracking_code,
    weightKg: Number(row.weight_kg) || 0,
    quantity: row.quantity || 1,
    dismantledBy: row.dismantled_by || 'Pending Assignment',
    dateAdded: row.created_at ? row.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
  };
}

export function useInventoryControl() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const refreshInventory = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('ewaste_inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch ewaste_inventory:', error.message);
        setItems([]);
        return;
      }

      setItems(((data as EwasteInventoryRow[]) || []).map(mapRowToInventoryItem));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function loadInitialInventory() {
      const { data, error } = await supabase
        .from('ewaste_inventory')
        .select('*')
        .order('created_at', { ascending: false });

      if (!active) return;

      if (error) {
        console.error('Failed to load ewaste_inventory:', error.message);
        setItems([]);
      } else {
        setItems(((data as EwasteInventoryRow[]) || []).map(mapRowToInventoryItem));
      }
      setLoading(false);
    }

    void loadInitialInventory();

    return () => {
      active = false;
    };
  }, []);

  const syncEDevicesFromApprovedSlip = useCallback(
    async (slip: ApprovableSlipInput) => {
      const eDeviceEntries = slip.items.flatMap((slipItem) => {
        const classification = classifyDeviceItem(
          slipItem.deviceName,
          slipItem.isEDevice,
          slipItem.ictCategory
        );

        if (!classification.isEDevice || !classification.ictCategory) {
          return [];
        }

        return classification.components.map((comp) => ({
          slip_item_id: slip.id,
          tracking_code: slip.trackingCode,
          source_device: slipItem.deviceName,
          ict_category: classification.ictCategory as string,
          component_name: comp.componentName,
          classification: comp.classification,
          quantity: slipItem.quantity || 1,
          weight_kg: comp.defaultWeightKg,
          dismantled_by: slip.custodianName || 'Pending Assignment',
          ar_status: 'In Storage',
        }));
      });

      if (eDeviceEntries.length === 0) {
        return [];
      }

      const { data, error } = await supabase
        .from('ewaste_inventory')
        .insert(eDeviceEntries)
        .select('*');

      if (error) {
        console.error('Failed to sync E-Devices to ewaste_inventory:', error.message);
        return [];
      }

      const mapped = ((data as EwasteInventoryRow[]) || []).map(mapRowToInventoryItem);
      setItems((prev) => [...mapped, ...prev]);
      return mapped;
    },
    []
  );

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.componentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sourceDevice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.ictCategory || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.trackingCode || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.dismantledBy.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchTerm]);

  const summary = useMemo(() => {
    const totalWeight = items.reduce((acc, curr) => acc + curr.weightKg * curr.quantity, 0);
    const hazardousCount = items.filter((i) => i.category === 'Hazardous').length;
    const reusableCount = items.filter((i) => i.category === 'Reusable').length;
    const recyclableCount = items.filter((i) => i.category === 'Recyclable').length;

    return {
      totalWeight: totalWeight.toFixed(2),
      hazardousCount,
      reusableCount,
      recyclableCount,
    };
  }, [items]);

  return {
    items: filteredItems,
    summary,
    loading,
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
    refreshInventory,
    syncEDevicesFromApprovedSlip,
  };
}