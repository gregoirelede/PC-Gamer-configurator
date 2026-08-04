import { useMemo } from "react";
import { ALL_COMPONENTS, PRICES_UPDATED_AT } from "../data/components";
import { demoPriceHistory, findDeals } from "../engine/deals";
import { priceHistoryOf, remotePricesInfo } from "../prices/remote";
import { CATEGORY_LABELS } from "../types";
import { fmtEUR, Sparkline } from "./shared";

export default function DealsView() {
  const deals = useMemo(() => findDeals(ALL_COMPONENTS), []);
  const remote = remotePricesInfo();
  const updatedAt = remote?.updatedAt ?? PRICES_UPDATED_AT;

  return (
    <div>
      <div className="card">
        <h2>🔥 Bons plans du moment</h2>
        <p className="subtitle">
          Composants dont le prix courant est nettement sous leur moyenne des 90 derniers jours
          (seuil : -7 %), triés par remise décroissante. Prix au {updatedAt}
          {remote && ` · sources : ${remote.sources.join(", ")}`}.
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
            <Sparkline values={priceHistoryOf(component) ?? demoPriceHistory(component)} />
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
          Une GitHub Action regénère chaque jour <code>public/prices.json</code> : l'application
          le charge au démarrage, accumule un historique de relevés quotidiens et recalcule les
          moyennes 90 jours dès que l'historique le permet (les graphiques passent alors des
          séries de démonstration aux relevés réels). Pour brancher des prix marchands réels,
          implémentez l'interface <code>PriceProvider</code> dans <code>scripts/providers.ts</code>{" "}
          avec une API officielle (affiliation, agrégateur) et vos clés en secrets GitHub. Le
          scraping direct des sites marchands n'est volontairement pas inclus : peu fiable et
          contraire aux CGU de la plupart des enseignes.
        </p>
      </div>
    </div>
  );
}
