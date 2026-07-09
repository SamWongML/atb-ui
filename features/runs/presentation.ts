import type { RunStatus } from "./schema";

// One source of truth for how a run's status presents — its human label, badge classes, and
// status dot (CONTEXT.md: running=blue/running · failed=red/error · passed=green/done). The
// running dot pulses (motion-safe). Colors are token utilities, never hardcoded.
export const RUN_STATUS_META: Record<
  RunStatus,
  { label: string; badgeClass: string; dotClass: string; pulse: boolean }
> = {
  running: {
    label: "Running",
    badgeClass: "bg-blue-bg text-blue",
    dotClass: "bg-blue",
    pulse: true,
  },
  failed: { label: "Failed", badgeClass: "bg-red-bg text-red", dotClass: "bg-red", pulse: false },
  passed: {
    label: "Passed",
    badgeClass: "bg-green-bg text-green",
    dotClass: "bg-green",
    pulse: false,
  },
};
