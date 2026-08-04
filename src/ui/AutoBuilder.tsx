import { useMemo, useState } from "react";
import { checkCompatibility } from "../engine/compatibility";
import { optimize, type ScoredBuild } from "../engine/optimizer";
import type { ProfileId, Resolution } from "../types";
import { PROFILE_LABELS, RESOLUTION_LABELS } from "../types";
import { fmtEUR, IssueList, PartsList, saveBuild } from "./shared";

const BUDGET_PRESETS = [600, 800, 1000, 1300, 1600, 2000, 2800];

function BuildResult({ scored, title, onSave }: { scored: ScoredBuild; title: string; onSave: (s: ScoredBuild) => void }) {
  const issues = useMemo(() => checkCompatibility(scored.build), [scored]);
  return (
    <div className="card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h2>{title}</h2>
        {issues.some((i) => i.severity === "error") ? (
          <span className="badge badge-err">Incompatibilité détectée</span>
        ) : (
          <span className="badge badge-ok">✓ Compatibilité vérifiée</span>
        )}
      </div>
      <p className="subtitle">
        Score qualité/prix optimisé — {fmtEUR(scored.total)} dépensés
        {scored.leftover > 0 && `, ${fmtEUR(scored.leftover)} de marge restante`}
      </p>

      <div className="grid-3">
        {(Object.entries(scored.fps) as Array<[Resolution, number]>).map(([res, fps]) => (
          <div className="stat" key={res}>
            <div className="value">{fps}</div>
            <div className="label">FPS moyens {RESOLUTION_LABELS[res]}</div>
          </div>
        ))}
      </div>

      <div className="mt">
        <PartsList build={scored.build} />
        <div className="total-row">
          <span>Total</span>
          <span>{fmtEUR(scored.total)}</span>
        </div>
      </div>

      <IssueList issues={issues} />

      <div className="row-actions">
        <button className="btn btn-ghost" onClick={() => onSave(scored)}>
          💾 Sauvegarder cette configuration
        </button>
      </div>
    </div>
  );
}

export default function AutoBuilder() {
  const [budget, setBudget] = useState(1300);
  const [profile, setProfile] = useState<ProfileId>("gaming");
  const [resolution, setResolution] = useState<Resolution>("1440");
  const [result, setResult] = useState<ReturnType<typeof optimize> | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const run = () => {
    setSavedMsg(null);
    setResult(optimize({ budget, profile, resolution }));
  };

  const handleSave = (scored: ScoredBuild) => {
    const name = window.prompt(
      "Nom de la configuration :",
      `${PROFILE_LABELS[profile]} ${RESOLUTION_LABELS[resolution]} — ${fmtEUR(budget)}`,
    );
    if (!name) return;
    saveBuild(name, scored.build, scored.total);
    setSavedMsg(`Configuration « ${name} » sauvegardée — retrouvez-la dans l'onglet Comparer.`);
  };

  return (
    <div>
      <div className="card">
        <h2>Configuration automatique</h2>
        <p className="subtitle">
          Donnez un budget : l'optimiseur explore toutes les combinaisons compatibles et retient
          celle qui maximise les performances réelles (le goulot d'étranglement CPU/GPU est modélisé).
        </p>

        <div className="grid-3">
          <div>
            <label className="field" htmlFor="budget">Budget : {fmtEUR(budget)}</label>
            <input
              id="budget"
              type="range"
              min={500}
              max={4000}
              step={50}
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value))}
            />
            <div className="chips">
              {BUDGET_PRESETS.map((b) => (
                <button key={b} className={`chip ${b === budget ? "active" : ""}`} onClick={() => setBudget(b)}>
                  {fmtEUR(b)}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="field" htmlFor="profile">Profil d'usage</label>
            <select id="profile" value={profile} onChange={(e) => setProfile(e.target.value as ProfileId)}>
              {(Object.entries(PROFILE_LABELS) as Array<[ProfileId, string]>).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="field" htmlFor="resolution">Définition cible</label>
            <select id="resolution" value={resolution} onChange={(e) => setResolution(e.target.value as Resolution)}>
              {(Object.entries(RESOLUTION_LABELS) as Array<[Resolution, string]>).map(([id, label]) => (
                <option key={id} value={id}>{label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="row-actions">
          <button className="btn btn-primary" onClick={run}>
            ⚡ Générer la meilleure configuration
          </button>
          {savedMsg && <span className="badge badge-ok">{savedMsg}</span>}
        </div>
      </div>

      {result && !result.best && (
        <div className="card">
          <p className="empty">
            Aucune configuration complète ne rentre dans {fmtEUR(budget)}.<br />
            Le minimum viable se situe autour de 550 € — augmentez le budget.
          </p>
        </div>
      )}

      {result?.best && (
        <>
          <BuildResult scored={result.best} title="Meilleure configuration" onSave={handleSave} />
          {result.alternatives.length > 0 && (
            <details className="alt">
              <summary>
                Voir {result.alternatives.length} alternative{result.alternatives.length > 1 ? "s" : ""} (autres cartes graphiques)
              </summary>
              {result.alternatives.map((alt) => (
                <BuildResult
                  key={alt.build.gpu.id}
                  scored={alt}
                  title={`Alternative — ${alt.build.gpu.brand} ${alt.build.gpu.name}`}
                  onSave={handleSave}
                />
              ))}
            </details>
          )}
        </>
      )}
    </div>
  );
}
