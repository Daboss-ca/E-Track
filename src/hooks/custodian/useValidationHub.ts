// src/hooks/useValidationHub.ts
import { useState } from 'react';

export interface ValidationRequest {
  id: string;
  trackingCode: string;
  facultyName: string;
  department: string;
  itemName: string;
  category: string;
  description: string;
  condition: 'For Disposal' | 'Needs Repair' | 'Functional';
  photoUrl?: string;
  dateSubmitted: string;
  status: 'Pending' | 'Approved' | 'Rejected';
  remarks?: string;
}

const initialRequests: ValidationRequest[] = [
  {
    id: '1',
    trackingCode: 'EW-2026-001',
    facultyName: 'Dr. Maria Santos',
    department: 'College of Computing Studies',
    itemName: 'Dell Optiplex 7010 Desktop',
    category: 'Computers & Peripherals',
    description: 'Motherboard shorted out, old unit from 2018. Cannot boot up.',
    condition: 'For Disposal',
    photoUrl: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400',
    dateSubmitted: '2026-08-01',
    status: 'Pending',
  },
  {
    id: '2',
    trackingCode: 'EW-2026-002',
    facultyName: 'Prof. Juan Dela Cruz',
    department: 'Engineering Department',
    itemName: 'HP LaserJet Pro Printer',
    category: 'Office Equipment',
    description: 'Paper feed roller jammed and broken gears. Might be repairable.',
    condition: 'Needs Repair',
    photoUrl: 'https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?w=400',
    dateSubmitted: '2026-08-02',
    status: 'Pending',
  },
];

export function useValidationHub() {
  const [requests, setRequests] = useState<ValidationRequest[]>(initialRequests);
  const [selectedRequest, setSelectedRequest] = useState<ValidationRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenInspection = (req: ValidationRequest) => {
    setSelectedRequest(req);
    setRemarks(req.remarks || '');
    setIsModalOpen(true);
  };

  const handleCloseInspection = () => {
    setSelectedRequest(null);
    setRemarks('');
    setIsModalOpen(false);
  };

  const handleApprove = (id: string) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'Approved' as const, remarks } : req))
    );
    handleCloseInspection();
  };

  const handleReject = (id: string) => {
    setRequests((prev) =>
      prev.map((req) => (req.id === id ? { ...req, status: 'Rejected' as const, remarks } : req))
    );
    handleCloseInspection();
  };

  const filteredRequests = requests.filter(
    (r) =>
      r.trackingCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.facultyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return {
    requests: filteredRequests,
    selectedRequest,
    isModalOpen,
    remarks,
    setRemarks,
    searchTerm,
    setSearchTerm,
    handleOpenInspection,
    handleCloseInspection,
    handleApprove,
    handleReject,
  };
}