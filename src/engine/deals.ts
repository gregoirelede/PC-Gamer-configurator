import type { AnyComponent } from "../types";

export interface Deal {
  component: AnyComponent;
  /** Remise par rapport à la moyenne 90 jours, ex. 0.13 = -13 %. */
  discount: number;
  savings: number;
}

/** Seuil à partir duquel une baisse de prix est considérée comme un bon plan. */
export const DEAL_THRESHOLD = 0.07;

export function discountOf(c: AnyComponent): number {
  if (c.avgPrice90 <= 0) return 0;
  return (c.avgPrice90 - c.price) / c.avgPrice90;
}

/** Retourne les bons plans triés par remise décroissante. */
export function findDeals(components: AnyComponent[], threshold = DEAL_THRESHOLD): Deal[] {
  return components
    .map((component) => ({
      component,
      discount: discountOf(component),
      savings: Math.round(component.avgPrice90 - component.price),
    }))
    .filter((d) => d.discount >= threshold)
    .sort((a, b) => b.discount - a.discount);
}

/**
 * Historique de prix de démonstration : une série hebdomadaire déterministe
 * (seed = id du composant) ancrée sur la moyenne 90 jours et qui se termine
 * sur le prix courant. Sera remplacée par de vraies séries une fois un
 * fournisseur de prix branché (voir src/prices/provider.ts).
 */
export function demoPriceHistory(c: AnyComponent, points = 13): number[] {
  let seed = 0;
  for (const ch of c.id) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const rand = () => {
    // PRNG xorshift déterministe pour un rendu stable entre sessions.
    seed ^= seed << 13;
    seed ^= seed >>> 17;
    seed ^= seed << 5;
    seed >>>= 0;
    return seed / 0xffffffff;
  };
  const history: number[] = [];
  for (let i = 0; i < points - 1; i++) {
    const wobble = (rand() - 0.45) * 0.08;
    history.push(Math.max(1, Math.round(c.avgPrice90 * (1 + wobble))));
  }
  history.push(c.price);
  return history;
}
