export type CvsuIctCategory =
  | 'Servers'
  | 'Desktop'
  | 'Laptop'
  | 'Mobile Phone'
  | 'Tablet'
  | 'Printer'
  | 'Network Switch'
  | 'Other E-Device';

export interface HazardousComponentTemplate {
  componentName: string;
  classification: 'Hazardous' | 'Non-Hazardous';
  defaultWeightKg: number;
}

export interface DeviceCatalogRule {
  category: CvsuIctCategory;
  keywords: string[];
  recommendedSlipType: 'PRS' | 'RRSP';
  defaultComponents: HazardousComponentTemplate[];
}

const DEFAULT_FALLBACK_COMPONENTS: HazardousComponentTemplate[] = [
  {
    componentName: 'Electronic Circuit Board / Battery Module',
    classification: 'Hazardous',
    defaultWeightKg: 0.5,
  },
];

export const CVSU_ICT_CATALOG: DeviceCatalogRule[] = [
  {
    category: 'Servers',
    keywords: ['server', 'servers', 'rack', 'blade', 'poweredge', 'proliant', 'raid'],
    recommendedSlipType: 'PRS',
    defaultComponents: [
      {
        componentName: 'Motherboard Soldered Circuit Board',
        classification: 'Hazardous',
        defaultWeightKg: 1.2,
      },
      {
        componentName: 'Nickel-Cadmium (NiCd) Server Battery',
        classification: 'Hazardous',
        defaultWeightKg: 0.3,
      },
    ],
  },
  {
    category: 'Desktop',
    keywords: ['desktop', 'pc', 'workstation', 'cpu', 'optiplex', 'elitedesk', 'monitor', 'lcd', 'led', 'crt'],
    recommendedSlipType: 'RRSP',
    defaultComponents: [
      {
        componentName: 'Motherboard Soldered Circuit Board',
        classification: 'Hazardous',
        defaultWeightKg: 0.85,
      },
      {
        componentName: 'Mercury-Containing CCFL / Display Module',
        classification: 'Hazardous',
        defaultWeightKg: 0.2,
      },
    ],
  },
  {
    category: 'Laptop',
    keywords: ['laptop', 'laptops', 'notebook', 'macbook', 'thinkpad', 'latitude', 'inspiron', 'pavilion'],
    recommendedSlipType: 'RRSP',
    defaultComponents: [
      {
        componentName: 'Lithium-ion Laptop Battery Pack',
        classification: 'Hazardous',
        defaultWeightKg: 0.45,
      },
      {
        componentName: 'LCD / LED Display & Circuit Assembly',
        classification: 'Hazardous',
        defaultWeightKg: 0.3,
      },
    ],
  },
  {
    category: 'Mobile Phone',
    keywords: ['mobile phone', 'smartphone', 'cellphone', 'phone', 'iphone', 'android', 'handset'],
    recommendedSlipType: 'RRSP',
    defaultComponents: [
      {
        componentName: 'Lithium-ion / Li-Po Battery',
        classification: 'Hazardous',
        defaultWeightKg: 0.08,
      },
      {
        componentName: 'Micro-PCB & Display Panel',
        classification: 'Hazardous',
        defaultWeightKg: 0.06,
      },
    ],
  },
  {
    category: 'Tablet',
    keywords: ['tablet', 'tablets', 'ipad', 'galaxy tab'],
    recommendedSlipType: 'RRSP',
    defaultComponents: [
      {
        componentName: 'Lithium-ion / Li-Po Battery',
        classification: 'Hazardous',
        defaultWeightKg: 0.15,
      },
      {
        componentName: 'OLED / LCD Touch Panel & Circuit Board',
        classification: 'Hazardous',
        defaultWeightKg: 0.12,
      },
    ],
  },
  {
    category: 'Printer',
    keywords: ['printer', 'printers', 'laserjet', 'ink tank', 'scanner', 'plotter', 'copier', 'mfp'],
    recommendedSlipType: 'RRSP',
    defaultComponents: [
      {
        componentName: 'Laser Printer Toner Cartridge Residue',
        classification: 'Hazardous',
        defaultWeightKg: 0.85,
      },
      {
        componentName: 'Printer Control Circuit Board & Fuser',
        classification: 'Hazardous',
        defaultWeightKg: 0.4,
      },
    ],
  },
  {
    category: 'Network Switch',
    keywords: ['switch', 'router', 'access point', 'catalyst', 'unifi', 'patch panel', 'modem'],
    recommendedSlipType: 'RRSP',
    defaultComponents: [
      {
        componentName: 'Network Switch Printed Circuit Board',
        classification: 'Hazardous',
        defaultWeightKg: 0.35,
      },
    ],
  },
  {
    category: 'Other E-Device',
    keywords: ['ups', 'avr', 'projector', 'cctv', 'webcam', 'speaker', 'keyboard', 'mouse'],
    recommendedSlipType: 'RRSP',
    defaultComponents: DEFAULT_FALLBACK_COMPONENTS,
  },
];

const NON_E_DEVICE_KEYWORDS = [
  'chair',
  'table',
  'desk',
  'cabinet',
  'whiteboard',
  'blackboard',
  'curtain',
  'electric fan',
  'stand fan',
  'shelves',
  'shelf',
  'sofa',
  'locker',
  'wooden',
];

function matchesWholeKeyword(text: string, keyword: string): boolean {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`\\b${escaped}\\b`, 'i').test(text);
}

export interface DeviceClassificationResult {
  isEDevice: boolean;
  ictCategory: CvsuIctCategory | null;
  components: HazardousComponentTemplate[];
}

export function getComponentsForCategory(
  category?: CvsuIctCategory | string | null
): HazardousComponentTemplate[] {
  if (!category) return DEFAULT_FALLBACK_COMPONENTS;
  const matched = CVSU_ICT_CATALOG.find((rule) => rule.category === category);
  return matched ? matched.defaultComponents : DEFAULT_FALLBACK_COMPONENTS;
}

export function classifyDeviceItem(
  deviceName: string,
  explicitIsEDevice?: boolean,
  explicitCategory?: CvsuIctCategory | null
): DeviceClassificationResult {
  if (explicitIsEDevice === false) {
    return {
      isEDevice: false,
      ictCategory: null,
      components: [],
    };
  }

  if (explicitIsEDevice === true) {
    const category = explicitCategory || 'Other E-Device';
    return {
      isEDevice: true,
      ictCategory: category,
      components: getComponentsForCategory(category),
    };
  }

  if (explicitCategory) {
    return {
      isEDevice: true,
      ictCategory: explicitCategory,
      components: getComponentsForCategory(explicitCategory),
    };
  }

  const normalized = deviceName.trim().toLowerCase();
  if (!normalized || NON_E_DEVICE_KEYWORDS.some((kw) => matchesWholeKeyword(normalized, kw))) {
    return {
      isEDevice: false,
      ictCategory: null,
      components: [],
    };
  }

  for (const rule of CVSU_ICT_CATALOG) {
    if (rule.keywords.some((kw) => matchesWholeKeyword(normalized, kw))) {
      return {
        isEDevice: true,
        ictCategory: rule.category,
        components: rule.defaultComponents,
      };
    }
  }

  return {
    isEDevice: false,
    ictCategory: null,
    components: [],
  };
}