import type { SandboxStatus } from "./schema";

// One source of truth for how a sandbox's status presents — label, badge classes, and status
// dot (CONTEXT.md: running=blue/running · degraded/attention=amber). The running dot pulses
// (motion-safe). Colors are token utilities, never hardcoded.
export const SANDBOX_STATUS_META: Record<
  SandboxStatus,
  { label: string; badgeClass: string; dotClass: string; pulse: boolean }
> = {
  running: {
    label: "Running",
    badgeClass: "bg-blue-bg text-blue",
    dotClass: "bg-blue",
    pulse: true,
  },
  idle: { label: "Idle", badgeClass: "bg-amber-bg text-amber", dotClass: "bg-amber", pulse: false },
  stopped: {
    label: "Stopped",
    badgeClass: "bg-chip text-text-3",
    dotClass: "bg-text-4",
    pulse: false,
  },
};
