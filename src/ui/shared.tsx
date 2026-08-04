import { ALL_COMPONENTS } from "../data/components";
import type { AnyComponent, Build, Category, CompatIssue } from "../types";
import { CATEGORY_LABELS } from "../types";

export const fmtEUR = (value: number): string =>
  value.toLocaleString("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

export const componentById = new Map<string, AnyComponent>(
  ALL_COMPONENTS.map((c) => [c.id, c]),
);

export const BUILD_ORDER: Category[] = [
  "cpu",
  "gpu",
  "motherboard",
  "ram",
  "storage",
  "psu",
  "case",
  "cooler",
];

export function PartsList({ build }: { build: Build }) {
  const parts: Array<[Category, AnyComponent]> = [
    ["cpu", build.cpu],
    ["gpu", build.gpu],
    ["motherboard", build.motherboard],
    ["ram", build.ram],
    ["storage", build.storage],
    ["psu", build.psu],
    ["case", build.case],
    ["cooler", build.cooler],
  ];
  return (
    <div>
      {parts.map(([cat, part]) => (
        <div className="part-row" key={cat}>
          <span className="part-cat">{CATEGORY_LABELS[cat]}</span>
          <span className="part-name">
            {part.brand !== "—" ? `${part.brand} ` : ""}
            {part.name}
          </span>
          <span className="part-price">{part.price === 0 ? "inclus" : fmtEUR(part.price)}</span>
        </div>
      ))}
    </div>
  );
}

export function IssueList({ issues }: { issues: CompatIssue[] }) {
  if (issues.length === 0) return null;
  return (
    <div className="mt">
      {issues.map((issue, i) => (
        <div key={i} className={`issue issue-${issue.severity}`}>
          <span>{issue.severity === "error" ? "⛔" : "⚠️"}</span>
          <span>{issue.message}</span>
        </div>
      ))}
    </div>
  );
}

export function Sparkline({ values, width = 110, height = 34 }: { values: number[]; width?: number; height?: number }) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const step = width / (values.length - 1);
  const points = values
    .map((v, i) => `${(i * step).toFixed(1)},${(height - 4 - ((v - min) / span) * (height - 8)).toFixed(1)}`)
    .join(" ");
  const falling = values[values.length - 1] <= values[0];
  return (
    <svg className="sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke={falling ? "#34d399" : "#f87171"}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ---------- Sauvegarde de configurations (localStorage) ---------- */

export interface SavedBuild {
  id: string;
  name: string;
  createdAt: string;
  total: number;
  partIds: Record<Category, string>;
}

const STORAGE_KEY = "forgepc.savedBuilds";

export function loadSavedBuilds(): SavedBuild[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as SavedBuild[];
  } catch {
    return [];
  }
}

export function saveBuild(name: string, build: Build, total: number): SavedBuild[] {
  const saved = loadSavedBuilds();
  const entry: SavedBuild = {
    id: `build-${Date.now()}`,
    name,
    createdAt: new Date().toISOString().slice(0, 10),
    total,
    partIds: {
      cpu: build.cpu.id,
      gpu: build.gpu.id,
      motherboard: build.motherboard.id,
      ram: build.ram.id,
      storage: build.storage.id,
      psu: build.psu.id,
      case: build.case.id,
      cooler: build.cooler.id,
    },
  };
  const next = [...saved, entry];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function deleteSavedBuild(id: string): SavedBuild[] {
  const next = loadSavedBuilds().filter((b) => b.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

/** Reconstruit une configuration complète depuis les ids sauvegardés. */
export function rebuild(saved: SavedBuild): Build | null {
  const get = (id: string) => componentById.get(id);
  const cpu = get(saved.partIds.cpu);
  const gpu = get(saved.partIds.gpu);
  const motherboard = get(saved.partIds.motherboard);
  const ram = get(saved.partIds.ram);
  const storage = get(saved.partIds.storage);
  const psu = get(saved.partIds.psu);
  const pcCase = get(saved.partIds.case);
  const cooler = get(saved.partIds.cooler);
  if (!cpu || !gpu || !motherboard || !ram || !storage || !psu || !pcCase || !cooler) return null;
  return {
    cpu,
    gpu,
    motherboard,
    ram,
    storage,
    psu,
    case: pcCase,
    cooler,
  } as Build;
}
