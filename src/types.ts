export type Category =
  | "cpu"
  | "gpu"
  | "motherboard"
  | "ram"
  | "storage"
  | "psu"
  | "case"
  | "cooler";

export type Socket = "AM4" | "AM5" | "LGA1700" | "LGA1851";
export type RamType = "DDR4" | "DDR5";
export type FormFactor = "ATX" | "mATX" | "ITX";
export type Resolution = "1080" | "1440" | "2160";
export type ProfileId = "gaming" | "streaming" | "creation" | "silent";

export interface BaseComponent {
  id: string;
  category: Category;
  brand: string;
  name: string;
  /** Prix courant de référence en euros (indicatif, voir src/prices). */
  price: number;
  /** Moyenne des 90 derniers jours, pour la détection de bons plans. */
  avgPrice90: number;
}

export interface CPU extends BaseComponent {
  category: "cpu";
  socket: Socket;
  cores: number;
  threads: number;
  tdp: number;
  /** FPS moyen atteignable en jeu AAA (limite CPU, GPU très haut de gamme). */
  fpsGaming: number;
  /** Score multi-cœur (échelle Cinebench R23 / 1000). */
  multiScore: number;
  igpu: boolean;
  includedCooler: boolean;
}

export interface GPU extends BaseComponent {
  category: "gpu";
  vram: number;
  lengthMm: number;
  tgp: number;
  /** Alimentation recommandée par le constructeur (W). */
  recPsu: number;
  connector: "PCIe8" | "12VHPWR";
  /** FPS moyens en jeu AAA (qualité ultra) par définition. */
  fps: Record<Resolution, number>;
}

export interface Motherboard extends BaseComponent {
  category: "motherboard";
  socket: Socket;
  chipset: string;
  formFactor: FormFactor;
  ramType: RamType;
  ramSlots: number;
  m2Slots: number;
  wifi: boolean;
}

export interface RAM extends BaseComponent {
  category: "ram";
  ramType: RamType;
  capacityGb: number;
  speedMhz: number;
  cl: number;
  sticks: number;
}

export interface Storage extends BaseComponent {
  category: "storage";
  interface: "NVMe Gen3" | "NVMe Gen4" | "NVMe Gen5";
  capacityGb: number;
  readMbs: number;
}

export interface PSU extends BaseComponent {
  category: "psu";
  wattage: number;
  efficiency: "Bronze" | "Gold" | "Platinum";
  modular: boolean;
  /** Connecteur 12V-2x6 / 12VHPWR natif (ATX 3.x). */
  native12vhpwr: boolean;
}

export interface Case extends BaseComponent {
  category: "case";
  supports: FormFactor[];
  maxGpuLengthMm: number;
  maxCoolerHeightMm: number;
  /** Taille max de radiateur AIO supportée (0 = aucun). */
  radiatorSupport: 0 | 240 | 360;
  /** 1 = silencieux, 2 = normal, 3 = bruyant/airflow brut. */
  noise: 1 | 2 | 3;
}

export interface Cooler extends BaseComponent {
  category: "cooler";
  type: "stock" | "air" | "aio240" | "aio360";
  heightMm: number;
  /** TDP max dissipé confortablement (W). */
  tdpRating: number;
  sockets: Socket[];
  /** 1 = silencieux, 2 = normal, 3 = bruyant. */
  noise: 1 | 2 | 3;
}

export type AnyComponent =
  | CPU
  | GPU
  | Motherboard
  | RAM
  | Storage
  | PSU
  | Case
  | Cooler;

export interface Build {
  cpu: CPU;
  motherboard: Motherboard;
  ram: RAM;
  gpu: GPU;
  storage: Storage;
  psu: PSU;
  case: Case;
  cooler: Cooler;
}

export interface CompatIssue {
  severity: "error" | "warning";
  message: string;
}

export const CATEGORY_LABELS: Record<Category, string> = {
  cpu: "Processeur",
  gpu: "Carte graphique",
  motherboard: "Carte mère",
  ram: "Mémoire",
  storage: "Stockage",
  psu: "Alimentation",
  case: "Boîtier",
  cooler: "Refroidissement",
};

export const PROFILE_LABELS: Record<ProfileId, string> = {
  gaming: "Gaming pur",
  streaming: "Gaming + Streaming",
  creation: "Gaming + Création",
  silent: "Gaming silencieux",
};

export const RESOLUTION_LABELS: Record<Resolution, string> = {
  "1080": "1080p",
  "1440": "1440p",
  "2160": "4K",
};
