import { describe, expect, it } from "vitest";
import { avg90, mergeHistory } from "./history";

describe("mergeHistory", () => {
  it("ajoute le relevé du jour à la fin, trié par date", () => {
    const merged = mergeHistory(
      [
        { d: "2026-08-01", p: 100 },
        { d: "2026-08-02", p: 98 },
      ],
      "2026-08-03",
      95,
    );
    expect(merged).toEqual([
      { d: "2026-08-01", p: 100 },
      { d: "2026-08-02", p: 98 },
      { d: "2026-08-03", p: 95 },
    ]);
  });

  it("remplace un relevé existant du même jour", () => {
    const merged = mergeHistory([{ d: "2026-08-03", p: 100 }], "2026-08-03", 95);
    expect(merged).toEqual([{ d: "2026-08-03", p: 95 }]);
  });

  it("purge les relevés plus vieux que la fenêtre", () => {
    const merged = mergeHistory(
      [
        { d: "2026-01-01", p: 120 }, // > 120 jours
        { d: "2026-07-01", p: 100 },
      ],
      "2026-08-03",
      95,
      120,
    );
    expect(merged.map((pt) => pt.d)).toEqual(["2026-07-01", "2026-08-03"]);
  });

  it("part d'un historique vide", () => {
    expect(mergeHistory(undefined, "2026-08-03", 95)).toEqual([{ d: "2026-08-03", p: 95 }]);
  });
});

describe("avg90", () => {
  it("retourne null avec moins de 3 relevés (la moyenne embarquée reste utilisée)", () => {
    expect(avg90([{ d: "2026-08-03", p: 95 }], "2026-08-03")).toBeNull();
    expect(
      avg90(
        [
          { d: "2026-08-02", p: 95 },
          { d: "2026-08-03", p: 95 },
        ],
        "2026-08-03",
      ),
    ).toBeNull();
  });

  it("calcule la moyenne arrondie sur la fenêtre de 90 jours", () => {
    const history = [
      { d: "2026-08-01", p: 100 },
      { d: "2026-08-02", p: 90 },
      { d: "2026-08-03", p: 95 },
    ];
    expect(avg90(history, "2026-08-03")).toBe(95);
  });

  it("exclut les relevés plus vieux que 90 jours", () => {
    const history = [
      { d: "2026-04-01", p: 500 }, // hors fenêtre
      { d: "2026-08-01", p: 100 },
      { d: "2026-08-02", p: 90 },
      { d: "2026-08-03", p: 95 },
    ];
    expect(avg90(history, "2026-08-03")).toBe(95);
  });
});
