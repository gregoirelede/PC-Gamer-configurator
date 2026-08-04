import { useMemo, useState } from "react";
import { estimateFps } from "../engine/optimizer";
import type { Category, Resolution } from "../types";
import { CATEGORY_LABELS, RESOLUTION_LABELS } from "../types";
import {
  BUILD_ORDER,
  deleteSavedBuild,
  fmtEUR,
  loadSavedBuilds,
  rebuild,
  type SavedBuild,
} from "./shared";

function partLabel(saved: SavedBuild, cat: Category): string {
  const build = rebuild(saved);
  if (!build) return "—";
  const part = build[cat];
  return `${part.brand !== "—" ? `${part.brand} ` : ""}${part.name}`;
}

export default function CompareView() {
  const [builds, setBuilds] = useState<SavedBuild[]>(loadSavedBuilds);
  const [idA, setIdA] = useState<string>("");
  const [idB, setIdB] = useState<string>("");

  const a = useMemo(() => builds.find((b) => b.id === idA) ?? null, [builds, idA]);
  const b = useMemo(() => builds.find((b2) => b2.id === idB) ?? null, [builds, idB]);
  const buildA = a ? rebuild(a) : null;
  const buildB = b ? rebuild(b) : null;

  const remove = (id: string) => {
    setBuilds(deleteSavedBuild(id));
    if (idA === id) setIdA("");
    if (idB === id) setIdB("");
  };

  if (builds.length === 0) {
    return (
      <div className="card">
        <h2>⚖️ Comparateur de configurations</h2>
        <p className="empty">
          Aucune configuration sauvegardée pour l'instant.<br />
          Générez une configuration (onglet Auto ou Manuel) puis cliquez sur « Sauvegarder ».
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="card">
        <h2>⚖️ Comparateur de configurations</h2>
        <p className="subtitle">Sélectionnez deux configurations sauvegardées pour les comparer poste par poste.</p>

        <div className="grid-2">
          <div>
            <label className="field" htmlFor="cmp-a">Configuration A</label>
            <select id="cmp-a" value={idA} onChange={(e) => setIdA(e.target.value)}>
              <option value="">— Choisir —</option>
              {builds.map((sb) => (
                <option key={sb.id} value={sb.id} disabled={sb.id === idB}>
                  {sb.name} ({fmtEUR(sb.total)})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field" htmlFor="cmp-b">Configuration B</label>
            <select id="cmp-b" value={idB} onChange={(e) => setIdB(e.target.value)}>
              <option value="">— Choisir —</option>
              {builds.map((sb) => (
                <option key={sb.id} value={sb.id} disabled={sb.id === idA}>
                  {sb.name} ({fmtEUR(sb.total)})
                </option>
              ))}
            </select>
          </div>
        </div>

        {a && b && (
          <div className="mt" style={{ overflowX: "auto" }}>
            <table className="compare">
              <thead>
                <tr>
                  <th>Poste</th>
                  <th>{a.name}</th>
                  <th>{b.name}</th>
                </tr>
              </thead>
              <tbody>
                {BUILD_ORDER.map((cat) => (
                  <tr key={cat}>
                    <th>{CATEGORY_LABELS[cat]}</th>
                    <td>{partLabel(a, cat)}</td>
                    <td>{partLabel(b, cat)}</td>
                  </tr>
                ))}
                {buildA && buildB &&
                  (Object.keys(RESOLUTION_LABELS) as Resolution[]).map((res) => (
                    <tr key={res}>
                      <th>FPS {RESOLUTION_LABELS[res]}</th>
                      <td className="num">{estimateFps(buildA.cpu, buildA.gpu, buildA.ram, res)}</td>
                      <td className="num">{estimateFps(buildB.cpu, buildB.gpu, buildB.ram, res)}</td>
                    </tr>
                  ))}
                <tr>
                  <th>Total</th>
                  <td className="num">{fmtEUR(a.total)}</td>
                  <td className="num">{fmtEUR(b.total)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Configurations sauvegardées</h2>
        {builds.map((sb) => (
          <div className="part-row" key={sb.id}>
            <span className="part-cat">{sb.createdAt}</span>
            <span className="part-name">{sb.name}</span>
            <span className="part-price">{fmtEUR(sb.total)}</span>
            <button className="btn btn-ghost" style={{ padding: "6px 12px" }} onClick={() => remove(sb.id)}>
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
