import { ALL_COMPONENTS, PRICES_UPDATED_AT } from "../data/components";
import type { AnyComponent } from "../types";

/**
 * Couche d'abstraction des sources de prix.
 *
 * L'application fonctionne avec des prix de référence embarqués, mais tout
 * est prévu pour brancher des sources réelles : il suffit d'implémenter
 * `PriceProvider` et d'appliquer les cotations via `applyQuotes`.
 *
 * Exemples de sources branchables (côté serveur ou script planifié) :
 *  - flux d'affiliation officiels des marchands (Amazon PA-API, Awin, etc.) ;
 *  - votre propre backend qui agrège les prix ;
 *  - un fichier JSON regénéré périodiquement par une GitHub Action.
 *
 * Le scraping direct des sites marchands n'est volontairement pas implémenté :
 * il est peu fiable (protections anti-bot) et contraire aux CGU de la plupart
 * des enseignes. Préférez les API officielles.
 */

export interface PriceQuote {
  componentId: string;
  price: number;
  vendor: string;
  url?: string;
  fetchedAt: string;
}

export interface PriceProvider {
  name: string;
  fetchPrices(componentIds: string[]): Promise<PriceQuote[]>;
}

/** Fournisseur par défaut : renvoie les prix de référence embarqués. */
export const staticReferenceProvider: PriceProvider = {
  name: `Prix de référence (${PRICES_UPDATED_AT})`,
  async fetchPrices(componentIds) {
    return ALL_COMPONENTS.filter((c) => componentIds.includes(c.id)).map((c) => ({
      componentId: c.id,
      price: c.price,
      vendor: "référence",
      fetchedAt: PRICES_UPDATED_AT,
    }));
  },
};

/**
 * Applique des cotations fraîches sur une liste de composants et retourne
 * une nouvelle liste (les composants sans cotation sont inchangés).
 */
export function applyQuotes<T extends AnyComponent>(components: T[], quotes: PriceQuote[]): T[] {
  const byId = new Map(quotes.map((q) => [q.componentId, q]));
  return components.map((c) => {
    const quote = byId.get(c.id);
    return quote ? { ...c, price: quote.price } : c;
  });
}
