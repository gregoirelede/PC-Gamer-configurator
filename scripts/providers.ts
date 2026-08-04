import type { PriceProvider } from "../src/prices/provider";

/**
 * Fournisseurs de prix personnalisés, exécutés dans l'ordre par
 * scripts/update-prices.ts : chaque cotation retournée écrase le prix de
 * référence embarqué (et celle du fournisseur précédent). Un fournisseur qui
 * échoue est ignoré, la mise à jour continue avec les autres sources.
 *
 * Les clés d'API se passent par variables d'environnement, déclarées comme
 * secrets dans GitHub Actions (voir .github/workflows/update-prices.yml).
 *
 * Exemple de squelette à adapter (API d'affiliation officielle) :
 *
 *   const awin: PriceProvider = {
 *     name: "awin",
 *     async fetchPrices(componentIds) {
 *       const apiKey = process.env.AWIN_API_KEY;
 *       if (!apiKey) return []; // secret absent → source ignorée
 *       // 1. Appeler l'API produit du réseau d'affiliation.
 *       // 2. Mapper chaque produit vers un componentId de src/data/components.ts
 *       //    (par exemple via une table EAN/référence → id maintenue ici).
 *       // 3. Retourner les PriceQuote correspondants.
 *       return [];
 *     },
 *   };
 *
 * Puis l'ajouter au tableau : export const customProviders = [awin];
 */
export const customProviders: PriceProvider[] = [];
