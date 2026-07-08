import type { AgentPermission, AgentStatus } from "./schema";

// One source of truth for how agent enums present — labels + semantic-token classes,
// mirroring features/sessions/status.ts. Colors are token utilities, never hardcoded
// (CONTEXT.md: allow=green · ask=amber · deny=red).

export const PERMISSION_META: Record<
  AgentPermission,
  { label: string; badgeClass: string; dotClass: string }
> = {
  allow: { label: "allow", badgeClass: "bg-green-bg text-green", dotClass: "bg-green" },
  ask: { label: "ask", badgeClass: "bg-amber-bg text-amber", dotClass: "bg-amber" },
  deny: { label: "deny", badgeClass: "bg-red-bg text-red", dotClass: "bg-red" },
};

export const AGENT_STATUS_META: Record<AgentStatus, { label: string; dotClass: string }> = {
  working: { label: "Working", dotClass: "bg-clay" },
  idle: { label: "Idle", dotClass: "bg-text-4" },
};

// A stable per-agent avatar tint drawn from the token palette (design gives each agent an
// identity color). Deterministic so an avatar looks the same everywhere it appears.
const AVATAR_TINTS = [
  "bg-blue-bg text-blue",
  "bg-clay-bg text-clay",
  "bg-green-bg text-green",
  "bg-violet-bg text-violet",
  "bg-amber-bg text-amber",
  "bg-purple-bg text-purple",
] as const;

export function avatarTint(seed: string): string {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_TINTS[hash % AVATAR_TINTS.length] ?? AVATAR_TINTS[0];
}
