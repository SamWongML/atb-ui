import { describe, expect, it } from "vitest";
import { avgCostPerRun, colorAt } from "./presentation";
import type { Analytics } from "./schema";

// Seam: analytics-specific presentation (features/analytics/presentation.ts) — the run-average
// derivation and the chart palette. (Money formatting and share math live in lib/ and are
// tested there.) Expected values come from worked examples.

describe("avgCostPerRun", () => {
  const base: Analytics = { totalCost: 0, totalRuns: 0, costSeries: [], modelMix: [] };

  it("divides total cost by total runs", () => {
    expect(avgCostPerRun({ ...base, totalCost: 250, totalRuns: 100 })).toBe(2.5);
  });

  it("is zero when there are no runs (never divides by zero)", () => {
    expect(avgCostPerRun({ ...base, totalCost: 250, totalRuns: 0 })).toBe(0);
  });
});

describe("colorAt", () => {
  it("returns palette colors and cycles past the end", () => {
    expect(colorAt(0)).toBe("var(--accent)");
    expect(colorAt(1)).toBe("var(--blue)");
    expect(colorAt(6)).toBe("var(--accent)");
  });
});
