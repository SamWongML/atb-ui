import type { McpStatus } from "./schema";

// One source of truth for how MCP health presents — labels + semantic-token classes
// (CONTEXT.md: healthy=green · degraded=amber). Degraded pulses in the UI (motion-safe so
// prefers-reduced-motion is honored). Colors are token utilities, never hardcoded.
export const MCP_STATUS_META: Record<
  McpStatus,
  { label: string; dotClass: string; badgeClass: string; pulse: boolean }
> = {
  healthy: {
    label: "Healthy",
    dotClass: "bg-green",
    badgeClass: "bg-green-bg text-green",
    pulse: false,
  },
  degraded: {
    label: "Degraded",
    dotClass: "bg-amber",
    badgeClass: "bg-amber-bg text-amber",
    pulse: true,
  },
};
