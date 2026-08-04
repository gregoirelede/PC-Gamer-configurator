import type { Build, CompatIssue } from "../types";

/** Marge de sécurité appliquée à la consommation estimée pour dimensionner l'alimentation. */
export const PSU_HEADROOM = 1.3;

/** Consommation estimée de la configuration en charge (W). */
export function estimatedDraw(build: Pick<Build, "cpu" | "gpu">): number {
  // 75 W de marge pour carte mère, RAM, stockage et ventilateurs.
  return build.cpu.tdp + build.gpu.tgp + 75;
}

/** Puissance d'alimentation requise, arrondie aux 50 W supérieurs. */
export function requiredWattage(build: Pick<Build, "cpu" | "gpu">): number {
  const withHeadroom = estimatedDraw(build) * PSU_HEADROOM;
  return Math.max(build.gpu.recPsu, Math.ceil(withHeadroom / 50) * 50);
}

/**
 * Vérifie la compatibilité d'une configuration complète ou partielle.
 * Seules les paires de composants présentes sont vérifiées, ce qui permet
 * une validation en direct dans le mode manuel.
 */
export function checkCompatibility(build: Partial<Build>): CompatIssue[] {
  const issues: CompatIssue[] = [];
  const { cpu, motherboard: mb, ram, gpu, psu, case: pcCase, cooler } = build;

  if (cpu && mb && cpu.socket !== mb.socket) {
    issues.push({
      severity: "error",
      message: `Socket incompatible : ${cpu.name} (${cpu.socket}) ne se monte pas sur ${mb.name} (${mb.socket}).`,
    });
  }

  if (ram && mb && ram.ramType !== mb.ramType) {
    issues.push({
      severity: "error",
      message: `Mémoire incompatible : ${ram.name} est en ${ram.ramType}, la carte mère accepte la ${mb.ramType}.`,
    });
  }

  if (ram && mb && ram.sticks > mb.ramSlots) {
    issues.push({
      severity: "error",
      message: `Pas assez de slots RAM : le kit compte ${ram.sticks} barrettes pour ${mb.ramSlots} slots.`,
    });
  }

  if (mb && pcCase && !pcCase.supports.includes(mb.formFactor)) {
    issues.push({
      severity: "error",
      message: `Format incompatible : le boîtier ${pcCase.name} n'accepte pas les cartes mères ${mb.formFactor}.`,
    });
  }

  if (gpu && pcCase && gpu.lengthMm > pcCase.maxGpuLengthMm) {
    issues.push({
      severity: "error",
      message: `Carte graphique trop longue : ${gpu.lengthMm} mm pour ${pcCase.maxGpuLengthMm} mm maximum dans le ${pcCase.name}.`,
    });
  }

  if (cooler && cpu) {
    if (!cooler.sockets.includes(cpu.socket)) {
      issues.push({
        severity: "error",
        message: `Le ${cooler.name} ne supporte pas le socket ${cpu.socket}.`,
      });
    }
    if (cooler.type === "stock" && !cpu.includedCooler) {
      issues.push({
        severity: "error",
        message: `${cpu.name} est vendu sans ventirad : il faut un refroidisseur dédié.`,
      });
    }
    if (cooler.tdpRating < cpu.tdp) {
      issues.push({
        severity: "error",
        message: `Refroidissement insuffisant : ${cooler.name} (${cooler.tdpRating} W) pour un CPU de ${cpu.tdp} W.`,
      });
    } else if (cooler.tdpRating < cpu.tdp * 1.5 && cooler.type !== "stock") {
      issues.push({
        severity: "warning",
        message: `Refroidissement juste : ${cooler.name} tiendra ${cpu.name} mais avec peu de marge acoustique.`,
      });
    }
  }

  if (cooler && pcCase) {
    if (cooler.type === "air" && cooler.heightMm > pcCase.maxCoolerHeightMm) {
      issues.push({
        severity: "error",
        message: `Ventirad trop haut : ${cooler.heightMm} mm pour ${pcCase.maxCoolerHeightMm} mm maximum dans le ${pcCase.name}.`,
      });
    }
    const radSize = cooler.type === "aio240" ? 240 : cooler.type === "aio360" ? 360 : 0;
    if (radSize > 0 && radSize > pcCase.radiatorSupport) {
      issues.push({
        severity: "error",
        message: `Le ${pcCase.name} ne peut pas accueillir un radiateur ${radSize} mm.`,
      });
    }
  }

  if (psu && cpu && gpu) {
    const required = requiredWattage({ cpu, gpu });
    if (psu.wattage < required) {
      issues.push({
        severity: "error",
        message: `Alimentation sous-dimensionnée : ${psu.wattage} W pour ${required} W recommandés (consommation estimée ${estimatedDraw({ cpu, gpu })} W + marge).`,
      });
    }
  }

  if (psu && gpu && gpu.connector === "12VHPWR" && !psu.native12vhpwr) {
    issues.push({
      severity: "warning",
      message: `${gpu.name} utilise un connecteur 12V-2x6 : ${psu.name} n'en a pas en natif (adaptateur fourni avec la carte, mais une alimentation ATX 3.x est préférable).`,
    });
  }

  return issues;
}

export function isCompatible(build: Partial<Build>): boolean {
  return checkCompatibility(build).every((i) => i.severity !== "error");
}
