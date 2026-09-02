import { useState, useMemo } from 'react';

export interface InventoryItem {
  id: string;
  componentName: string;
  category: 'Hazardous' | 'Reusable' | 'Recyclable';
  sourceDevice: string;
  weightKg: number;
  quantity: number;
  dismantledBy: string;
  dateAdded: string;
}

const mockInventoryItems: InventoryItem[] = [
  {
    id: 'inv-1',
    componentName: 'Lithium-ion Battery Pack',
    category: 'Hazardous',
    sourceDevice: 'Dell Latitude 5490',
    weightKg: 0.45,
    quantity: 4,
    dismantledBy: 'Christian Arnuco',
    dateAdded: '2026-09-02',
  },
  {
    id: 'inv-2',
    componentName: 'DDR4 8GB RAM Stick',
    category: 'Reusable',
    sourceDevice: 'HP ProDesk 600 G4',
    weightKg: 0.05,
    quantity: 12,
    dismantledBy: 'Alex Mercado',
    dateAdded: '2026-09-02',
  },
  {
    id: 'inv-3',
    componentName: 'Aluminum Heatsink Casing',
    category: 'Recyclable',
    sourceDevice: 'Server Rack PSU',
    weightKg: 2.30,
    quantity: 6,
    dismantledBy: 'Jayson Ramos',
    dateAdded: '2026-09-01',
  },
];

export function useInventoryControl() {
  const [items] = useState<InventoryItem[]>(mockInventoryItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      const matchesSearch =
        item.componentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.sourceDevice.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.dismantledBy.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [items, selectedCategory, searchTerm]);

  // Summary counts para sa widgets
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
    selectedCategory,
    setSelectedCategory,
    searchTerm,
    setSearchTerm,
  };
}