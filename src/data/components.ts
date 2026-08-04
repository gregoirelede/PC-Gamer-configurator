import type {
  AnyComponent,
  CPU,
  Case,
  Cooler,
  GPU,
  Motherboard,
  PSU,
  RAM,
  Storage,
} from "../types";

/**
 * Base de composants avec prix de référence en euros (TTC, indicatifs).
 * `price` = prix courant constaté chez les grands marchands sécurisés,
 * `avgPrice90` = moyenne 90 jours servant à la détection de bons plans.
 * Voir src/prices/provider.ts pour brancher une source de prix réelle.
 */

export const CPUS: CPU[] = [
  { id: "cpu-r5-5500", category: "cpu", brand: "AMD", name: "Ryzen 5 5500", price: 79, avgPrice90: 84, socket: "AM4", cores: 6, threads: 12, tdp: 65, fpsGaming: 92, multiScore: 11, igpu: false, includedCooler: true },
  { id: "cpu-r5-5600", category: "cpu", brand: "AMD", name: "Ryzen 5 5600", price: 105, avgPrice90: 112, socket: "AM4", cores: 6, threads: 12, tdp: 65, fpsGaming: 105, multiScore: 11.5, igpu: false, includedCooler: true },
  { id: "cpu-r7-5700x3d", category: "cpu", brand: "AMD", name: "Ryzen 7 5700X3D", price: 199, avgPrice90: 219, socket: "AM4", cores: 8, threads: 16, tdp: 105, fpsGaming: 150, multiScore: 15, igpu: false, includedCooler: false },
  { id: "cpu-r5-7500f", category: "cpu", brand: "AMD", name: "Ryzen 5 7500F", price: 149, avgPrice90: 158, socket: "AM5", cores: 6, threads: 12, tdp: 65, fpsGaming: 132, multiScore: 14.5, igpu: false, includedCooler: false },
  { id: "cpu-r5-7600", category: "cpu", brand: "AMD", name: "Ryzen 5 7600", price: 189, avgPrice90: 199, socket: "AM5", cores: 6, threads: 12, tdp: 65, fpsGaming: 140, multiScore: 15.5, igpu: true, includedCooler: true },
  { id: "cpu-r5-9600x", category: "cpu", brand: "AMD", name: "Ryzen 5 9600X", price: 229, avgPrice90: 245, socket: "AM5", cores: 6, threads: 12, tdp: 65, fpsGaming: 150, multiScore: 17, igpu: true, includedCooler: false },
  { id: "cpu-r7-7700", category: "cpu", brand: "AMD", name: "Ryzen 7 7700", price: 259, avgPrice90: 272, socket: "AM5", cores: 8, threads: 16, tdp: 65, fpsGaming: 148, multiScore: 19.5, igpu: true, includedCooler: true },
  { id: "cpu-r7-7800x3d", category: "cpu", brand: "AMD", name: "Ryzen 7 7800X3D", price: 339, avgPrice90: 389, socket: "AM5", cores: 8, threads: 16, tdp: 120, fpsGaming: 185, multiScore: 18, igpu: true, includedCooler: false },
  { id: "cpu-r7-9700x", category: "cpu", brand: "AMD", name: "Ryzen 7 9700X", price: 299, avgPrice90: 315, socket: "AM5", cores: 8, threads: 16, tdp: 65, fpsGaming: 158, multiScore: 21, igpu: true, includedCooler: false },
  { id: "cpu-r7-9800x3d", category: "cpu", brand: "AMD", name: "Ryzen 7 9800X3D", price: 479, avgPrice90: 499, socket: "AM5", cores: 8, threads: 16, tdp: 120, fpsGaming: 205, multiScore: 23, igpu: true, includedCooler: false },
  { id: "cpu-r9-9900x", category: "cpu", brand: "AMD", name: "Ryzen 9 9900X", price: 399, avgPrice90: 429, socket: "AM5", cores: 12, threads: 24, tdp: 120, fpsGaming: 162, multiScore: 29, igpu: true, includedCooler: false },
  { id: "cpu-r9-9950x3d", category: "cpu", brand: "AMD", name: "Ryzen 9 9950X3D", price: 699, avgPrice90: 729, socket: "AM5", cores: 16, threads: 32, tdp: 170, fpsGaming: 205, multiScore: 42, igpu: true, includedCooler: false },
  { id: "cpu-i3-12100f", category: "cpu", brand: "Intel", name: "Core i3-12100F", price: 82, avgPrice90: 86, socket: "LGA1700", cores: 4, threads: 8, tdp: 58, fpsGaming: 88, multiScore: 8.5, igpu: false, includedCooler: true },
  { id: "cpu-i5-12400f", category: "cpu", brand: "Intel", name: "Core i5-12400F", price: 109, avgPrice90: 118, socket: "LGA1700", cores: 6, threads: 12, tdp: 65, fpsGaming: 104, multiScore: 12.5, igpu: false, includedCooler: true },
  { id: "cpu-i5-13400f", category: "cpu", brand: "Intel", name: "Core i5-13400F", price: 159, avgPrice90: 169, socket: "LGA1700", cores: 10, threads: 16, tdp: 65, fpsGaming: 122, multiScore: 16.5, igpu: false, includedCooler: true },
  { id: "cpu-i5-14600kf", category: "cpu", brand: "Intel", name: "Core i5-14600KF", price: 225, avgPrice90: 249, socket: "LGA1700", cores: 14, threads: 20, tdp: 125, fpsGaming: 150, multiScore: 24, igpu: false, includedCooler: false },
  { id: "cpu-i7-14700kf", category: "cpu", brand: "Intel", name: "Core i7-14700KF", price: 329, avgPrice90: 355, socket: "LGA1700", cores: 20, threads: 28, tdp: 125, fpsGaming: 160, multiScore: 33, igpu: false, includedCooler: false },
  { id: "cpu-cu7-265k", category: "cpu", brand: "Intel", name: "Core Ultra 7 265K", price: 329, avgPrice90: 359, socket: "LGA1851", cores: 20, threads: 20, tdp: 125, fpsGaming: 155, multiScore: 34, igpu: true, includedCooler: false },
];

export const GPUS: GPU[] = [
  { id: "gpu-rx6600", category: "gpu", brand: "AMD", name: "Radeon RX 6600 8 Go", price: 189, avgPrice90: 199, vram: 8, lengthMm: 220, tgp: 132, recPsu: 450, connector: "PCIe8", fps: { "1080": 100, "1440": 70, "2160": 35 } },
  { id: "gpu-rtx3060", category: "gpu", brand: "NVIDIA", name: "GeForce RTX 3060 12 Go", price: 249, avgPrice90: 262, vram: 12, lengthMm: 242, tgp: 170, recPsu: 550, connector: "PCIe8", fps: { "1080": 105, "1440": 72, "2160": 38 } },
  { id: "gpu-rx7600", category: "gpu", brand: "AMD", name: "Radeon RX 7600 8 Go", price: 269, avgPrice90: 282, vram: 8, lengthMm: 240, tgp: 165, recPsu: 550, connector: "PCIe8", fps: { "1080": 112, "1440": 78, "2160": 38 } },
  { id: "gpu-b580", category: "gpu", brand: "Intel", name: "Arc B580 12 Go", price: 269, avgPrice90: 289, vram: 12, lengthMm: 272, tgp: 190, recPsu: 600, connector: "PCIe8", fps: { "1080": 110, "1440": 85, "2160": 45 } },
  { id: "gpu-rtx4060", category: "gpu", brand: "NVIDIA", name: "GeForce RTX 4060 8 Go", price: 289, avgPrice90: 299, vram: 8, lengthMm: 244, tgp: 115, recPsu: 550, connector: "PCIe8", fps: { "1080": 115, "1440": 80, "2160": 40 } },
  { id: "gpu-rtx5060", category: "gpu", brand: "NVIDIA", name: "GeForce RTX 5060 8 Go", price: 319, avgPrice90: 329, vram: 8, lengthMm: 250, tgp: 145, recPsu: 550, connector: "PCIe8", fps: { "1080": 130, "1440": 92, "2160": 45 } },
  { id: "gpu-rx9060xt", category: "gpu", brand: "AMD", name: "Radeon RX 9060 XT 16 Go", price: 359, avgPrice90: 379, vram: 16, lengthMm: 260, tgp: 160, recPsu: 600, connector: "PCIe8", fps: { "1080": 140, "1440": 105, "2160": 55 } },
  { id: "gpu-rtx5060ti", category: "gpu", brand: "NVIDIA", name: "GeForce RTX 5060 Ti 16 Go", price: 449, avgPrice90: 465, vram: 16, lengthMm: 255, tgp: 180, recPsu: 600, connector: "PCIe8", fps: { "1080": 145, "1440": 110, "2160": 58 } },
  { id: "gpu-rx7800xt", category: "gpu", brand: "AMD", name: "Radeon RX 7800 XT 16 Go", price: 479, avgPrice90: 512, vram: 16, lengthMm: 287, tgp: 263, recPsu: 700, connector: "PCIe8", fps: { "1080": 160, "1440": 125, "2160": 68 } },
  { id: "gpu-rtx5070", category: "gpu", brand: "NVIDIA", name: "GeForce RTX 5070 12 Go", price: 579, avgPrice90: 619, vram: 12, lengthMm: 285, tgp: 250, recPsu: 650, connector: "12VHPWR", fps: { "1080": 175, "1440": 140, "2160": 75 } },
  { id: "gpu-rx9070", category: "gpu", brand: "AMD", name: "Radeon RX 9070 16 Go", price: 629, avgPrice90: 649, vram: 16, lengthMm: 289, tgp: 220, recPsu: 650, connector: "PCIe8", fps: { "1080": 180, "1440": 145, "2160": 80 } },
  { id: "gpu-rx9070xt", category: "gpu", brand: "AMD", name: "Radeon RX 9070 XT 16 Go", price: 729, avgPrice90: 789, vram: 16, lengthMm: 304, tgp: 304, recPsu: 750, connector: "PCIe8", fps: { "1080": 195, "1440": 160, "2160": 90 } },
  { id: "gpu-rtx5070ti", category: "gpu", brand: "NVIDIA", name: "GeForce RTX 5070 Ti 16 Go", price: 799, avgPrice90: 839, vram: 16, lengthMm: 300, tgp: 300, recPsu: 750, connector: "12VHPWR", fps: { "1080": 195, "1440": 165, "2160": 95 } },
  { id: "gpu-rx7900xtx", category: "gpu", brand: "AMD", name: "Radeon RX 7900 XTX 24 Go", price: 899, avgPrice90: 949, vram: 24, lengthMm: 287, tgp: 355, recPsu: 800, connector: "PCIe8", fps: { "1080": 205, "1440": 180, "2160": 105 } },
  { id: "gpu-rtx5080", category: "gpu", brand: "NVIDIA", name: "GeForce RTX 5080 16 Go", price: 1099, avgPrice90: 1149, vram: 16, lengthMm: 304, tgp: 360, recPsu: 850, connector: "12VHPWR", fps: { "1080": 215, "1440": 190, "2160": 115 } },
  { id: "gpu-rtx5090", category: "gpu", brand: "NVIDIA", name: "GeForce RTX 5090 32 Go", price: 2299, avgPrice90: 2399, vram: 32, lengthMm: 304, tgp: 575, recPsu: 1000, connector: "12VHPWR", fps: { "1080": 235, "1440": 225, "2160": 160 } },
];

export const MOTHERBOARDS: Motherboard[] = [
  { id: "mb-b550m-ds3h", category: "motherboard", brand: "Gigabyte", name: "B550M DS3H", price: 89, avgPrice90: 95, socket: "AM4", chipset: "B550", formFactor: "mATX", ramType: "DDR4", ramSlots: 4, m2Slots: 2, wifi: false },
  { id: "mb-b550-tomahawk", category: "motherboard", brand: "MSI", name: "MAG B550 Tomahawk", price: 129, avgPrice90: 139, socket: "AM4", chipset: "B550", formFactor: "ATX", ramType: "DDR4", ramSlots: 4, m2Slots: 2, wifi: false },
  { id: "mb-b650m-p", category: "motherboard", brand: "MSI", name: "PRO B650M-P", price: 109, avgPrice90: 119, socket: "AM5", chipset: "B650", formFactor: "mATX", ramType: "DDR5", ramSlots: 4, m2Slots: 2, wifi: false },
  { id: "mb-b650-gaming-x", category: "motherboard", brand: "Gigabyte", name: "B650 Gaming X AX", price: 149, avgPrice90: 159, socket: "AM5", chipset: "B650", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, m2Slots: 3, wifi: true },
  { id: "mb-b850-gaming-plus", category: "motherboard", brand: "MSI", name: "B850 Gaming Plus WiFi", price: 189, avgPrice90: 199, socket: "AM5", chipset: "B850", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, m2Slots: 3, wifi: true },
  { id: "mb-x870-strix", category: "motherboard", brand: "ASUS", name: "ROG Strix X870-A Gaming WiFi", price: 319, avgPrice90: 339, socket: "AM5", chipset: "X870", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, m2Slots: 4, wifi: true },
  { id: "mb-b760m-p-ddr4", category: "motherboard", brand: "MSI", name: "PRO B760M-P DDR4", price: 99, avgPrice90: 106, socket: "LGA1700", chipset: "B760", formFactor: "mATX", ramType: "DDR4", ramSlots: 4, m2Slots: 2, wifi: false },
  { id: "mb-b760-gaming-x", category: "motherboard", brand: "Gigabyte", name: "B760 Gaming X DDR5", price: 139, avgPrice90: 149, socket: "LGA1700", chipset: "B760", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, m2Slots: 3, wifi: false },
  { id: "mb-z790-ud", category: "motherboard", brand: "Gigabyte", name: "Z790 UD AX", price: 209, avgPrice90: 225, socket: "LGA1700", chipset: "Z790", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, m2Slots: 3, wifi: true },
  { id: "mb-b860m-a", category: "motherboard", brand: "MSI", name: "PRO B860M-A WiFi", price: 159, avgPrice90: 169, socket: "LGA1851", chipset: "B860", formFactor: "mATX", ramType: "DDR5", ramSlots: 4, m2Slots: 2, wifi: true },
  { id: "mb-b860-tuf", category: "motherboard", brand: "ASUS", name: "TUF Gaming B860-Plus WiFi", price: 199, avgPrice90: 212, socket: "LGA1851", chipset: "B860", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, m2Slots: 3, wifi: true },
  { id: "mb-z890-tomahawk", category: "motherboard", brand: "MSI", name: "MAG Z890 Tomahawk WiFi", price: 299, avgPrice90: 319, socket: "LGA1851", chipset: "Z890", formFactor: "ATX", ramType: "DDR5", ramSlots: 4, m2Slots: 4, wifi: true },
];

export const RAMS: RAM[] = [
  { id: "ram-ddr4-16-3200", category: "ram", brand: "Corsair", name: "Vengeance LPX 16 Go (2×8) DDR4-3200 CL16", price: 35, avgPrice90: 38, ramType: "DDR4", capacityGb: 16, speedMhz: 3200, cl: 16, sticks: 2 },
  { id: "ram-ddr4-32-3600", category: "ram", brand: "G.Skill", name: "Ripjaws V 32 Go (2×16) DDR4-3600 CL18", price: 62, avgPrice90: 68, ramType: "DDR4", capacityGb: 32, speedMhz: 3600, cl: 18, sticks: 2 },
  { id: "ram-ddr5-16-5200", category: "ram", brand: "Crucial", name: "Pro 16 Go (2×8) DDR5-5200 CL42", price: 49, avgPrice90: 54, ramType: "DDR5", capacityGb: 16, speedMhz: 5200, cl: 42, sticks: 2 },
  { id: "ram-ddr5-32-6000-cl36", category: "ram", brand: "Kingston", name: "Fury Beast 32 Go (2×16) DDR5-6000 CL36", price: 85, avgPrice90: 92, ramType: "DDR5", capacityGb: 32, speedMhz: 6000, cl: 36, sticks: 2 },
  { id: "ram-ddr5-32-6000-cl30", category: "ram", brand: "G.Skill", name: "Trident Z5 Neo 32 Go (2×16) DDR5-6000 CL30", price: 95, avgPrice90: 112, ramType: "DDR5", capacityGb: 32, speedMhz: 6000, cl: 30, sticks: 2 },
  { id: "ram-ddr5-48-6000", category: "ram", brand: "Corsair", name: "Vengeance 48 Go (2×24) DDR5-6000 CL30", price: 139, avgPrice90: 149, ramType: "DDR5", capacityGb: 48, speedMhz: 6000, cl: 30, sticks: 2 },
  { id: "ram-ddr5-64-6000", category: "ram", brand: "Kingston", name: "Fury Beast 64 Go (2×32) DDR5-6000 CL36", price: 179, avgPrice90: 195, ramType: "DDR5", capacityGb: 64, speedMhz: 6000, cl: 36, sticks: 2 },
  { id: "ram-ddr5-32-7200", category: "ram", brand: "G.Skill", name: "Trident Z5 RGB 32 Go (2×16) DDR5-7200 CL34", price: 129, avgPrice90: 139, ramType: "DDR5", capacityGb: 32, speedMhz: 7200, cl: 34, sticks: 2 },
];

export const STORAGES: Storage[] = [
  { id: "sto-p3plus-1", category: "storage", brand: "Crucial", name: "P3 Plus 1 To", price: 59, avgPrice90: 63, interface: "NVMe Gen4", capacityGb: 1000, readMbs: 5000 },
  { id: "sto-nv3-1", category: "storage", brand: "Kingston", name: "NV3 1 To", price: 62, avgPrice90: 66, interface: "NVMe Gen4", capacityGb: 1000, readMbs: 6000 },
  { id: "sto-sn770-1", category: "storage", brand: "WD", name: "Black SN770 1 To", price: 69, avgPrice90: 74, interface: "NVMe Gen4", capacityGb: 1000, readMbs: 5150 },
  { id: "sto-990evo-1", category: "storage", brand: "Samsung", name: "990 EVO Plus 1 To", price: 84, avgPrice90: 89, interface: "NVMe Gen4", capacityGb: 1000, readMbs: 7250 },
  { id: "sto-t500-2", category: "storage", brand: "Crucial", name: "T500 2 To", price: 129, avgPrice90: 142, interface: "NVMe Gen4", capacityGb: 2000, readMbs: 7400 },
  { id: "sto-sn850x-2", category: "storage", brand: "WD", name: "Black SN850X 2 To", price: 139, avgPrice90: 162, interface: "NVMe Gen4", capacityGb: 2000, readMbs: 7300 },
  { id: "sto-990pro-2", category: "storage", brand: "Samsung", name: "990 Pro 2 To", price: 159, avgPrice90: 172, interface: "NVMe Gen4", capacityGb: 2000, readMbs: 7450 },
  { id: "sto-t705-2", category: "storage", brand: "Crucial", name: "T705 2 To (Gen5)", price: 239, avgPrice90: 255, interface: "NVMe Gen5", capacityGb: 2000, readMbs: 14500 },
];

export const PSUS: PSU[] = [
  { id: "psu-a550bn", category: "psu", brand: "MSI", name: "MAG A550BN 550 W", price: 49, avgPrice90: 53, wattage: 550, efficiency: "Bronze", modular: false, native12vhpwr: false },
  { id: "psu-cx650", category: "psu", brand: "Corsair", name: "CX650 650 W", price: 64, avgPrice90: 69, wattage: 650, efficiency: "Bronze", modular: false, native12vhpwr: false },
  { id: "psu-a650gl", category: "psu", brand: "MSI", name: "MAG A650GL 650 W", price: 75, avgPrice90: 82, wattage: 650, efficiency: "Gold", modular: true, native12vhpwr: false },
  { id: "psu-rm750e", category: "psu", brand: "Corsair", name: "RM750e (ATX 3.1) 750 W", price: 99, avgPrice90: 114, wattage: 750, efficiency: "Gold", modular: true, native12vhpwr: true },
  { id: "psu-a850gl", category: "psu", brand: "MSI", name: "MAG A850GL PCIE5 850 W", price: 119, avgPrice90: 129, wattage: 850, efficiency: "Gold", modular: true, native12vhpwr: true },
  { id: "psu-rm850x", category: "psu", brand: "Corsair", name: "RM850x (ATX 3.1) 850 W", price: 139, avgPrice90: 152, wattage: 850, efficiency: "Gold", modular: true, native12vhpwr: true },
  { id: "psu-pp12m-1000", category: "psu", brand: "be quiet!", name: "Pure Power 12 M 1000 W", price: 149, avgPrice90: 159, wattage: 1000, efficiency: "Gold", modular: true, native12vhpwr: true },
  { id: "psu-rm1200x", category: "psu", brand: "Corsair", name: "RM1200x Shift 1200 W", price: 219, avgPrice90: 235, wattage: 1200, efficiency: "Gold", modular: true, native12vhpwr: true },
];

export const CASES: Case[] = [
  { id: "case-forge100m", category: "case", brand: "MSI", name: "MAG Forge 100M", price: 54, avgPrice90: 58, supports: ["ATX", "mATX", "ITX"], maxGpuLengthMm: 330, maxCoolerHeightMm: 160, radiatorSupport: 240, noise: 3 },
  { id: "case-p30", category: "case", brand: "Zalman", name: "P30 (mATX)", price: 55, avgPrice90: 59, supports: ["mATX", "ITX"], maxGpuLengthMm: 330, maxCoolerHeightMm: 160, radiatorSupport: 240, noise: 2 },
  { id: "case-air903max", category: "case", brand: "Montech", name: "AIR 903 MAX", price: 75, avgPrice90: 80, supports: ["ATX", "mATX", "ITX"], maxGpuLengthMm: 400, maxCoolerHeightMm: 175, radiatorSupport: 360, noise: 3 },
  { id: "case-lancool207", category: "case", brand: "Lian Li", name: "Lancool 207", price: 85, avgPrice90: 99, supports: ["ATX", "mATX", "ITX"], maxGpuLengthMm: 372, maxCoolerHeightMm: 180, radiatorSupport: 360, noise: 2 },
  { id: "case-popair", category: "case", brand: "Fractal", name: "Pop Air", price: 89, avgPrice90: 95, supports: ["ATX", "mATX", "ITX"], maxGpuLengthMm: 405, maxCoolerHeightMm: 170, radiatorSupport: 240, noise: 2 },
  { id: "case-h5flow", category: "case", brand: "NZXT", name: "H5 Flow (2024)", price: 94, avgPrice90: 99, supports: ["ATX", "mATX", "ITX"], maxGpuLengthMm: 365, maxCoolerHeightMm: 165, radiatorSupport: 360, noise: 2 },
  { id: "case-north", category: "case", brand: "Fractal", name: "North", price: 139, avgPrice90: 149, supports: ["ATX", "mATX", "ITX"], maxGpuLengthMm: 355, maxCoolerHeightMm: 170, radiatorSupport: 360, noise: 1 },
  { id: "case-o11evo", category: "case", brand: "Lian Li", name: "O11 Dynamic EVO", price: 149, avgPrice90: 159, supports: ["ATX", "mATX", "ITX"], maxGpuLengthMm: 426, maxCoolerHeightMm: 167, radiatorSupport: 360, noise: 1 },
];

const ALL_SOCKETS: Cooler["sockets"] = ["AM4", "AM5", "LGA1700", "LGA1851"];

export const COOLERS: Cooler[] = [
  { id: "cool-stock", category: "cooler", brand: "—", name: "Ventirad d'origine (inclus avec le CPU)", price: 0, avgPrice90: 0, type: "stock", heightMm: 70, tdpRating: 65, sockets: ALL_SOCKETS, noise: 3 },
  { id: "cool-freezer36", category: "cooler", brand: "Arctic", name: "Freezer 36", price: 29, avgPrice90: 33, type: "air", heightMm: 159, tdpRating: 200, sockets: ALL_SOCKETS, noise: 2 },
  { id: "cool-pa120se", category: "cooler", brand: "Thermalright", name: "Peerless Assassin 120 SE", price: 39, avgPrice90: 45, type: "air", heightMm: 155, tdpRating: 245, sockets: ALL_SOCKETS, noise: 2 },
  { id: "cool-ps120evo", category: "cooler", brand: "Thermalright", name: "Phantom Spirit 120 EVO", price: 49, avgPrice90: 54, type: "air", heightMm: 154, tdpRating: 260, sockets: ALL_SOCKETS, noise: 1 },
  { id: "cool-drp5", category: "cooler", brand: "be quiet!", name: "Dark Rock Pro 5", price: 89, avgPrice90: 96, type: "air", heightMm: 168, tdpRating: 270, sockets: ALL_SOCKETS, noise: 1 },
  { id: "cool-lf3-240", category: "cooler", brand: "Arctic", name: "Liquid Freezer III 240", price: 79, avgPrice90: 88, type: "aio240", heightMm: 0, tdpRating: 250, sockets: ALL_SOCKETS, noise: 1 },
  { id: "cool-lf3-360", category: "cooler", brand: "Arctic", name: "Liquid Freezer III 360", price: 105, avgPrice90: 115, type: "aio360", heightMm: 0, tdpRating: 320, sockets: ALL_SOCKETS, noise: 1 },
];

export const ALL_COMPONENTS: AnyComponent[] = [
  ...CPUS,
  ...GPUS,
  ...MOTHERBOARDS,
  ...RAMS,
  ...STORAGES,
  ...PSUS,
  ...CASES,
  ...COOLERS,
];

/** Date de référence des prix embarqués. */
export const PRICES_UPDATED_AT = "2026-08-04";
