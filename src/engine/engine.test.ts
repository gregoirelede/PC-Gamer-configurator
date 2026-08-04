import { describe, expect, it } from "vitest";
import { ALL_COMPONENTS, CASES, COOLERS, CPUS, GPUS, MOTHERBOARDS, PSUS, RAMS } from "../data/components";
import { checkCompatibility, requiredWattage } from "./compatibility";
import { demoPriceHistory, discountOf, findDeals } from "./deals";
import { optimize } from "./optimizer";
import type { ProfileId, Resolution } from "../types";

const byId = <T extends { id: string }>(items: T[], id: string): T => {
  const found = items.find((c) => c.id === id);
  if (!found) throw new Error(`Composant introuvable : ${id}`);
  return found;
};

describe("compatibilité", () => {
  it("détecte un socket CPU/carte mère incompatible", () => {
    const issues = checkCompatibility({
      cpu: byId(CPUS, "cpu-r7-7800x3d"), // AM5
      motherboard: byId(MOTHERBOARDS, "mb-b550-tomahawk"), // AM4
    });
    expect(issues.some((i) => i.severity === "error" && i.message.includes("Socket"))).toBe(true);
  });

  it("détecte une RAM DDR5 sur carte mère DDR4", () => {
    const issues = checkCompatibility({
      motherboard: byId(MOTHERBOARDS, "mb-b550-tomahawk"),
      ram: byId(RAMS, "ram-ddr5-32-6000-cl30"),
    });
    expect(issues.some((i) => i.severity === "error" && i.message.includes("Mémoire"))).toBe(true);
  });

  it("détecte un ventirad trop haut pour le boîtier", () => {
    const issues = checkCompatibility({
      cooler: byId(COOLERS, "cool-drp5"), // 168 mm
      case: byId(CASES, "case-forge100m"), // 160 mm max
    });
    expect(issues.some((i) => i.severity === "error" && i.message.includes("trop haut"))).toBe(true);
  });

  it("détecte une alimentation sous-dimensionnée", () => {
    const issues = checkCompatibility({
      cpu: byId(CPUS, "cpu-r9-9950x3d"),
      gpu: byId(GPUS, "gpu-rtx5090"),
      psu: byId(PSUS, "psu-a550bn"),
    });
    expect(issues.some((i) => i.severity === "error" && i.message.includes("sous-dimensionnée"))).toBe(true);
  });

  it("refuse le ventirad d'origine avec un CPU vendu sans", () => {
    const issues = checkCompatibility({
      cpu: byId(CPUS, "cpu-r5-7500f"),
      cooler: byId(COOLERS, "cool-stock"),
    });
    expect(issues.some((i) => i.severity === "error")).toBe(true);
  });

  it("calcule la puissance requise avec marge", () => {
    const required = requiredWattage({
      cpu: byId(CPUS, "cpu-r9-9950x3d"),
      gpu: byId(GPUS, "gpu-rtx5090"),
    });
    // (170 + 575 + 75) × 1,3 = 1066 → arrondi à 1100 W.
    expect(required).toBe(1100);
  });

  it("valide une configuration cohérente sans erreur", () => {
    const issues = checkCompatibility({
      cpu: byId(CPUS, "cpu-r7-7800x3d"),
      motherboard: byId(MOTHERBOARDS, "mb-b650-gaming-x"),
      ram: byId(RAMS, "ram-ddr5-32-6000-cl30"),
      gpu: byId(GPUS, "gpu-rx9070xt"),
      psu: byId(PSUS, "psu-a850gl"),
      case: byId(CASES, "case-lancool207"),
      cooler: byId(COOLERS, "cool-pa120se"),
    });
    expect(issues.filter((i) => i.severity === "error")).toEqual([]);
  });
});

describe("optimiseur", () => {
  const budgets = [600, 900, 1300, 2000, 3000];

  it("produit une configuration valide qui respecte chaque budget", () => {
    for (const budget of budgets) {
      const { best } = optimize({ budget, profile: "gaming", resolution: "1440" });
      expect(best, `budget ${budget} €`).not.toBeNull();
      expect(best!.total).toBeLessThanOrEqual(budget);
      const errors = checkCompatibility(best!.build).filter((i) => i.severity === "error");
      expect(errors, `budget ${budget} €`).toEqual([]);
    }
  });

  it("ne perd jamais en score quand le budget augmente", () => {
    let previous = -Infinity;
    for (const budget of budgets) {
      const { best } = optimize({ budget, profile: "gaming", resolution: "1440" });
      expect(best!.score).toBeGreaterThanOrEqual(previous);
      previous = best!.score;
    }
  });

  it("refuse un budget trop faible plutôt que de proposer une config bancale", () => {
    const { best } = optimize({ budget: 400, profile: "gaming", resolution: "1080" });
    expect(best).toBeNull();
  });

  it("oriente le choix du GPU vers la 4K quand c'est la cible", () => {
    const b4k = optimize({ budget: 2000, profile: "gaming", resolution: "2160" }).best!;
    const b1080 = optimize({ budget: 2000, profile: "gaming", resolution: "1080" }).best!;
    // Le build optimisé 4K doit faire au moins aussi bien en 4K (tolérance liée au score multi).
    expect(b4k.fps["2160"] + 10).toBeGreaterThanOrEqual(b1080.fps["2160"]);
    expect(b4k.build.gpu.vram).toBeGreaterThanOrEqual(12);
  });

  it("respecte les règles de profil (RAM, stockage, silence)", () => {
    const streaming = optimize({ budget: 1800, profile: "streaming", resolution: "1440" }).best!;
    expect(streaming.build.ram.capacityGb).toBeGreaterThanOrEqual(32);

    const creation = optimize({ budget: 2200, profile: "creation", resolution: "1440" }).best!;
    expect(creation.build.ram.capacityGb).toBeGreaterThanOrEqual(32);
    expect(creation.build.storage.capacityGb).toBeGreaterThanOrEqual(2000);

    const silent = optimize({ budget: 1800, profile: "silent", resolution: "1440" }).best!;
    expect(silent.build.cooler.noise).toBe(1);
    expect(silent.build.cooler.type).not.toBe("stock");
    expect(silent.build.psu.efficiency).not.toBe("Bronze");
    expect(silent.build.case.noise).toBeLessThanOrEqual(2);
  });

  it("privilégie le multi-cœur pour le streaming à budget égal", () => {
    const budget = 1600;
    const gaming = optimize({ budget, profile: "gaming", resolution: "1440" }).best!;
    const streaming = optimize({ budget, profile: "streaming", resolution: "1440" }).best!;
    expect(streaming.build.cpu.multiScore).toBeGreaterThanOrEqual(gaming.build.cpu.multiScore);
  });

  it("propose des alternatives basées sur d'autres GPU", () => {
    const { best, alternatives } = optimize({ budget: 1300, profile: "gaming", resolution: "1440" });
    expect(alternatives.length).toBeGreaterThan(0);
    for (const alt of alternatives) {
      expect(alt.build.gpu.id).not.toBe(best!.build.gpu.id);
      expect(alt.total).toBeLessThanOrEqual(1300);
    }
  });
});

describe("bons plans", () => {
  it("détecte les composants nettement sous leur moyenne 90 jours", () => {
    const deals = findDeals(ALL_COMPONENTS);
    expect(deals.length).toBeGreaterThan(5);
    expect(deals.some((d) => d.component.id === "cpu-r7-7800x3d")).toBe(true);
  });

  it("trie les bons plans par remise décroissante", () => {
    const deals = findDeals(ALL_COMPONENTS);
    for (let i = 1; i < deals.length; i++) {
      expect(deals[i - 1].discount).toBeGreaterThanOrEqual(deals[i].discount);
    }
  });

  it("ignore les baisses de prix insignifiantes", () => {
    const smallDrop = byId(CPUS, "cpu-r5-5500"); // -6 % environ
    expect(discountOf(smallDrop)).toBeLessThan(0.07);
    expect(findDeals(ALL_COMPONENTS).some((d) => d.component.id === smallDrop.id)).toBe(false);
  });

  it("génère un historique déterministe qui se termine sur le prix courant", () => {
    const cpu = byId(CPUS, "cpu-r7-7800x3d");
    const h1 = demoPriceHistory(cpu);
    const h2 = demoPriceHistory(cpu);
    expect(h1).toEqual(h2);
    expect(h1[h1.length - 1]).toBe(cpu.price);
    expect(h1).toHaveLength(13);
  });
});

describe("cohérence des données", () => {
  it("tous les ids sont uniques", () => {
    const ids = ALL_COMPONENTS.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("tous les prix sont positifs et les moyennes cohérentes", () => {
    for (const c of ALL_COMPONENTS) {
      expect(c.price, c.id).toBeGreaterThanOrEqual(0);
      expect(c.avgPrice90, c.id).toBeGreaterThanOrEqual(0);
    }
  });

  it("chaque profil trouve une configuration à 1500 €", () => {
    for (const profile of ["gaming", "streaming", "creation", "silent"] as ProfileId[]) {
      for (const resolution of ["1080", "1440"] as Resolution[]) {
        const { best } = optimize({ budget: 1500, profile, resolution });
        expect(best, `${profile}/${resolution}`).not.toBeNull();
      }
    }
  });
});
