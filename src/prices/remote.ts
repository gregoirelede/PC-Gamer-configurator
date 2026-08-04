/// <reference types="vite/client" />
import { ALL_COMPONENTS } from "../data/components";
import type { AnyComponent } from "../types";
import type { HistoryPoint } from "./history";

/**
 * Chargement des prix distants (public/prices.json), regénérés chaque jour
 * par la GitHub Action « Mise à jour des prix » (scripts/update-prices.ts).
 */

export interface RemotePrices {
  updatedAt: string;
  sources: string[];
  quotes: Array<{ id: string; price: number; vendor: string }>;
  history: Record<string, HistoryPoint[]>;
  avg90: Record<string, number>;
}

let info: { updatedAt: string; sources: string[] } | null = null;
const historyById = new Map<string, HistoryPoint[]>();

/** Métadonnées des prix distants appliqués, ou null si l'app tourne sur les prix embarqués. */
export function remotePricesInfo(): { updatedAt: string; sources: string[] } | null {
  return info;
}

export async function loadRemotePrices(): Promise<RemotePrices | null> {
  try {
    const res = await fetch(`${import.meta.env.BASE_URL}prices.json`, { cache: "no-cache" });
    if (!res.ok) return null;
    return (await res.json()) as RemotePrices;
  } catch {
    return null;
  }
}

/**
 * Applique les prix distants sur la base embarquée. La mutation des
 * singletons est volontaire : l'optimiseur, les bons plans et les vues
 * lisent les prix au moment de l'appel — à exécuter avant le premier rendu.
 */
export function applyRemotePrices(data: RemotePrices): void {
  const byId = new Map(ALL_COMPONENTS.map((c) => [c.id, c]));
  for (const quote of data.quotes ?? []) {
    const component = byId.get(quote.id);
    if (component && quote.price > 0) component.price = quote.price;
  }
  for (const [id, avg] of Object.entries(data.avg90 ?? {})) {
    const component = byId.get(id);
    if (component && avg > 0) component.avgPrice90 = avg;
  }
  for (const [id, points] of Object.entries(data.history ?? {})) {
    historyById.set(id, points);
  }
  info = { updatedAt: data.updatedAt, sources: data.sources ?? [] };
}

/**
 * Historique de prix réel d'un composant s'il compte assez de relevés pour
 * un graphique, sinon null (l'appelant retombe sur la série de démonstration).
 */
export function priceHistoryOf(component: AnyComponent): number[] | null {
  const points = historyById.get(component.id);
  if (!points || points.length < 4) return null;
  return points.map((pt) => pt.p);
}
