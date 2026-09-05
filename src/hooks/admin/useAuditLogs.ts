import { useState, useMemo } from 'react';

export interface ExtractedPart {
  partName: string;
  category: 'Hazardous' | 'Reusable' | 'Recyclable';
  count: number;
  weightKg: number;
}

export interface DisposalReport {
  reportId: string;
  batchCode: string;
  totalWeightKg: number;
  dateGenerated: string;
  complianceStatus: 'Compliant' | 'Pending Review';
  extractedParts: ExtractedPart[];
}

export interface AuditLogItem {
  id: string;
  action: 'Approval' | 'Status Change' | 'Task Assignment';
  details: string;
  performedBy: string;
  role: string;
  timestamp: string;
  status: 'Verified' | 'Logged';
}

const mockDisposalReports: DisposalReport[] = [
  {
    reportId: 'REP-2026-001',
    batchCode: 'BATCH-2026-08A',
    totalWeightKg: 145.80,
    dateGenerated: '2026-09-01',
    complianceStatus: 'Compliant',
    extractedParts: [
      { partName: 'Lithium-ion Battery Pack', category: 'Hazardous', count: 12, weightKg: 18.50 },
      { partName: 'DDR4 8GB RAM Stick', category: 'Reusable', count: 24, weightKg: 1.20 },
      { partName: 'Aluminum Heatsink Casing', category: 'Recyclable', count: 15, weightKg: 35.00 },
      { partName: 'Mercury Tilt Switch', category: 'Hazardous', count: 5, weightKg: 0.80 },
    ],
  },
  {
    reportId: 'REP-2026-002',
    batchCode: 'BATCH-2026-08B',
    totalWeightKg: 92.30,
    dateGenerated: '2026-09-03',
    complianceStatus: 'Compliant',
    extractedParts: [
      { partName: 'CRT Monitor Glass Tube', category: 'Hazardous', count: 8, weightKg: 42.00 },
      { partName: 'Intel Core i7 Processor', category: 'Reusable', count: 10, weightKg: 0.50 },
      { partName: 'Copper Wiring Harness', category: 'Recyclable', count: 30, weightKg: 28.40 },
    ],
  },
];

const mockAuditLogs: AuditLogItem[] = [
  {
    id: 'LOG-9041',
    action: 'Approval',
    details: 'Approved Custodian Return Slip EWR-2026-0042 from College of Engineering.',
    performedBy: 'Christian Arnuco',
    role: 'Admin',
    timestamp: '2026-09-05 14:22',
    status: 'Verified',
  },
  {
    id: 'LOG-9042',
    action: 'Task Assignment',
    details: 'Dispatched 5 units of HP LaserJet Printers to Segregator Alex Mercado.',
    performedBy: 'Christian Arnuco',
    role: 'Admin',
    timestamp: '2026-09-05 14:25',
    status: 'Verified',
  },
  {
    id: 'LOG-9043',
    action: 'Status Change',
    details: 'Marked Lithium-ion Battery Pack as Hazardous inventory item.',
    performedBy: 'Alex Mercado',
    role: 'Segregator',
    timestamp: '2026-09-05 15:10',
    status: 'Logged',
  },
];

export function useAuditLogs() {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedFilter, setSelectedFilter] = useState<string>('All');
  const [isExporting, setIsExporting] = useState<boolean>(false);

  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter((log) => {
      const matchesFilter = selectedFilter === 'All' || log.action === selectedFilter;
      const matchesSearch =
        log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [searchTerm, selectedFilter]);

  const handleGeneratePDF = (reportId: string, batchCode: string, callback?: (msg: string) => void) => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      callback?.(`Success: Official PDF Report for [${batchCode}] (${reportId}) generated.`);
    }, 1000);
  };

  return {
    searchTerm,
    setSearchTerm,
    selectedFilter,
    setSelectedFilter,
    isExporting,
    auditLogs: mockAuditLogs,
    disposalReports: mockDisposalReports,
    filteredLogs,
    handleGeneratePDF,
  };
}