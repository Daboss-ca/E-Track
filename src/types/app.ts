export type UserRole = 'Faculty' | 'Custodian' | 'Admin' | 'Segregator';

export type RequestStatus =
  | 'Draft'
  | 'Pending Approval'
  | 'Approved'
  | 'In Transit'
  | 'Processing'
  | 'Completed'
  | 'Rejected';

export type EquipmentCategory =
  | 'IT Equipment'
  | 'Peripherals'
  | 'Networking'
  | 'Audio/Visual'
  | 'Appliances'
  | 'Furniture'
  | 'Other';

export type EquipmentCondition = 'Working' | 'Not Working' | 'For Parts' | 'Unknown';

export interface EquipmentItem {
  id: string;
  description: string;
  quantity: number;
  category: EquipmentCategory;
  condition: EquipmentCondition;
  notes?: string;
}

export type LifecycleStage = 'Faculty' | 'Custodian' | 'Admin' | 'Worker';

export interface LifecycleStep {
  stage: LifecycleStage;
  label: string;
  completedAt?: string;
  completedBy?: string;
  isCurrent: boolean;
  isComplete: boolean;
}

export interface EWasteRequest {
  id: string;
  trackingCode: string;
  itemName: string;
  category: EquipmentCategory;
  departmentCode: string;
  departmentName: string;
  dateSubmitted: string;
  requestedBy: string;
  status: RequestStatus;
  equipmentItems: EquipmentItem[];
  photoCount: number;
  lifecycle: LifecycleStep[];
  notes?: string;
}

export interface DepartmentSnapshot {
  code: string;
  name: string;
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  totalItemsDisposed: number;
  co2SavedKg: number;
}

export type NotificationType = 'status_update' | 'approval_needed' | 'system' | 'reminder';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: NotificationType;
  relatedTrackingCode?: string;
}