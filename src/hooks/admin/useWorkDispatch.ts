import { useState, useMemo, useCallback } from 'react';

export interface ValidatedReturnSlip {
  id: string;
  trackingCode: string;
  deviceName: string;
  category: string;
  department: string;
  custodianName: string;
  validatedDate: string;
  quantity: number;
  urgency: 'High' | 'Medium' | 'Low';
  status: 'Pending Admin Approval' | 'Dispatched' | 'Rejected';
  assignedSegregatorId?: string;
  assignedSegregatorName?: string;
}

export interface SegregatorWorker {
  id: string;
  name: string;
  status: 'Available' | 'Busy' | 'Offline';
  activeTasks: number;
}

const mockReturnSlips: ValidatedReturnSlip[] = [
  {
    id: 'slip-101',
    trackingCode: 'EWR-2026-0042',
    deviceName: 'Dell PowerEdge R740 Server Rack',
    category: 'Servers & Network Racks',
    department: 'College of Computer Studies',
    custodianName: 'Juan Dela Cruz',
    validatedDate: '2026-09-01',
    quantity: 2,
    urgency: 'High',
    status: 'Pending Admin Approval',
  },
  {
    id: 'slip-102',
    trackingCode: 'EWR-2026-0043',
    deviceName: 'HP LaserJet Pro M404dn Printers',
    category: 'Printers',
    department: 'Administrative Office',
    custodianName: 'Maria Santos',
    validatedDate: '2026-09-02',
    quantity: 5,
    urgency: 'Medium',
    status: 'Pending Admin Approval',
  },
];

const mockSegregators: SegregatorWorker[] = [
  { id: 'seg-1', name: 'Christian Arnuco', status: 'Available', activeTasks: 0 },
  { id: 'seg-2', name: 'Alex Mercado', status: 'Available', activeTasks: 1 },
  { id: 'seg-3', name: 'Jayson Ramos', status: 'Busy', activeTasks: 3 },
];

export function useWorkDispatch() {
  const [slips, setSlips] = useState<ValidatedReturnSlip[]>(mockReturnSlips);
  const [workers] = useState<SegregatorWorker[]>(mockSegregators);
  const [selectedSlip, setSelectedSlip] = useState<ValidatedReturnSlip | null>(null);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSlips = useMemo(() => {
    return slips.filter(
      (slip) =>
        slip.deviceName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
        slip.department.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [slips, searchTerm]);

  const handleOpenDispatchModal = useCallback((slip: ValidatedReturnSlip) => {
    setSelectedSlip(slip);
    setSelectedWorkerId('');
  }, []);

  const handleCloseDispatchModal = useCallback(() => {
    setSelectedSlip(null);
    setSelectedWorkerId('');
  }, []);

  const handleConfirmDispatch = useCallback(() => {
    if (!selectedSlip || !selectedWorkerId) return;

    const worker = workers.find((w) => w.id === selectedWorkerId);

    setSlips((prev) =>
      prev.map((item) =>
        item.id === selectedSlip.id
          ? {
              ...item,
              status: 'Dispatched',
              assignedSegregatorId: selectedWorkerId,
              assignedSegregatorName: worker?.name || 'Assigned Segregator',
            }
          : item
      )
    );

    handleCloseDispatchModal();
  }, [selectedSlip, selectedWorkerId, workers, handleCloseDispatchModal]);

  return {
    slips: filteredSlips,
    workers,
    searchTerm,
    setSearchTerm,
    selectedSlip,
    selectedWorkerId,
    setSelectedWorkerId,
    handleOpenDispatchModal,
    handleCloseDispatchModal,
    handleConfirmDispatch,
  };
}