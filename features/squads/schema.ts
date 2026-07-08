import { z } from "zod";

// One Zod schema per shape, shared by the client and the BFF router (CONTEXT.md).

/** Whether the squad is currently running or waiting. */
export const SQUAD_STATUSES = ["active", "idle"] as const;
export const squadStatusSchema = z.enum(SQUAD_STATUSES);
export type SquadStatus = z.infer<typeof squadStatusSchema>;

/** Outcome of a squad run (drives the recent-runs dot). */
export const RUN_OUTCOMES = ["running", "merged", "failed"] as const;
export const runOutcomeSchema = z.enum(RUN_OUTCOMES);
export type RunOutcome = z.infer<typeof runOutcomeSchema>;

export const squadRunSchema = z.object({
  id: z.string(),
  title: z.string(),
  when: z.string(),
  status: runOutcomeSchema,
});
export type SquadRun = z.infer<typeof squadRunSchema>;

export const squadSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: squadStatusSchema,
  /** The lead agent's 2-letter mono. */
  lead: z.string(),
  /** Member agents' 2-letter monos. */
  members: z.array(z.string()),
  mission: z.string(),
  repo: z.string(),
  phase: z.string(),
  stepsDone: z.number().int().nonnegative(),
  stepsTotal: z.number().int().positive(),
  description: z.string(),
  runs: z.string(),
  merged: z.string(),
  tokens: z.string(),
  cost: z.string(),
  avgTime: z.string(),
  schedule: z.string(),
  lastRun: z.string(),
  recentRuns: z.array(squadRunSchema),
});
export type Squad = z.infer<typeof squadSchema>;

export const squadListSchema = z.array(squadSchema);

/** The user-editable subset — the create/edit form contract. */
export const squadInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  mission: z.string().min(1, "A mission is required"),
  repo: z.string().min(1, "Target repo is required"),
  lead: z.string().min(1, "A lead is required"),
  phase: z.string().min(1, "Phase is required"),
  stepsTotal: z.number().int().positive("At least one step is required"),
  /** Member agents' 2-letter monos (CONTEXT.md: a squad is a team of agents). */
  members: z.array(z.string()),
});
export type SquadInput = z.infer<typeof squadInputSchema>;

/** Project a full squad onto the editable form contract (edit-mode default values). */
export function squadToInput(squad: Squad): SquadInput {
  return {
    name: squad.name,
    mission: squad.mission,
    repo: squad.repo,
    lead: squad.lead,
    phase: squad.phase,
    stepsTotal: squad.stepsTotal,
    members: squad.members,
  };
}
