import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { ALL_COMPONENTS } from "../src/data/components";
import { avg90, mergeHistory, type HistoryPoint } from "../src/prices/history";
import type { PriceQuote } from "../src/prices/provider";
import { customProviders } from "./providers";

/**
 * Regénère public/prices.json : prix courants (référence embarquée, écrasée
 * par les fournisseurs personnalisés), historique de relevés quotidiens et
 * moyennes 90 jours recalculées dès que l'historique le permet.
 *
 * Exécution : `npm run update-prices` (localement ou via la GitHub Action
 * planifiée .github/workflows/update-prices.yml).
 */

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const outFile = resolve(root, "public", "prices.json");

interface PricesFile {
  updatedAt: string;
  sources: string[];
  quotes: Array<{ id: string; price: number; vendor: string }>;
  history: Record<string, HistoryPoint[]>;
  avg90: Record<string, number>;
}

async function main(): Promise<void> {
  const today = new Date().toISOString().slice(0, 10);
  const previous: Partial<PricesFile> = existsSync(outFile)
    ? (JSON.parse(readFileSync(outFile, "utf8")) as Partial<PricesFile>)
    : {};

  const prices = new Map(
    ALL_COMPONENTS.map((c) => [c.id, { id: c.id, price: c.price, vendor: "référence" }]),
  );
  const sources = ["référence"];
  const ids = ALL_COMPONENTS.map((c) => c.id);

  for (const provider of customProviders) {
    let quotes: PriceQuote[] = [];
    try {
      quotes = await provider.fetchPrices(ids);
    } catch (err) {
      console.error(`Fournisseur « ${provider.name} » en échec, source ignorée :`, err);
      continue;
    }
    let applied = 0;
    for (const quote of quotes) {
      const current = prices.get(quote.componentId);
      if (current && quote.price > 0) {
        current.price = quote.price;
        current.vendor = quote.vendor;
        applied++;
      }
    }
    if (applied > 0) sources.push(provider.name);
    console.log(`Fournisseur « ${provider.name} » : ${applied} prix appliqués.`);
  }

  const history: Record<string, HistoryPoint[]> = {};
  const averages: Record<string, number> = {};
  for (const { id, price } of prices.values()) {
    history[id] = mergeHistory(previous.history?.[id], today, price);
    const avg = avg90(history[id], today);
    if (avg !== null) averages[id] = avg;
  }

  const file: PricesFile = {
    updatedAt: today,
    sources,
    quotes: [...prices.values()],
    history,
    avg90: averages,
  };
  mkdirSync(dirname(outFile), { recursive: true });
  writeFileSync(outFile, `${JSON.stringify(file, null, 1)}\n`);
  console.log(`✔ ${outFile} regénéré : ${prices.size} composants, sources : ${sources.join(", ")}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
