// src/hooks/useDepartmentReport.ts
import { useState, useMemo } from 'react';
import type { EWasteRequest, EquipmentCategory, RequestStatus } from '../types/app';

export interface ReportFilters {
  startDate: string;
  endDate: string;
  category: string;
  status: string;
}

export function useDepartmentReport(initialLedger: EWasteRequest[]) {
  const departmentCode = 'CICS';
  const departmentName = 'College of Information and Computing Sciences';

  // Filter States
  const [filters, setFilters] = useState<ReportFilters>({
    startDate: '2026-01-01',
    endDate: new Date().toISOString().split('T')[0],
    category: 'All',
    status: 'All',
  });

  const [isExporting, setIsExporting] = useState(false);

  // Filtered Ledger based on user filters
  const filteredRequests = useMemo(() => {
    return initialLedger.filter((req) => {
      // Date filter
      if (filters.startDate && req.dateSubmitted < filters.startDate) return false;
      if (filters.endDate && req.dateSubmitted > filters.endDate) return false;

      // Category filter
      if (filters.category !== 'All' && req.category !== filters.category) return false;

      // Status filter
      if (filters.status !== 'All' && req.status !== filters.status) return false;

      return true;
    });
  }, [initialLedger, filters]);

  // Computed Summary Statistics
  const statistics = useMemo(() => {
    const totalRequests = filteredRequests.length;
    
    // Total quantity of items across all filtered requests
    const totalItemsCount = filteredRequests.reduce((acc, req) => {
      const itemsSum = req.equipmentItems?.reduce((sum, item) => sum + item.quantity, 0) || 0;
      return acc + itemsSum;
    }, 0);

    const statusCounts = filteredRequests.reduce((acc, req) => {
      acc[req.status] = (acc[req.status] || 0) + 1;
      return acc;
    }, {} as Record<RequestStatus, number>);

    const categoryBreakdown = filteredRequests.reduce((acc, req) => {
      const cat = req.category;
      const count = req.equipmentItems?.reduce((sum, item) => sum + item.quantity, 0) || 1;
      acc[cat] = (acc[cat] || 0) + count;
      return acc;
    }, {} as Record<EquipmentCategory, number>);

    return {
      totalRequests,
      totalItemsCount,
      statusCounts,
      categoryBreakdown,
    };
  }, [filteredRequests]);

  // Filter Actions
  const updateFilter = (key: keyof ReportFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      startDate: '2026-01-01',
      endDate: new Date().toISOString().split('T')[0],
      category: 'All',
      status: 'All',
    });
  };

  // Export Action Mock
  const exportReport = (format: 'PDF' | 'CSV') => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      window.alert(`Department Report successfully exported as ${format}!`);
    }, 1000);
  };

  return {
    departmentCode,
    departmentName,
    filters,
    filteredRequests,
    statistics,
    isExporting,
    actions: {
      updateFilter,
      resetFilters,
      exportReport,
    },
  };
}