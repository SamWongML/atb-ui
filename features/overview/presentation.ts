import type { OverviewActivityStatus } from "./schema";

// One source of truth for how an activity entry's status presents its dot (CONTEXT.md:
// running=blue/running · failed=red/error · passed=green/done). The running dot pulses
// (motion-safe). Colors are token utilities, never hardcoded.
export const OVERVIEW_ACTIVITY_META: Record<
  OverviewActivityStatus,
  { label: string; dotClass: string; pulse: boolean }
> = {
  running: { label: "Running", dotClass: "bg-blue", pulse: true },
  failed: { label: "Failed", dotClass: "bg-red", pulse: false },
  passed: { label: "Passed", dotClass: "bg-green", pulse: false },
};
