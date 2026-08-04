import { useState } from "react";
import { ALL_COMPONENTS, PRICES_UPDATED_AT } from "./data/components";
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
        {tab === "auto" && <AutoBuilder />}
        {tab === "manual" && <ManualBuilder />}
        {tab === "deals" && <DealsView />}
        {tab === "compare" && <CompareView />}
      </main>

      <footer className="footer">
        {ALL_COMPONENTS.length} composants référencés · Prix indicatifs (référence {PRICES_UPDATED_AT}),
        relevés chez les grands marchands sécurisés — brancher une source réelle via{" "}
        <code>src/prices/provider.ts</code>.
        <br />
        Les FPS affichés sont des moyennes estimées en jeu AAA (qualité ultra) issues de benchmarks
        agrégés publics : ils varient selon les titres.
      </footer>
    </div>
  );
}
