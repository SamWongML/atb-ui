import type { Analytics } from "@/features/analytics/schema";

// The BFF's analytics data source — an in-memory seed (verbatim from the design mockup): a
// rolled-up snapshot of spend over the last 7 days and the model mix behind it. The daily
// series and the model mix are two projections of the same $253.20 / 434-run window. When the
// metering pipeline comes online this becomes a downstream query and the router is unchanged.
export function analyticsSnapshot(): Analytics {
  return {
    totalCost: 253.2,
    totalRuns: 434,
    costSeries: [
      { label: "Mon", cost: 28.1 },
      { label: "Tue", cost: 41.5 },
      { label: "Wed", cost: 33.2 },
      { label: "Thu", cost: 52.8 },
      { label: "Fri", cost: 44.9 },
      { label: "Sat", cost: 21.4 },
      { label: "Sun", cost: 31.3 },
    ],
    modelMix: [
      { model: "claude-opus-4-8", runs: 128, cost: 182.4 },
      { model: "claude-sonnet-5", runs: 96, cost: 58.2 },
      { model: "claude-haiku-4-5", runs: 210, cost: 12.6 },
    ],
  };
}
