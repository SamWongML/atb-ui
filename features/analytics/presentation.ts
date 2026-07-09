import type { Analytics } from "./schema";

// Pure presentation for the analytics surface — the run-average derivation and the chart
// palette. Money formatting (lib/format) and share math (lib/share) are framework-agnostic and
// shared with the BFF, so they live in lib/ rather than here. Colors are token CSS vars, never
// hardcoded hex — usable directly as an SVG fill/stroke so the charts re-theme with the app.

/** Mean spend per run over the window; 0 when there are no runs (never divides by zero). */
export function avgCostPerRun(analytics: Analytics): number {
  if (analytics.totalRuns === 0) return 0;
  return analytics.totalCost / analytics.totalRuns;
}

/** Ordered chart palette (token CSS vars). Series colors cycle through it by index. */
export const CHART_COLORS = [
  "var(--accent)",
  "var(--blue)",
  "var(--violet)",
  "var(--green)",
  "var(--amber)",
  "var(--purple)",
] as const;

export function colorAt(index: number): string {
  return CHART_COLORS[index % CHART_COLORS.length] as string;
}
