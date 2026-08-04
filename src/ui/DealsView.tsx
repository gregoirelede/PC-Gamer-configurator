import { useMemo } from "react";
import { ALL_COMPONENTS, PRICES_UPDATED_AT } from "../data/components";
import { demoPriceHistory, findDeals } from "../engine/deals";
import { CATEGORY_LABELS } from "../types";
import { fmtEUR, Sparkline } from "./shared";

export default function DealsView() {
  const deals = useMemo(() => findDeals(ALL_COMPONENTS), []);

  return (
    <div>
      <div className="card">
        <h2>🔥 Bons plans du moment</h2>
        <p className="subtitle">
          Composants dont le prix courant est nettement sous leur moyenne des 90 derniers jours
          (seuil : -7 %), triés par remise décroissante. Prix de référence au {PRICES_UPDATED_AT}.
        </p>

        {deals.length === 0 && <p className="empty">Aucun bon plan détecté pour le moment.</p>}

        {deals.map(({ component, discount, savings }) => (
          <div className="deal-row" key={component.id}>
            <span className="badge badge-deal">-{Math.round(discount * 100)} %</span>
            <div className="deal-info">
              <div className="name">
                {component.brand !== "—" ? `${component.brand} ` : ""}
                {component.name}
              </div>
              <div className="meta">
                {CATEGORY_LABELS[component.category]} · économie ≈ {fmtEUR(savings)} vs moyenne 90 j
              </div>
            </div>
            <Sparkline values={demoPriceHistory(component)} />
            <div className="deal-prices">
              <div className="now">{fmtEUR(component.price)}</div>
              <div className="before">{fmtEUR(component.avgPrice90)}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2>Comment sont suivis les prix ?</h2>
        <p className="muted">
          Les prix embarqués sont des références indicatives relevées chez les grands marchands
          sécurisés (mise à jour : {PRICES_UPDATED_AT}). L'application est conçue pour brancher de
          vraies sources : implémentez l'interface <code>PriceProvider</code> dans{" "}
          <code>src/prices/provider.ts</code> (API d'affiliation officielles, backend d'agrégation,
          ou fichier JSON regénéré périodiquement par une GitHub Action) et l'historique 90 jours,
          la détection de bons plans et les graphiques se mettront à jour automatiquement. Le
          scraping direct des sites marchands n'est volontairement pas inclus : peu fiable et
          contraire aux CGU de la plupart des enseignes.
        </p>
      </div>
    </div>
  );
}
