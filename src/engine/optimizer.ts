import {
  CASES,
  COOLERS,
  CPUS,
  GPUS,
  MOTHERBOARDS,
  PSUS,
  RAMS,
  STORAGES,
} from "../data/components";
import type {
  Build,
  Case,
  Cooler,
  CPU,
  GPU,
  Motherboard,
  ProfileId,
  PSU,
  RAM,
  Resolution,
  Storage,
} from "../types";
import { checkCompatibility, requiredWattage } from "./compatibility";

export interface BuildRequest {
  budget: number;
  profile: ProfileId;
  resolution: Resolution;
}

export interface ScoredBuild {
  build: Build;
  total: number;
  score: number;
  /** FPS moyens estimés (jeu AAA, qualité ultra) par définition. */
  fps: Record<Resolution, number>;
  /** FPS à la définition demandée. */
  targetFps: number;
  leftover: number;
}

export interface OptimizeResult {
  best: ScoredBuild | null;
  /** Meilleures configurations alternatives basées sur d'autres GPU. */
  alternatives: ScoredBuild[];
}

interface ProfileRules {
  minRamGb: number;
  minStorageGb: number;
  maxCoolerNoise: 1 | 2 | 3;
  maxCaseNoise: 1 | 2 | 3;
  goldPsuOnly: boolean;
  allowStockCooler: boolean;
  /** Pondération du score multi-cœur (0..1), le reste va aux FPS. */
  multiWeight: number;
}

const PROFILE_RULES: Record<ProfileId, ProfileRules> = {
  gaming: { minRamGb: 16, minStorageGb: 1000, maxCoolerNoise: 3, maxCaseNoise: 3, goldPsuOnly: false, allowStockCooler: true, multiWeight: 0.05 },
  streaming: { minRamGb: 32, minStorageGb: 1000, maxCoolerNoise: 3, maxCaseNoise: 3, goldPsuOnly: false, allowStockCooler: true, multiWeight: 0.25 },
  creation: { minRamGb: 32, minStorageGb: 2000, maxCoolerNoise: 3, maxCaseNoise: 3, goldPsuOnly: false, allowStockCooler: true, multiWeight: 0.45 },
  silent: { minRamGb: 16, minStorageGb: 1000, maxCoolerNoise: 1, maxCaseNoise: 2, goldPsuOnly: true, allowStockCooler: false, multiWeight: 0.05 },
};

/** Le score multi (échelle R23/1000) est ramené sur une échelle comparable aux FPS. */
const MULTI_TO_FPS_SCALE = 5;

/**
 * Légère influence de la RAM sur les FPS : la DDR4 et les kits lents coûtent
 * quelques pourcents, un kit DDR5-6000 CL30 apporte un petit bonus.
 */
export function ramFactor(ram: RAM): number {
  if (ram.ramType === "DDR4") return ram.speedMhz >= 3600 ? 0.98 : 0.965;
  let factor = 1;
  if (ram.speedMhz >= 6000 && ram.cl <= 30) factor += 0.015;
  if (ram.speedMhz < 5600) factor -= 0.015;
  return factor;
}

/** FPS estimés : le plus lent du couple CPU/GPU impose sa limite. */
export function estimateFps(cpu: CPU, gpu: GPU, ram: RAM, res: Resolution): number {
  return Math.round(Math.min(cpu.fpsGaming * ramFactor(ram), gpu.fps[res]));
}

function scoreBuild(build: Build, req: BuildRequest): number {
  const rules = PROFILE_RULES[req.profile];
  const fps = estimateFps(build.cpu, build.gpu, build.ram, req.resolution);
  const multi = build.cpu.multiScore * MULTI_TO_FPS_SCALE;
  // 32 Go est le vrai confort gaming en 2026 : léger bonus pour que
  // l'optimiseur préfère 32 Go à un surplus de CPU sans gain de FPS.
  const ramBonus = build.ram.capacityGb >= 32 ? 4 : 0;
  return (1 - rules.multiWeight) * fps + rules.multiWeight * multi + ramBonus;
}

function allFps(build: Build): Record<Resolution, number> {
  return {
    "1080": estimateFps(build.cpu, build.gpu, build.ram, "1080"),
    "1440": estimateFps(build.cpu, build.gpu, build.ram, "1440"),
    "2160": estimateFps(build.cpu, build.gpu, build.ram, "2160"),
  };
}

function totalPrice(build: Build): number {
  return (
    build.cpu.price +
    build.motherboard.price +
    build.ram.price +
    build.gpu.price +
    build.storage.price +
    build.psu.price +
    build.case.price +
    build.cooler.price
  );
}

const byPrice = <T extends { price: number }>(items: T[]) =>
  [...items].sort((a, b) => a.price - b.price);

function pickCooler(cpu: CPU, rules: ProfileRules): Cooler | null {
  if (rules.allowStockCooler && cpu.includedCooler && cpu.tdp <= 65) {
    return COOLERS.find((c) => c.type === "stock") ?? null;
  }
  const candidates = byPrice(
    COOLERS.filter(
      (c) =>
        c.type !== "stock" &&
        c.noise <= rules.maxCoolerNoise &&
        c.sockets.includes(cpu.socket) &&
        c.tdpRating >= cpu.tdp * 1.2,
    ),
  );
  return candidates[0] ?? null;
}

function pickPsu(cpu: CPU, gpu: GPU, rules: ProfileRules): PSU | null {
  const required = requiredWattage({ cpu, gpu });
  let candidates = PSUS.filter(
    (p) => p.wattage >= required && (!rules.goldPsuOnly || p.efficiency !== "Bronze"),
  );
  if (gpu.connector === "12VHPWR") {
    const native = candidates.filter((p) => p.native12vhpwr);
    if (native.length > 0) candidates = native;
  }
  return byPrice(candidates)[0] ?? null;
}

function pickCase(mb: Motherboard, gpu: GPU, cooler: Cooler, rules: ProfileRules): Case | null {
  const radSize = cooler.type === "aio240" ? 240 : cooler.type === "aio360" ? 360 : 0;
  const candidates = CASES.filter(
    (c) =>
      c.noise <= rules.maxCaseNoise &&
      c.supports.includes(mb.formFactor) &&
      c.maxGpuLengthMm >= gpu.lengthMm &&
      (cooler.type !== "air" || c.maxCoolerHeightMm >= cooler.heightMm) &&
      (radSize === 0 || c.radiatorSupport >= radSize),
  );
  return byPrice(candidates)[0] ?? null;
}

function pickStorage(minGb: number): Storage | null {
  return byPrice(STORAGES.filter((s) => s.capacityGb >= minGb))[0] ?? null;
}

function makeScored(build: Build, req: BuildRequest): ScoredBuild {
  const total = totalPrice(build);
  return {
    build,
    total,
    score: scoreBuild(build, req),
    fps: allFps(build),
    targetFps: estimateFps(build.cpu, build.gpu, build.ram, req.resolution),
    leftover: Math.round(req.budget - total),
  };
}

/**
 * Dépense le budget restant sur des améliorations de confort qui n'ajoutent
 * pas de FPS : stockage plus grand/rapide, refroidissement plus discret,
 * kit RAM plus rapide. Chaque amélioration est revalidée (compatibilité + budget).
 */
function applyUpgrades(scored: ScoredBuild, req: BuildRequest): ScoredBuild {
  const rules = PROFILE_RULES[req.profile];
  let current = scored;

  const tryUpgrade = (patch: Partial<Build>): void => {
    const candidate: Build = { ...current.build, ...patch };
    const total = totalPrice(candidate);
    if (total > req.budget) return;
    if (!checkCompatibility(candidate).every((i) => i.severity !== "error")) return;
    const scored = makeScored(candidate, req);
    if (scored.score >= current.score) current = scored;
  };

  // 1. Stockage : monter en capacité puis en gamme.
  for (const storage of byPrice(STORAGES)) {
    if (
      storage.capacityGb > current.build.storage.capacityGb ||
      (storage.capacityGb === current.build.storage.capacityGb &&
        storage.readMbs > current.build.storage.readMbs)
    ) {
      tryUpgrade({ storage });
    }
  }

  // 2. RAM : monter en capacité, ou en vitesse à capacité égale.
  for (const ram of byPrice(RAMS)) {
    const better =
      ram.ramType === current.build.ram.ramType &&
      (ram.capacityGb > current.build.ram.capacityGb ||
        (ram.capacityGb === current.build.ram.capacityGb &&
          ramFactor(ram) > ramFactor(current.build.ram)));
    if (better) tryUpgrade({ ram });
  }

  // 3. Refroidissement : remplacer un ventirad d'origine ou bruyant.
  if (current.build.cooler.noise > 1 || current.build.cooler.type === "stock") {
    for (const cooler of byPrice(COOLERS.filter((c) => c.type !== "stock" && c.noise <= 2))) {
      if (cooler.tdpRating >= current.build.cpu.tdp * 1.2 && cooler.price > current.build.cooler.price) {
        tryUpgrade({ cooler });
        break;
      }
    }
  }

  // 4. Alimentation : passer en Gold modulaire si ce n'est pas déjà le cas.
  if (current.build.psu.efficiency === "Bronze" && !rules.goldPsuOnly) {
    const better = byPrice(
      PSUS.filter(
        (p) => p.efficiency !== "Bronze" && p.wattage >= current.build.psu.wattage,
      ),
    )[0];
    if (better) tryUpgrade({ psu: better });
  }

  return current;
}

/**
 * Recherche la configuration au meilleur rapport qualité/prix sous contrainte
 * de budget : énumère les plateformes compatibles (CPU × carte mère × RAM),
 * les associe à chaque GPU, complète avec les meilleurs composants de support
 * au prix le plus bas, puis garde la meilleure combinaison par GPU.
 */
export function optimize(req: BuildRequest): OptimizeResult {
  const rules = PROFILE_RULES[req.profile];
  const storage = pickStorage(rules.minStorageGb);
  if (!storage) return { best: null, alternatives: [] };

  const rams = RAMS.filter((r) => r.capacityGb >= rules.minRamGb);
  const bestPerGpu = new Map<string, ScoredBuild>();

  for (const cpu of CPUS) {
    const cooler = pickCooler(cpu, rules);
    if (!cooler) continue;

    for (const mb of MOTHERBOARDS) {
      if (mb.socket !== cpu.socket) continue;

      // Pour une carte mère donnée, seul le kit RAM compatible au meilleur
      // rapport (facteur perf / prix) par palier de capacité est retenu.
      const compatibleRams = rams.filter((r) => r.ramType === mb.ramType && r.sticks <= mb.ramSlots);
      const cheapestByCapacity = new Map<number, RAM>();
      for (const ram of compatibleRams) {
        const existing = cheapestByCapacity.get(ram.capacityGb);
        if (!existing || ram.price < existing.price) cheapestByCapacity.set(ram.capacityGb, ram);
      }

      for (const ram of cheapestByCapacity.values()) {
        for (const gpu of GPUS) {
          const psu = pickPsu(cpu, gpu, rules);
          if (!psu) continue;
          const pcCase = pickCase(mb, gpu, cooler, rules);
          if (!pcCase) continue;

          const build: Build = { cpu, motherboard: mb, ram, gpu, storage, psu, case: pcCase, cooler };
          const total = totalPrice(build);
          if (total > req.budget) continue;
          if (!checkCompatibility(build).every((i) => i.severity !== "error")) continue;

          const scored = makeScored(build, req);
          const previous = bestPerGpu.get(gpu.id);
          if (
            !previous ||
            scored.score > previous.score ||
            (scored.score === previous.score && scored.total < previous.total)
          ) {
            bestPerGpu.set(gpu.id, scored);
          }
        }
      }
    }
  }

  const ranked = [...bestPerGpu.values()].sort(
    (a, b) => b.score - a.score || a.total - b.total,
  );
  if (ranked.length === 0) return { best: null, alternatives: [] };

  const best = applyUpgrades(ranked[0], req);
  const alternatives = ranked
    .slice(1, 3)
    .map((s) => applyUpgrades(s, req));

  return { best, alternatives };
}
