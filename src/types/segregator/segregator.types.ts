// src/types/segregator/segregator.types.ts
// Shared type contracts for the Segregator module. UI components should only
// ever import these types (and the hooks/context that produce them) rather
// than shaping their own local versions, so the whole module stays in sync.

export type SegregationMode = 'professional' | 'guided' | string;

export type WorkOrderStatus =
  | 'Pending Review'
  | 'In Progress'
  | 'Completed'
  | 'Pending Quarantine Review';

export interface WorkOrder {
  id: string;
  referenceCode: string;
  deviceName: string;
  sourceDepartment: string;
  quantity: number;
  custodianNotes: string;
  dateAssigned: string; // ISO date string
  status: WorkOrderStatus;
  /** Whether a reference diagram exists for this device (Mapped vs Trait-mode fallback). */
  hasDiagram: boolean;
}

export type ComponentClassification = 'Hazardous' | 'Reusable' | 'Recyclable' | string;

export type ComponentStatus = 'Pending' | 'Segregated' | 'Quarantined';

/** A clickable pin overlaid on a mapped reference diagram. */
export interface ComponentPin {
  id: string;
  label: string;
  classification: ComponentClassification;
  /** Position on the diagram canvas, as a percentage (0-100) of width/height. */
  x: number;
  y: number;
  handlingInstructions: string;
  safetyAlert?: string;
  status: ComponentStatus;
}

/** A generic fallback trait card used when no diagram exists for a device. */
export interface TraitCard {
  id: string;
  label: string;
  classification: ComponentClassification;
  handlingInstructions: string;
  safetyAlert?: string;
  status: ComponentStatus;
}

export type InspectableComponent = ComponentPin | TraitCard;

export type SessionOutcome = 'Segregated' | 'Quarantined';

export interface DismantlingSessionLog {
  id?: string; // Optional dahil pwedeng sa Context na ito i-generate
  workOrderId: string;
  deviceName?: string; 
  referenceCode?: string;
  selectedItemName?: string; // Para sa mga manual parts na pinili sa workspace
  mode?: SegregationMode;
  startedAt?: string; // ISO
  completedAt: string; // ISO
  durationSeconds: number;
  
  // Mga bagong idinagdag para sa custom workspace natin
  formattedTime?: string;
  status?: 'in-progress' | 'completed' | 'quarantined' | string;
  remarks?: string;
  components?: Array<{ name: string; classification: string }>;
  classificationSummary?: {
    Hazardous: number;
    Reusable: number;
    Recyclable: number;
  };

  outcome?: SessionOutcome;
  finalClassificationSummary?: Record<ComponentClassification, number>;
  destinationBins?: string[];
  quarantineReason?: string;
}

export interface DashboardMetrics {
  activeAssignedTasks: number;
  completedToday: number;
  totalQuarantined: number;
  totalProcessingTimeMinutes: number;
}

/** The views this module can render. Wire these into the host app's router,
 * or use them as-is with the self-contained SegregatorModule shell. */
export type SegregatorView = 'dashboard' | 'queue' | 'workspace' | 'logs';