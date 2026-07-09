import { z } from "zod";

// One Zod schema per shape, shared by the client and the BFF router (CONTEXT.md). The
// overview home ties the other surfaces together, so its shapes are a self-contained
// projection — the BFF composes them from several stores; this slice imports no other
// feature (FOLDER_STRUCTURE.md: no feature-to-feature imports).

/** A headline stat tile — label + a pre-formatted value. */
export const overviewStatSchema = z.object({
  label: z.string(),
  value: z.string(),
});
export type OverviewStat = z.infer<typeof overviewStatSchema>;

/** Run lifecycle for the activity dot (running=blue · failed=red · passed=green). */
export const OVERVIEW_ACTIVITY_STATUSES = ["running", "failed", "passed"] as const;
export const overviewActivityStatusSchema = z.enum(OVERVIEW_ACTIVITY_STATUSES);
export type OverviewActivityStatus = z.infer<typeof overviewActivityStatusSchema>;

/** One entry in the activity feed — a recent run, distilled to a link. */
export const overviewActivitySchema = z.object({
  id: z.string(),
  title: z.string(),
  status: overviewActivityStatusSchema,
  /** Secondary line, pre-formatted (e.g. "claude-opus-4-8 · 12m ago"). */
  meta: z.string(),
  href: z.string(),
});
export type OverviewActivity = z.infer<typeof overviewActivitySchema>;

/** A recent failure surfaced with its root cause. */
export const overviewFailureSchema = z.object({
  id: z.string(),
  title: z.string(),
  rootCause: z.string(),
  href: z.string(),
});
export type OverviewFailure = z.infer<typeof overviewFailureSchema>;

/** A model-mix slice — model name + its rounded share of runs. */
export const overviewModelSliceSchema = z.object({
  model: z.string(),
  share: z.number().int().nonnegative(),
});
export type OverviewModelSlice = z.infer<typeof overviewModelSliceSchema>;

export const overviewSummarySchema = z.object({
  stats: z.array(overviewStatSchema),
  activity: z.array(overviewActivitySchema),
  failures: z.array(overviewFailureSchema),
  modelMix: z.array(overviewModelSliceSchema),
});
export type OverviewSummary = z.infer<typeof overviewSummarySchema>;
