import { describe, expect, it } from "vitest";
import { avgCostPerRun, colorAt, formatUsd, withShare } from "./presentation";
import type { Analytics, ModelUsage } from "./schema";

// Seam: pure analytics presentation (features/analytics/presentation.ts) — formatting and the
// run-share derivation, independent of the charts. Expected values come from worked examples.

describe("formatUsd", () => {
  it("formats with two decimals and thousands separators", () => {
    expect(formatUsd(253.2)).toBe("$253.20");
    expect(formatUsd(2.5)).toBe("$2.50");
    expect(formatUsd(1234.5)).toBe("$1,234.50");
    expect(formatUsd(0)).toBe("$0.00");
  });
});

describe("avgCostPerRun", () => {
  const base: Analytics = { totalCost: 0, totalRuns: 0, costSeries: [], modelMix: [] };

  it("divides total cost by total runs", () => {
    expect(avgCostPerRun({ ...base, totalCost: 250, totalRuns: 100 })).toBe(2.5);
  });

  it("is zero when there are no runs (never divides by zero)", () => {
    expect(avgCostPerRun({ ...base, totalCost: 250, totalRuns: 0 })).toBe(0);
  });
});

describe("withShare", () => {
  it("attaches each model's rounded percentage of total runs", () => {
    const mix: ModelUsage[] = [
      { model: "a", runs: 30, cost: 0 },
      { model: "b", runs: 10, cost: 0 },
      { model: "c", runs: 10, cost: 0 },
    ];
    expect(withShare(mix).map((m) => m.share)).toEqual([60, 20, 20]);
  });

  it("reports zero share for an empty mix rather than NaN", () => {
    expect(withShare([{ model: "a", runs: 0, cost: 0 }]).map((m) => m.share)).toEqual([0]);
  });
});

describe("colorAt", () => {
  it("returns palette colors and cycles past the end", () => {
    expect(colorAt(0)).toBe("var(--accent)");
    expect(colorAt(1)).toBe("var(--blue)");
    expect(colorAt(6)).toBe("var(--accent)");
  });
});
