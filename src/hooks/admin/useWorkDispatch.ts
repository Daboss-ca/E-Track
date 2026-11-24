import { useState, useMemo } from 'react';

export interface ReturnSlipItem {
  id: string;
  deviceName: string;
  quantity: number;
  unit: string;
  acquisitionCost: number;
  propertyNo?: string; // Para sa PRS
  returnReason?: 'Unserviceable' | 'No longer needed' | 'Reassignment' | 'Other'; // Para sa PRS
  dateAcquired?: string; // Para sa PRS
  icsNo?: string; // Para sa RRSP
  endUser?: string; // Para sa RRSP
  location?: string; // Para sa RRSP
}

export interface ValidatedReturnSlip {
  id: string;
  trackingCode: string;
  slipType: 'PRS' | 'RRSP';
  department: string;
  custodianName: string;
  validatedDate: string;
  status: 'Pending Admin Approval' | 'Approved' | 'Rejected';
  items: ReturnSlipItem[];
}

const mockReturnSlips: ValidatedReturnSlip[] = [
  {
    id: 'slip-101',
    trackingCode: 'PRS-2026-0042',
    slipType: 'PRS',
    department: 'College of Computer Studies',
    custodianName: 'Juan Dela Cruz',
    validatedDate: '2026-09-01',
    status: 'Pending Admin Approval',
    items: [
      {
        id: 'item-1',
        deviceName: 'Dell PowerEdge R740 Server Rack',
        quantity: 1, // PRS quantity laging 1
        unit: 'unit', // PRS unit laging unit
        acquisitionCost: 75000,
        propertyNo: 'PRS-2026-001',
        returnReason: 'Unserviceable',
        dateAcquired: '2023-05-12',
      },
      {
        id: 'item-2',
        deviceName: 'Cisco Catalyst 3850 Switch',
        quantity: 1, // PRS quantity laging 1
        unit: 'unit', // PRS unit laging unit
        acquisitionCost: 55000,
        propertyNo: 'PRS-2026-002',
        returnReason: 'Unserviceable',
        dateAcquired: '2023-06-20',
      },
      {
        id: 'item-3',
        deviceName: 'APC Smart-UPS 3000VA',
        quantity: 1, // PRS quantity laging 1
        unit: 'unit', // PRS unit laging unit
        acquisitionCost: 62000,
        propertyNo: 'PRS-2026-003',
        returnReason: 'No longer needed',
        dateAcquired: '2022-11-10',
      },
    ],
  },
  {
    id: 'slip-102',
    trackingCode: 'RRSP-2026-0012',
    slipType: 'RRSP',
    department: 'Office of the Registrar',
    custodianName: 'Ana Reyes',
    validatedDate: '2026-09-05',
    status: 'Pending Admin Approval',
    items: [
      {
        id: 'item-4',
        deviceName: 'Epson L3210 Ink Tank Printer',
        quantity: 2, // RRSP pwedeng higit sa 1
        unit: 'units',
        acquisitionCost: 8500,
        icsNo: 'ICS-2026-998',
        endUser: 'Juan Dela Cruz',
        location: 'Registrar Main Office',
      },
      {
        id: 'item-5',
        deviceName: 'Logitech Wireless Keyboard & Mouse Set',
        quantity: 5, // RRSP pwedeng higit sa 1
        unit: 'sets',
        acquisitionCost: 1500,
        icsNo: 'ICS-2026-999',
        endUser: 'Maria Santos',
        location: 'Records Section',
      },
      {
        id: 'item-6',
        deviceName: 'ViewSonic 24-inch IPS Monitor',
        quantity: 3, // RRSP pwedeng higit sa 1
        unit: 'units',
        acquisitionCost: 6500,
        icsNo: 'ICS-2026-1000',
        endUser: 'Admin Staff',
        location: 'Evaluation Room',
      },
    ],
  },
];

export function useWorkDispatch() {
  const [slips, setSlips] = useState<ValidatedReturnSlip[]>(mockReturnSlips);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSlips = useMemo(() => {
    return slips.filter(
      (slip) =>
        slip.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.items.some((item) => item.deviceName.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [slips, searchTerm]);

  const handleApproveSlip = (slipId: string) => {
    setSlips((prev) =>
      prev.map((item) =>
        item.id === slipId ? { ...item, status: 'Approved' } : item
      )
    );
  };

  return {
    slips: filteredSlips,
    searchTerm,
    setSearchTerm,
    handleApproveSlip,
  };
}