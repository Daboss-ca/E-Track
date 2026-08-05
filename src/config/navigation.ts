// src/config/navigation.ts
import type { ElementType } from 'react';
import {
  LayoutDashboard,
  FilePlus2,
  Recycle,
  ClipboardCheck,
  FileText,
  Boxes,
  Users,
  BarChart3,
  QrCode,
} from 'lucide-react';

export type Role = 'admin' | 'faculty'  | 'custodian' | 'segregator';

export interface NavigationItem {
  id: string; 
  label: string;
  path: string;
  icon?: ElementType; 
  children?: NavigationItem[];
}

export const navigationConfig: Record<Role, NavigationItem[]> = {
  // 1. FACULTY
  faculty: [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      path: '/faculty',
      icon: LayoutDashboard,
    },
    {
      id: 'requests',
      label: 'E-Waste Requests',
      path: '/faculty/requests',
      icon: FilePlus2,
      children: [
        { id: 'requests-new', label: 'Submit Request', path: '/faculty/requests/new' },
        { id: 'requests-ledger', label: 'Request Ledger', path: '/faculty/requests/ledger' },
      ],
    },
    {
      id: 'tracking',
      label: 'Lifecycle Tracking',
      path: '/faculty/tracking',
      icon: Recycle,
      children: [
        { id: 'tracking-active', label: 'Active Pickups', path: '/faculty/tracking/active' },
        { id: 'tracking-history', label: 'Disposal History', path: '/faculty/tracking/history' },
      ],
    },
  ],

  // 2. CUSTODIAN
  custodian: [
    { 
      id: 'validation-hub', 
      label: 'Validation Hub', 
      path: '/custodian',
      icon: ClipboardCheck,
    },
    { 
      id: 'return-slip', 
      label: 'Return Slip Generator', 
      path: '/custodian/return-slip',
      icon: FileText,
    },
    { 
      id: 'inter-office-monitoring', 
      label: 'Inter-Office Monitoring', 
      path: '/custodian/monitoring',
      icon: Recycle,
    },
  ],

  admin: [
    { id: 'overview', label: 'Overview', path: '/admin', icon: LayoutDashboard },
    { id: 'capacity-guard', label: 'Capacity Guard', path: '/admin/capacity', icon: BarChart3 },
    { id: 'dispatch-tasks', label: 'Dispatch & Tasks', path: '/admin/dispatch', icon: Boxes },
    { id: 'inventory-control', label: 'Inventory Control', path: '/admin/inventory', icon: Boxes },
    { id: 'audit-logs', label: 'Audit Logs', path: '/admin/audit', icon: Users },
  ],
  segregator: [
    { id: 'worker-input', label: 'Worker Input', path: '/segregator', icon: QrCode },
    { id: 'dismantling-map', label: 'Dismantling Map', path: '/segregator/map', icon: Boxes },
    { id: 'parts-log', label: 'Parts Log', path: '/segregator/parts', icon: FileText },
  ],
};