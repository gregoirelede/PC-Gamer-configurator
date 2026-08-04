import { useEffect, useState } from "react";
import { ALL_COMPONENTS, PRICES_UPDATED_AT } from "./data/components";
import { applyRemotePrices, loadRemotePrices, remotePricesInfo } from "./prices/remote";
import AutoBuilder from "./ui/AutoBuilder";
import CompareView from "./ui/CompareView";
import DealsView from "./ui/DealsView";
import ManualBuilder from "./ui/ManualBuilder";

type Tab = "auto" | "manual" | "deals" | "compare";

const TABS: Array<{ id: Tab; label: string }> = [
  { id: "auto", label: "⚡ Auto" },
  { id: "manual", label: "🔧 Manuel" },
  { id: "deals", label: "🔥 Bons plans" },
  { id: "compare", label: "⚖️ Comparer" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("auto");
  const [pricesReady, setPricesReady] = useState(false);

  // Les prix distants doivent être appliqués avant le premier rendu des vues
  // (l'optimiseur et les bons plans lisent les prix au moment de l'appel).
  useEffect(() => {
    loadRemotePrices()
      .then((data) => {
        if (data) applyRemotePrices(data);
      })
      .finally(() => setPricesReady(true));
  }, []);

  return (
    <div>
      <header className="header">
        <div className="logo">
          <div className="logo-mark">⚡</div>
          <div>
            <h1>ForgePC</h1>
            <p>Configurateur PC Gamer — qualité/prix optimisé</p>
          </div>
        </div>
        <nav className="tabs">
          {TABS.map(({ id, label }) => (
            <button
              key={id}
              className={`tab ${tab === id ? "active" : ""}`}
              onClick={() => setTab(id)}
            >
              {label}
            </button>
          ))}
        </nav>
      </header>

      <main>
        {pricesReady && (
          <>
            {tab === "auto" && <AutoBuilder />}
            {tab === "manual" && <ManualBuilder />}
            {tab === "deals" && <DealsView />}
            {tab === "compare" && <CompareView />}
          </>
        )}
      </main>

      <footer className="footer">
        {ALL_COMPONENTS.length} composants référencés · Prix indicatifs mis à jour le{" "}
        {remotePricesInfo()?.updatedAt ?? PRICES_UPDATED_AT} (regénérés chaque jour par GitHub
        Actions) — sources supplémentaires branchables via <code>scripts/providers.ts</code>.
        <br />
        Les FPS affichés sont des moyennes estimées en jeu AAA (qualité ultra) issues de benchmarks
        agrégés publics : ils varient selon les titres.
      </footer>
    </div>
  );
}
