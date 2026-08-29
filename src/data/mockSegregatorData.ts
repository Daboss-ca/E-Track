// src/data/mockSegregatorData.ts
// Local mock dataset standing in for the Supply Office / Admin backend.
// Swap the exported functions below for real API calls once the endpoints
// exist — every consumer only depends on the function signatures, not on
// how the data is sourced.

import type {
  ComponentPin,
  DismantlingSessionLog,
  TraitCard,
  WorkOrder,
} from '../types/segregator/segregator.types';

export const initialWorkOrders: WorkOrder[] = [
  {
    id: 'WO-1001',
    referenceCode: 'EWR-2026-0142',
    deviceName: 'Dell OptiPlex 7010 Desktop Unit',
    sourceDepartment: 'College of Engineering — Computer Lab 3',
    quantity: 4,
    custodianNotes:
      'Units powered off and unplugged. Two chassis have visible dust buildup. No leaking components observed at handover.',
    dateAssigned: '2026-08-24T09:15:00+08:00',
    status: 'Pending Review',
    hasDiagram: true,
  },
  {
    id: 'WO-1002',
    referenceCode: 'EWR-2026-0143',
    deviceName: 'APC Smart-UPS 1500 Battery Backup',
    sourceDepartment: 'Registrar\'s Office',
    quantity: 1,
    custodianNotes:
      'Unit was already flagged for a swollen battery pack during intake inspection. Handle with caution — kept upright during transport.',
    dateAssigned: '2026-08-24T10:02:00+08:00',
    status: 'Pending Review',
    hasDiagram: false,
  },
  {
    id: 'WO-1003',
    referenceCode: 'EWR-2026-0144',
    deviceName: 'Epson L3110 Inkjet Printer',
    sourceDepartment: 'College of Business — Faculty Room',
    quantity: 2,
    custodianNotes: 'Ink tanks still partially filled. One unit has a paper jam in the tray.',
    dateAssigned: '2026-08-23T14:40:00+08:00',
    status: 'In Progress',
    hasDiagram: true,
  },
  {
    id: 'WO-1004',
    referenceCode: 'EWR-2026-0138',
    deviceName: 'Generic 24-Port Network Switch',
    sourceDepartment: 'IT Services — Server Room B',
    quantity: 1,
    custodianNotes: 'No manufacturer diagram on file for this model. Casing intact, no visible damage.',
    dateAssigned: '2026-08-22T08:30:00+08:00',
    status: 'Completed',
    hasDiagram: false,
  },
];

// --- Component pins for mapped (diagrammed) devices -------------------------

const pinsByWorkOrder: Record<string, ComponentPin[]> = {
  'WO-1001': [
    {
      id: 'WO-1001-P1',
      label: 'CMOS Battery',
      classification: 'Hazardous',
      x: 28,
      y: 34,
      handlingInstructions:
        'Remove with insulated tweezers and place directly into the sealed hazardous-waste tray. Do not puncture.',
      safetyAlert: 'Contains lithium — never crush or short the terminals.',
      status: 'Pending',
    },
    {
      id: 'WO-1001-P2',
      label: 'RAM Modules',
      classification: 'Reusable',
      x: 52,
      y: 22,
      handlingInstructions: 'Release the side clips evenly and lift straight up. Bag and label with capacity/speed.',
      status: 'Pending',
    },
    {
      id: 'WO-1001-P3',
      label: 'Aluminum Heat Sink',
      classification: 'Recyclable',
      x: 66,
      y: 45,
      handlingInstructions: 'Unclip from the socket bracket. Wipe residual thermal paste before placing in the metals bin.',
      status: 'Pending',
    },
    {
      id: 'WO-1001-P4',
      label: 'Power Supply Unit',
      classification: 'Hazardous',
      x: 80,
      y: 70,
      handlingInstructions: 'Discharge capacitors before handling. Route to the certified PSU disposal partner.',
      safetyAlert: 'Residual electrical charge risk even when unplugged.',
      status: 'Pending',
    },
    {
      id: 'WO-1001-P5',
      label: 'HDD / SSD Storage',
      classification: 'Reusable',
      x: 38,
      y: 78,
      handlingInstructions: 'Log the serial number, then route to Data Sanitation before it can be marked reusable.',
      safetyAlert: 'Do not release until data-wipe confirmation is logged.',
      status: 'Pending',
    },
    {
      id: 'WO-1001-P6',
      label: 'Steel Chassis Frame',
      classification: 'Recyclable',
      x: 14,
      y: 58,
      handlingInstructions: 'Strip remaining cabling, then flatten and place in the ferrous metals pallet.',
      status: 'Pending',
    },
  ],
  'WO-1003': [
    {
      id: 'WO-1003-P1',
      label: 'Ink Cartridge Assembly',
      classification: 'Hazardous',
      x: 34,
      y: 30,
      handlingInstructions: 'Extract without squeezing. Place in a leak-proof pouch before the hazardous bin.',
      safetyAlert: 'Residual ink is a skin and fabric irritant.',
      status: 'Pending',
    },
    {
      id: 'WO-1003-P2',
      label: 'Print Head Unit',
      classification: 'Reusable',
      x: 58,
      y: 40,
      handlingInstructions: 'Cap the nozzles with the supplied film before bagging for the reuse shelf.',
      status: 'Pending',
    },
    {
      id: 'WO-1003-P3',
      label: 'Plastic Housing Shell',
      classification: 'Recyclable',
      x: 50,
      y: 74,
      handlingInstructions: 'Remove screws and separate by resin code printed on the inner shell.',
      status: 'Pending',
    },
    {
      id: 'WO-1003-P4',
      label: 'Main Logic Board',
      classification: 'Recyclable',
      x: 74,
      y: 62,
      handlingInstructions: 'Desolder any coin cell first, then place on the e-scrap circuit-board pallet.',
      status: 'Pending',
    },
  ],
};

// --- Generic trait cards for unmapped / unknown devices ---------------------

const genericTraitTemplate: Omit<TraitCard, 'id'>[] = [
  {
    label: 'Solid Metal Casing',
    classification: 'Recyclable',
    handlingInstructions: 'Detach exterior panels and sort by metal type (steel/aluminum) into the metals bin.',
    status: 'Pending',
  },
  {
    label: 'External Wires & Cabling',
    classification: 'Recyclable',
    handlingInstructions: 'Coil and bundle by gauge. Strip connectors that contain gold-plated contacts separately.',
    status: 'Pending',
  },
  {
    label: 'Sealed Battery Pack',
    classification: 'Hazardous',
    handlingInstructions: 'Do not open the seal. Tape the terminals and place directly in the hazardous-waste tray.',
    safetyAlert: 'Sealed cells can vent or ignite if punctured or shorted.',
    status: 'Pending',
  },
  {
    label: 'Circuit Boards',
    classification: 'Reusable',
    handlingInstructions: 'Inspect for corrosion or burn marks. Undamaged boards go to the reuse/testing shelf.',
    status: 'Pending',
  },
];

const traitsByWorkOrder: Record<string, TraitCard[]> = {};

function getOrCreateTraitCards(workOrderId: string): TraitCard[] {
  if (!traitsByWorkOrder[workOrderId]) {
    traitsByWorkOrder[workOrderId] = genericTraitTemplate.map((trait, index) => ({
      ...trait,
      id: `${workOrderId}-T${index + 1}`,
    }));
  }
  return traitsByWorkOrder[workOrderId];
}

/** Returns the mapped diagram pins for a work order (empty if none defined). */
export function getPinsForWorkOrder(workOrderId: string): ComponentPin[] {
  return pinsByWorkOrder[workOrderId] ? pinsByWorkOrder[workOrderId].map((p) => ({ ...p })) : [];
}

/** Returns the trait-card fallback set for a work order, creating it on first access. */
export function getTraitCardsForWorkOrder(workOrderId: string): TraitCard[] {
  return getOrCreateTraitCards(workOrderId).map((t) => ({ ...t }));
}

// --- Historical session logs (seed data for the Completed/Quarantine views) -

export const initialSessionLogs: DismantlingSessionLog[] = [
  {
    id: 'LOG-9001',
    workOrderId: 'WO-1004',
    deviceName: 'Generic 24-Port Network Switch',
    referenceCode: 'EWR-2026-0138',
    mode: 'guided',
    startedAt: '2026-08-22T09:05:00+08:00',
    completedAt: '2026-08-22T09:31:00+08:00',
    durationSeconds: 1560,
    outcome: 'Segregated',
    finalClassificationSummary: { Hazardous: 0, Reusable: 1, Recyclable: 3 },
    destinationBins: ['Reuse / Refurbishment Bin', 'Recycling Bin'],
  },
  {
    id: 'LOG-9000',
    workOrderId: 'WO-0996',
    deviceName: 'HP LaserJet Pro M15w',
    referenceCode: 'EWR-2026-0129',
    mode: 'professional',
    startedAt: '2026-08-20T13:12:00+08:00',
    completedAt: '2026-08-20T13:24:00+08:00',
    durationSeconds: 720,
    outcome: 'Quarantined',
    quarantineReason: 'Toner cartridge casing cracked mid-session; suspected fine-particle exposure risk.',
  },
];
