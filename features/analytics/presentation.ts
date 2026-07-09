import type { Analytics, ModelUsage } from "./schema";

// Pure presentation for the analytics surface — number formatting, the run-share derivation,
// and the chart palette. Kept pure and colocated so it's tested at its seam, not through the
// (Recharts) SVG. Colors are token CSS vars, never hardcoded hex — usable directly as an SVG
// fill/stroke so the charts re-theme with the rest of the app.

/** Format a dollar amount with two decimals and thousands separators (e.g. "$1,234.50"). */
export function formatUsd(amount: number): string {
  return `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/** Mean spend per run over the window; 0 when there are no runs (never divides by zero). */
export function avgCostPerRun(analytics: Analytics): number {
  if (analytics.totalRuns === 0) return 0;
  return analytics.totalCost / analytics.totalRuns;
}

export type ModelShare = ModelUsage & { share: number };

/** Attach each model's share of total runs, as a rounded percentage. */
export function withShare(modelMix: ModelUsage[]): ModelShare[] {
  const totalRuns = modelMix.reduce((sum, m) => sum + m.runs, 0);
  return modelMix.map((m) => ({
    ...m,
    share: totalRuns === 0 ? 0 : Math.round((m.runs / totalRuns) * 100),
  }));
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
