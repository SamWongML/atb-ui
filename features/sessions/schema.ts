import { z } from "zod";

// One Zod schema, both sides of the boundary: it validates the inbound BFF
// response (and later live stream frames) and types the client (TECH_STACK.md L2).

/** Session lifecycle groups the list is bucketed into (README.md §Sessions). */
export const SESSION_STATUSES = ["needs_you", "active", "review", "done"] as const;
export const sessionStatusSchema = z.enum(SESSION_STATUSES);
export type SessionStatus = z.infer<typeof sessionStatusSchema>;

/** Step progress; shared by the list row and the live `step` frame. */
export const sessionStepsSchema = z.object({
  completed: z.number().int().nonnegative(),
  total: z.number().int().positive(),
});
export type SessionSteps = z.infer<typeof sessionStepsSchema>;

export const sessionSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: sessionStatusSchema,
  steps: sessionStepsSchema,
  updatedAt: z.string(),
});
export type Session = z.infer<typeof sessionSchema>;

export const sessionListSchema = z.array(sessionSchema);
