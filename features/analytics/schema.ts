import { z } from "zod";

// One Zod schema per shape, shared by the client and the BFF router (CONTEXT.md). The
// analytics surface is a single rolled-up snapshot: spend over time and the model mix behind
// it. Values are numeric (the charts need them raw); presentation.ts formats for display.

/** One day of spend for the cost-over-time chart. */
export const costPointSchema = z.object({
  /** Short axis label (e.g. "Mon"). */
  label: z.string(),
  cost: z.number().nonnegative(),
});
export type CostPoint = z.infer<typeof costPointSchema>;

/** One model's slice of usage for the model-mix chart. */
export const modelUsageSchema = z.object({
  model: z.string(),
  runs: z.number().int().nonnegative(),
  cost: z.number().nonnegative(),
});
export type ModelUsage = z.infer<typeof modelUsageSchema>;

export const analyticsSchema = z.object({
  /** Total spend over the window, in dollars. */
  totalCost: z.number().nonnegative(),
  totalRuns: z.number().int().nonnegative(),
  costSeries: z.array(costPointSchema),
  modelMix: z.array(modelUsageSchema),
});
export type Analytics = z.infer<typeof analyticsSchema>;
