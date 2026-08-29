import { useState, useEffect, useMemo, useCallback } from 'react';
import type { 
  DismantlingSessionLog, 
  SegregationMode, 
  WorkOrder,
  ComponentClassification 
} from '../../types/segregator/segregator.types';

export interface HazardousSubPart {
  id: string;
  name: string;
  classification: ComponentClassification;
  description: string;
}

export interface ComponentPart {
  id: string;
  name: string;
  classification: ComponentClassification;
  imageUrl: string;
  description: string;
  hazardousSubParts?: HazardousSubPart[];
}

export interface ManualCustomPart {
  id: string;
  name: string;
  classification: ComponentClassification;
  weight: string;
}

const itemComponentsMap: Record<string, ComponentPart[]> = {
  'high-1': [
    { id: 'p-1', name: 'Motherboard', classification: 'Recyclable', imageUrl: '/public/image/dismantling/img6.jpg', description: 'ATX computer motherboard top view components containing precious metals and silicon.', hazardousSubParts: [{ id: 'sub-cmos', name: 'CMOS Coin Battery', classification: 'Hazardous', description: 'Contains lithium and chemicals on the circuit board.' }, { id: 'sub-cap', name: 'Electrolytic Capacitors', classification: 'Hazardous', description: 'Contains hazardous chemical electrolytes.' }] },
    { id: 'p-2', name: 'RAM Memory Sticks', classification: 'Reusable', imageUrl: '/public/image/dismantling/img5.jpg', description: 'DDR RAM memory sticks desktop closeup for recovery or testing.', hazardousSubParts: [{ id: 'sub-ram-solder', name: 'Lead Solder Joints', classification: 'Hazardous', description: 'Traces of heavy metal solder on contacts.' }] },
    { id: 'p-3', name: 'Processor (CPU)', classification: 'Reusable', imageUrl: '/public/image/dismantling/img4.jpg', description: 'CPU processor chip gold pins bottom view.', hazardousSubParts: [{ id: 'sub-cpu-pins', name: 'Beryllium / Heavy Metal Pins', classification: 'Hazardous', description: 'Internal toxic trace metals in substrate.' }] },
    { id: 'p-4', name: 'Power Supply (PSU)', classification: 'Recyclable', imageUrl: '/public/image/dismantling/img3.jpg', description: 'Computer power supply unit opened internal view with transformers and capacitors.', hazardousSubParts: [{ id: 'sub-psu-cap', name: 'High-Voltage Capacitors', classification: 'Hazardous', description: 'Stores toxic dielectric fluids and chemical residue.' }, { id: 'sub-psu-fuse', name: 'Lead Components', classification: 'Hazardous', description: 'Contains heavy metal solders.' }] },
    { id: 'p-5', name: 'Storage (HDD / SSD)', classification: 'Reusable', imageUrl: '/public/image/dismantling/img2.jpg', description: 'Internal hard disk drive and SSD storage components.', hazardousSubParts: [{ id: 'sub-hdd-magnet', name: 'Neodymium Magnets', classification: 'Hazardous', description: 'Rare earth elements requiring careful extraction.' }] },
    { id: 'p-6', name: 'Casing (Chassis)', classification: 'Recyclable', imageUrl: '/public/image/dismantling/img1.jpg', description: 'Empty computer case steel chassis internal structure.', hazardousSubParts: [{ id: 'sub-case-paint', name: 'Chemical Coating / Paint', classification: 'Hazardous', description: 'Anti-corrosion chemical layers on metal panels.' }] },
  ],
  'high-2': [
    { id: 'lap-1', name: 'Laptop Motherboard', classification: 'Recyclable', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', description: 'Laptop motherboard circuit board closeup.', hazardousSubParts: [{ id: 'lap-sub-1', name: 'CMOS Battery', classification: 'Hazardous', description: 'Small lithium cell battery.' }] },
    { id: 'lap-2', name: 'Lithium-ion Battery', classification: 'Hazardous', imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80', description: 'Lithium ion laptop battery pack hazard component.', hazardousSubParts: [{ id: 'lap-sub-2', name: 'Lithium Cell Core', classification: 'Hazardous', description: 'Flammable electrolyte core.' }] },
    { id: 'lap-3', name: 'LCD Panel Screen', classification: 'Recyclable', imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80', description: 'Laptop LCD screen panel disassembled.', hazardousSubParts: [{ id: 'lap-sub-3', name: 'Mercury Backlight Tubes', classification: 'Hazardous', description: 'Contains trace mercury vapor.' }] },
    { id: 'lap-4', name: 'Keyboard Membrane', classification: 'Recyclable', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80', description: 'Laptop keyboard internal membrane and ribbon cable.', hazardousSubParts: [{ id: 'lap-sub-4', name: 'Flexible PCB Circuit Glue', classification: 'Hazardous', description: 'Chemical adhesives.' }] },
  ],
  'high-3': [
    { id: 'pr-1', name: 'Printer Logic Board', classification: 'Recyclable', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', description: 'Printer main logic circuit board.', hazardousSubParts: [{ id: 'pr-sub-1', name: 'Soldered Capacitors', classification: 'Hazardous', description: 'Electrolytic fluid.' }] },
    { id: 'pr-2', name: 'Toner Cartridge', classification: 'Hazardous', imageUrl: 'https://images.unsplash.com/photo-1588702547923-7093a0c3bab3?auto=format&fit=crop&w=600&q=80', description: 'Laser toner cartridge ink hazard waste.', hazardousSubParts: [{ id: 'pr-sub-2', name: 'Micro-plastic Toner Powder', classification: 'Hazardous', description: 'Inhalation hazard fine chemical dust.' }] },
    { id: 'pr-3', name: 'Mechanical Rollers', classification: 'Recyclable', imageUrl: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&w=600&q=80', description: 'Printer mechanical gears and rubber rollers.', hazardousSubParts: [{ id: 'pr-sub-3', name: 'Treated Rubber Compounds', classification: 'Hazardous', description: 'Vulcanized chemical rubber.' }] },
  ],
  'low-1': [
    { id: 'lw-1', name: 'Keyboard Membrane', classification: 'Recyclable', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80', description: 'Inside computer keyboard membrane dome and internal circuitry.', hazardousSubParts: [{ id: 'lw-sub-1', name: 'Carbon Conductive Ink', classification: 'Hazardous', description: 'Chemical residue on membrane.' }] },
    { id: 'lw-2', name: 'Copper Wiring / Cable', classification: 'Recyclable', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', description: 'Stripped copper wires scrap electronics.', hazardousSubParts: [{ id: 'lw-sub-2', name: 'PVC Wire Insulation Coating', classification: 'Hazardous', description: 'Chlorinated plastic coating.' }] },
  ],
  'low-2': [
    { id: 'mon-1', name: 'LCD Glass Panel', classification: 'Hazardous', imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80', description: 'Monitor LCD screen panel containing backlights and circuitry.', hazardousSubParts: [{ id: 'mon-sub-1', name: 'CCFL Backlight Tubes', classification: 'Hazardous', description: 'Contains mercury gas.' }] },
    { id: 'mon-2', name: 'Control Circuit Board', classification: 'Recyclable', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', description: 'Monitor power and video processing PCB board.', hazardousSubParts: [{ id: 'mon-sub-2', name: 'Onboard Capacitors', classification: 'Hazardous', description: 'Electrolytic chemicals.' }] },
  ],
};

const defaultParts: ComponentPart[] = [
  { id: 'def-1', name: 'Main Circuit Board (PCB)', classification: 'Recyclable', imageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80', description: 'General printed circuit board containing electronic components.', hazardousSubParts: [{ id: 'def-sub-1', name: 'Standard Solder & Capacitors', classification: 'Hazardous', description: 'Chemical and heavy metal components.' }] },
  { id: 'def-2', name: 'Internal Wiring & Connectors', classification: 'Recyclable', imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80', description: 'Copper wire harnesses and connectors.', hazardousSubParts: [{ id: 'def-sub-2', name: 'Plastic Wire Shielding', classification: 'Hazardous', description: 'Insulation materials.' }] },
  { id: 'def-3', name: 'Outer Casing / Shell', classification: 'Recyclable', imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80', description: 'Protective enclosure housing.', hazardousSubParts: [{ id: 'def-sub-3', name: 'Treated Coatings', classification: 'Hazardous', description: 'Surface finish chemicals.' }] },
];

export interface UseDismantlingSessionWorkspaceProps {
  workOrder: WorkOrder;
  mode: SegregationMode;
  selectedItemId: string;
  selectedItemName: string;
  onSubmitSession: (log: DismantlingSessionLog) => void;
}

export function useDismantlingSessionWorkspace({
  workOrder,
  mode,
  selectedItemId,
  selectedItemName,
  onSubmitSession,
}: UseDismantlingSessionWorkspaceProps) {
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  
  const [checkedMainCards, setCheckedMainCards] = useState<Record<string, boolean>>({});
  const [checkedSubParts, setCheckedSubParts] = useState<Record<string, boolean>>({});
  const [activeModalPart, setActiveModalPart] = useState<ComponentPart | null>(null);

  const [itemWeight, setItemWeight] = useState<string>('');
  const [manualParts, setManualParts] = useState<ManualCustomPart[]>([]);
  const [newPartName, setNewPartName] = useState('');
  const [newPartClass, setNewPartClass] = useState<ComponentClassification>('Recyclable');
  const [newPartWeight, setNewPartWeight] = useState('');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning]);

  const formattedTime = useMemo(() => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [seconds]);

  const currentParts = useMemo(() => itemComponentsMap[selectedItemId] || defaultParts, [selectedItemId]);

  const handleSubPartToggle = useCallback((subId: string) => {
    setCheckedSubParts((prev) => ({ ...prev, [subId]: !prev[subId] }));
  }, []);

  const handleFinishModalHazards = useCallback((part: ComponentPart) => {
    setCheckedMainCards((prev) => ({ ...prev, [part.id]: true }));
    setActiveModalPart(null);
  }, []);

  const handleAddManualPart = useCallback(() => {
    if (!newPartName.trim()) return;
    const customPart: ManualCustomPart = {
      id: `manual-${Date.now()}`,
      name: newPartName.trim(),
      classification: newPartClass,
      weight: newPartWeight.trim(),
    };
    setManualParts((prev) => [...prev, customPart]);
    setNewPartName('');
    setNewPartWeight('');
  }, [newPartName, newPartClass, newPartWeight]);

  const handleRemoveManualPart = useCallback((id: string) => {
    setManualParts((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const combinedTotalWeight = useMemo(() => {
    const totalManualWeight = manualParts.reduce((acc, curr) => {
      const w = parseFloat(curr.weight);
      return acc + (isNaN(w) ? 0 : w);
    }, 0);
    const baseWeight = parseFloat(itemWeight);
    return (isNaN(baseWeight) ? 0 : baseWeight) + totalManualWeight;
  }, [manualParts, itemWeight]);

  const handleSubmit = useCallback(() => {
    const summary = { Hazardous: 0, Reusable: 0, Recyclable: 0 };
    
    currentParts.forEach((part) => {
      if (checkedMainCards[part.id]) {
        summary[part.classification as keyof typeof summary]++;
      }
    });

    manualParts.forEach((mp) => {
      summary[mp.classification as keyof typeof summary]++;
    });

    const destinationBins: string[] = [];
    if (summary.Hazardous > 0) destinationBins.push('Hazmat Containment Bin');
    if (summary.Reusable > 0) destinationBins.push('Reuse / Refurbishment Bin');
    if (summary.Recyclable > 0) destinationBins.push('Recycling Bin');

    // Kunin ang mga nakacheck na hazardous sub-parts per main part para maipakita sa details
    const componentsWithHazards = currentParts
      .filter((p) => checkedMainCards[p.id])
      .map((p) => {
        const checkedHazards = p.hazardousSubParts?.filter((sub) => checkedSubParts[sub.id]) || [];
        return {
          name: p.name,
          classification: p.classification,
          hazardousSubParts: checkedHazards.map((sub) => sub.name),
        };
      });

    const sessionLog: DismantlingSessionLog & { totalWeight?: string } = {
      id: `LOG-${Date.now()}`,
      workOrderId: workOrder.id,
      deviceName: workOrder.deviceName,
      referenceCode: workOrder.referenceCode,
      selectedItemName: selectedItemName,
      mode: mode,
      startedAt: new Date(Date.now() - seconds * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      durationSeconds: seconds,
      formattedTime,
      status: 'completed',
      outcome: 'Segregated',
      destinationBins: destinationBins,
      components: [
        ...componentsWithHazards,
        ...manualParts.map((mp) => ({ name: mp.name, classification: mp.classification })),
      ],
      classificationSummary: summary,
      finalClassificationSummary: summary,
      totalWeight: `${combinedTotalWeight.toFixed(2)} kg`,
      remarks: `Processed ${selectedItemName} under ${mode} mode. Total Weight: ${combinedTotalWeight.toFixed(2)} kg.`,
    };

    onSubmitSession(sessionLog as DismantlingSessionLog);
  }, [checkedMainCards, checkedSubParts, combinedTotalWeight, currentParts, formattedTime, manualParts, mode, onSubmitSession, seconds, selectedItemName, workOrder]);

  const getBadgeColor = (classification: ComponentClassification) => {
    switch (classification) {
      case 'Hazardous': return 'error';
      case 'Reusable': return 'success';
      case 'Recyclable': default: return 'info';
    }
  };

  return {
    isRunning,
    setIsRunning,
    formattedTime,
    currentParts,
    activeModalPart,
    setActiveModalPart,
    checkedMainCards,
    checkedSubParts,
    handleSubPartToggle,
    handleFinishModalHazards,
    getBadgeColor,
    manualParts,
    newPartName,
    setNewPartName,
    newPartClass,
    setNewPartClass,
    newPartWeight,
    setNewPartWeight,
    handleAddManualPart,
    handleRemoveManualPart,
    itemWeight,
    setItemWeight,
    combinedTotalWeight,
    handleSubmit
  };
}