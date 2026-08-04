import { useMemo, useState } from "react";
import {
  CASES,
  COOLERS,
  CPUS,
  GPUS,
  MOTHERBOARDS,
  PSUS,
  RAMS,
  STORAGES,
} from "../data/components";
import { checkCompatibility } from "../engine/compatibility";
import { ramFactor } from "../engine/optimizer";
import type { AnyComponent, Build, Category, Resolution } from "../types";
import { CATEGORY_LABELS, RESOLUTION_LABELS } from "../types";
import { BUILD_ORDER, componentById, fmtEUR, IssueList, saveBuild } from "./shared";

const CATALOG: Record<Category, AnyComponent[]> = {
  cpu: CPUS,
  gpu: GPUS,
  motherboard: MOTHERBOARDS,
  ram: RAMS,
  storage: STORAGES,
  psu: PSUS,
  case: CASES,
  cooler: COOLERS,
};

type Selection = Partial<Record<Category, string>>;

function toPartialBuild(selection: Selection): Partial<Build> {
  const partial: Record<string, AnyComponent> = {};
  for (const [cat, id] of Object.entries(selection)) {
    if (!id) continue;
    const component = componentById.get(id);
    if (component) partial[cat] = component;
  }
  return partial as Partial<Build>;
}

function errorCount(selection: Selection): number {
  return checkCompatibility(toPartialBuild(selection)).filter((i) => i.severity === "error").length;
}

export default function ManualBuilder() {
  const [selection, setSelection] = useState<Selection>({});
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const partial = useMemo(() => toPartialBuild(selection), [selection]);
  const issues = useMemo(() => checkCompatibility(partial), [partial]);
  const total = useMemo(
    () => Object.values(partial).reduce((sum, c) => sum + (c?.price ?? 0), 0),
    [partial],
  );
  const complete = BUILD_ORDER.every((cat) => selection[cat]);
  const hasErrors = issues.some((i) => i.severity === "error");

  const fpsEstimates = useMemo(() => {
    const { cpu, gpu, ram } = partial;
    if (!cpu || !gpu) return null;
    const factor = ram ? ramFactor(ram) : 1;
    const est = (res: Resolution) => Math.round(Math.min(cpu.fpsGaming * factor, gpu.fps[res]));
    return { "1080": est("1080"), "1440": est("1440"), "2160": est("2160") } as Record<Resolution, number>;
  }, [partial]);

  const setPart = (cat: Category, id: string) => {
    setSavedMsg(null);
    setSelection((prev) => ({ ...prev, [cat]: id || undefined }));
  };

  const handleSave = () => {
    if (!complete || hasErrors) return;
    const name = window.prompt("Nom de la configuration :", `Config manuelle — ${fmtEUR(total)}`);
    if (!name) return;
    saveBuild(name, partial as Build, total);
    setSavedMsg(`Configuration « ${name} » sauvegardée — retrouvez-la dans l'onglet Comparer.`);
  };

  return (
    <div>
      <div className="card">
        <h2>Assemblage manuel</h2>
        <p className="subtitle">
          Choisissez chaque composant : les options incompatibles avec votre sélection actuelle
          sont marquées ⛔ et désactivées, la compatibilité est vérifiée en direct.
        </p>

        <div className="grid-2">
          {BUILD_ORDER.map((cat) => {
            const baseErrors = errorCount({ ...selection, [cat]: undefined });
            return (
              <div key={cat}>
                <label className="field" htmlFor={`sel-${cat}`}>{CATEGORY_LABELS[cat]}</label>
                <select
                  id={`sel-${cat}`}
                  value={selection[cat] ?? ""}
                  onChange={(e) => setPart(cat, e.target.value)}
                >
                  <option value="">— Choisir —</option>
                  {CATALOG[cat].map((component) => {
                    const incompatible =
                      errorCount({ ...selection, [cat]: component.id }) > baseErrors;
                    return (
                      <option key={component.id} value={component.id} disabled={incompatible}>
                        {incompatible ? "⛔ " : ""}
                        {component.brand !== "—" ? `${component.brand} ` : ""}
                        {component.name} — {component.price === 0 ? "inclus" : fmtEUR(component.price)}
                      </option>
                    );
                  })}
                </select>
              </div>
            );
          })}
        </div>

        <div className="total-row">
          <span>Total ({Object.keys(partial).length}/8 composants)</span>
          <span>{fmtEUR(total)}</span>
        </div>

        {fpsEstimates && (
          <div className="grid-3 mt">
            {(Object.entries(fpsEstimates) as Array<[Resolution, number]>).map(([res, fps]) => (
              <div className="stat" key={res}>
                <div className="value">{fps}</div>
                <div className="label">FPS moyens {RESOLUTION_LABELS[res]}</div>
              </div>
            ))}
          </div>
        )}

        <IssueList issues={issues} />

        <div className="row-actions">
          {complete && !hasErrors && <span className="badge badge-ok">✓ Configuration complète et compatible</span>}
          <button className="btn btn-primary" disabled={!complete || hasErrors} onClick={handleSave}>
            💾 Sauvegarder la configuration
          </button>
          <button className="btn btn-ghost" onClick={() => setSelection({})}>
            Réinitialiser
          </button>
          {savedMsg && <span className="badge badge-ok">{savedMsg}</span>}
        </div>
      </div>
    </div>
  );
}
