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
    componentName: 'Lithium-ion Laptop Battery Pack',
    category: 'Hazardous',
    sourceDevice: 'Dell Latitude 5490',
    weightKg: 0.45,
    quantity: 4,
    dismantledBy: 'Christian Arnuco',
    dateAdded: '2026-09-02',
  },
  {
    id: 'inv-2',
    componentName: 'Lead-Acid UPS Battery',
    category: 'Hazardous',
    sourceDevice: 'APC Smart-UPS 3000VA',
    weightKg: 11.50,
    quantity: 2,
    dismantledBy: 'Alex Mercado',
    dateAdded: '2026-09-04',
  },
  {
    id: 'inv-3',
    componentName: 'Mercury-Containing CCFL Backlight Tube',
    category: 'Hazardous',
    sourceDevice: 'ViewSonic 24-inch LCD Monitor',
    weightKg: 0.15,
    quantity: 6,
    dismantledBy: 'Jayson Ramos',
    dateAdded: '2026-09-05',
  },
  {
    id: 'inv-4',
    componentName: 'CRT Glass Panel (Lead-laced)',
    category: 'Hazardous',
    sourceDevice: 'HP Vintage Desktop Monitor',
    weightKg: 8.20,
    quantity: 3,
    dismantledBy: 'Christian Arnuco',
    dateAdded: '2026-09-08',
  },
  {
    id: 'inv-5',
    componentName: 'Motherboard Soldered Circuit Board',
    category: 'Hazardous',
    sourceDevice: 'Dell PowerEdge R740 Server',
    weightKg: 1.20,
    quantity: 5,
    dismantledBy: 'Alex Mercado',
    dateAdded: '2026-09-10',
  },
  {
    id: 'inv-6',
    componentName: 'Laser Printer Toner Cartridge Residue',
    category: 'Hazardous',
    sourceDevice: 'Epson L3210 / HP LaserJet Pro',
    weightKg: 0.85,
    quantity: 8,
    dismantledBy: 'Jayson Ramos',
    dateAdded: '2026-09-12',
  },
  {
    id: 'inv-7',
    componentName: 'Nickel-Cadmium (NiCd) Server Battery',
    category: 'Hazardous',
    sourceDevice: 'Cisco Catalyst 3850 Switch',
    weightKg: 0.30,
    quantity: 4,
    dismantledBy: 'Christian Arnuco',
    dateAdded: '2026-09-15',
  },
  {
    id: 'inv-8',
    componentName: 'Fluorescent Scanner Lamp Module',
    category: 'Hazardous',
    sourceDevice: 'HP ScanJet Enterprise',
    weightKg: 0.25,
    quantity: 2,
    dismantledBy: 'Alex Mercado',
    dateAdded: '2026-09-18',
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