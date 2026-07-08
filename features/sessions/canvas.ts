import { z } from "zod";

// The Zod contract for the session canvas — the four working views beside the transcript
// (README.md §Sessions: Plan / Run / Diff / Trace). One schema, both sides of the BFF
// boundary: the router validates the downstream shape and the client hook is typed from
// it, so a malformed frame is a caught error, never a silent `undefined`.

/** A plan step and where the agent is in it. */
export const planStepSchema = z.object({
  id: z.string(),
  text: z.string(),
  state: z.enum(["pending", "active", "done"]),
});
export type PlanStep = z.infer<typeof planStepSchema>;

/** One line of the run log (the agent's terminal output). */
export const runLogLineSchema = z.object({
  id: z.string(),
  at: z.string(),
  level: z.enum(["info", "warn", "error"]),
  text: z.string(),
});
export type RunLogLine = z.infer<typeof runLogLineSchema>;

/** One trace span — an operation the run executed, with its duration and outcome. */
export const traceSpanSchema = z.object({
  id: z.string(),
  name: z.string(),
  durationMs: z.number().nonnegative(),
  status: z.enum(["ok", "error"]),
});
export type TraceSpan = z.infer<typeof traceSpanSchema>;

/** The full canvas payload for one session. `diff` is a raw unified diff (see diff.ts). */
export const sessionCanvasSchema = z.object({
  sessionId: z.string(),
  plan: z.array(planStepSchema),
  run: z.array(runLogLineSchema),
  diff: z.string(),
  trace: z.array(traceSpanSchema),
});
export type SessionCanvas = z.infer<typeof sessionCanvasSchema>;
