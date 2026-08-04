/**
 * Historique de prix : fonctions pures partagées entre le script de mise à
 * jour (scripts/update-prices.ts) et l'application.
 */

export interface HistoryPoint {
  /** Date ISO (AAAA-MM-JJ). */
  d: string;
  /** Prix en euros. */
  p: number;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function ageInDays(dateISO: string, todayISO: string): number {
  return Math.round((Date.parse(todayISO) - Date.parse(dateISO)) / DAY_MS);
}

/**
 * Ajoute le relevé du jour à un historique : remplace un éventuel relevé du
 * même jour, purge les points plus vieux que `maxDays`, garde l'ordre
 * chronologique.
 */
export function mergeHistory(
  existing: HistoryPoint[] | undefined,
  todayISO: string,
  price: number,
  maxDays = 120,
): HistoryPoint[] {
  const kept = (existing ?? []).filter((pt) => {
    const age = ageInDays(pt.d, todayISO);
    return pt.d !== todayISO && age >= 0 && age <= maxDays;
  });
  return [...kept, { d: todayISO, p: price }].sort((a, b) => a.d.localeCompare(b.d));
}

/**
 * Moyenne des prix sur les 90 derniers jours, arrondie à l'euro.
 * Retourne null tant que l'historique compte moins de 3 relevés dans la
 * fenêtre : la moyenne embarquée de référence reste alors utilisée.
 */
export function avg90(history: HistoryPoint[], todayISO: string): number | null {
  const window = history.filter((pt) => {
    const age = ageInDays(pt.d, todayISO);
    return age >= 0 && age <= 90;
  });
  if (window.length < 3) return null;
  return Math.round(window.reduce((sum, pt) => sum + pt.p, 0) / window.length);
}
