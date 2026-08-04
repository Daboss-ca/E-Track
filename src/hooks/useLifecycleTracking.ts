// src/hooks/useLifecycleTracking.ts
import { useState } from 'react';

export interface PickupItem {
  id: string;
  trackingCode: string;
  itemName: string;
  category: string;
  quantity: number;
  location: string;
  scheduledDate: string;
  assignedCustodian: string;
  status: 'Scheduled for Pickup' | 'In Transit' | 'Arrival at Facility';
  notes?: string;
}

export interface DisposalRecord {
  id: string;
  trackingCode: string;
  itemName: string;
  category: string;
  quantity: number;
  disposalMethod: 'Dismantled for Parts' | 'E-Waste Recycled' | 'Hazardous Storage';
  disposalDate: string;
  certificateNo: string;
  handledBy: string;
}

const INITIAL_PICKUPS: PickupItem[] = [
  {
    id: '1',
    trackingCode: 'EWR-CCS-2026-0046',
    itemName: 'Dell OptiPlex Desktop Unit',
    category: 'IT Equipment',
    quantity: 3,
    location: 'CCS Building - Room 302',
    scheduledDate: '2026-08-06',
    assignedCustodian: 'Mr. Ricardo Dizon',
    status: 'Scheduled for Pickup',
    notes: 'Please bring hand truck for transport.',
  },
  {
    id: '2',
    trackingCode: 'EWR-CEIT-2026-0012',
    itemName: 'Cisco Core Switches & Patch Panels',
    category: 'Networking',
    quantity: 2,
    location: 'CEIT Server Room A',
    scheduledDate: '2026-08-05',
    assignedCustodian: 'Ms. Elena Torres',
    status: 'In Transit',
  },
];

const INITIAL_DISPOSALS: DisposalRecord[] = [
  {
    id: '101',
    trackingCode: 'EWR-CBEA-2026-0003',
    itemName: 'HP LaserJet Printers (Obsolete)',
    category: 'Peripherals',
    quantity: 4,
    disposalMethod: 'Dismantled for Parts',
    disposalDate: '2026-07-28',
    certificateNo: 'CERT-2026-0891',
    handledBy: 'GreenTrack Sorting Hub',
  },
  {
    id: '102',
    trackingCode: 'EWR-CCS-2026-0001',
    itemName: 'CRT Monitors (Non-functional)',
    category: 'IT Equipment',
    quantity: 6,
    disposalMethod: 'Hazardous Storage',
    disposalDate: '2026-07-15',
    certificateNo: 'CERT-2026-0742',
    handledBy: 'Certified Hazardous Facility',
  },
];

export const useLifecycleTracking = () => {
  const [pickups] = useState<PickupItem[]>(INITIAL_PICKUPS);
  const [disposals] = useState<DisposalRecord[]>(INITIAL_DISPOSALS);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPickups = pickups.filter(
    (item) =>
      item.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDisposals = disposals.filter(
    (item) =>
      item.trackingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.itemName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.certificateNo.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    pickups: filteredPickups,
    disposals: filteredDisposals,
    searchQuery,
    setSearchQuery,
  };
};