import type { RunOutcome, SquadStatus } from "./schema";

// One source of truth for how squad enums present — labels + semantic-token classes.
// Colors are token utilities, never hardcoded.
export const SQUAD_STATUS_META: Record<
  SquadStatus,
  { label: string; badgeClass: string; dotClass: string; pulse: boolean }
> = {
  active: { label: "Active", badgeClass: "bg-clay-bg text-clay", dotClass: "bg-clay", pulse: true },
  idle: { label: "Idle", badgeClass: "bg-chip text-text-2", dotClass: "bg-text-4", pulse: false },
};

// Recent-run outcome dots (README.md: running=blue/info · merged=green · failed=red).
export const RUN_OUTCOME_META: Record<RunOutcome, { label: string; dotClass: string }> = {
  running: { label: "Running", dotClass: "bg-blue" },
  merged: { label: "Merged", dotClass: "bg-green" },
  failed: { label: "Failed", dotClass: "bg-red" },
};
