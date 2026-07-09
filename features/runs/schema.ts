import { z } from "zod";

// One Zod schema per shape, shared by the client and the BFF router (CONTEXT.md).
// A Run is an execution record; failures carry a root cause (CONTEXT.md §Domain).

/** Execution lifecycle: running (blue, pulses) · failed (red) · passed (green). */
export const RUN_STATUSES = ["running", "failed", "passed"] as const;
export const runStatusSchema = z.enum(RUN_STATUSES);
export type RunStatus = z.infer<typeof runStatusSchema>;

/** Step progress for the run — shared by the row and the detail timeline. */
export const runStepsSchema = z.object({
  completed: z.number().int().nonnegative(),
  total: z.number().int().positive(),
});
export type RunSteps = z.infer<typeof runStepsSchema>;

export const runSchema = z.object({
  id: z.string(),
  /** What produced the run — a workflow, squad, or agent name. */
  source: z.string(),
  status: runStatusSchema,
  /** The model that executed it (feeds the analytics model mix). */
  model: z.string(),
  /** When it started, pre-formatted for display (e.g. "12m ago"). */
  startedAt: z.string(),
  /** Wall-clock duration, pre-formatted (e.g. "3m 12s"); "—" while running. */
  duration: z.string(),
  /** Spend, pre-formatted (e.g. "$0.61"). */
  cost: z.string(),
  steps: runStepsSchema,
  /** The failure's root cause — set only on a failed run, null otherwise. */
  rootCause: z.string().nullable(),
});
export type Run = z.infer<typeof runSchema>;

export const runListSchema = z.array(runSchema);
