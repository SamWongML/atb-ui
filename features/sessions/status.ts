import type { SessionStatus } from "./schema";

// One source of truth for how each session lifecycle status presents — its human label
// and its semantic-token badge classes (CONTEXT.md: needs-you=amber · active=clay ·
// review=violet · done=green). Shared by the list, the group headers, and the transcript
// so a status looks identical everywhere. Colors are token utilities, never hardcoded.
export const STATUS_META: Record<SessionStatus, { label: string; badgeClass: string }> = {
  needs_you: { label: "Needs you", badgeClass: "bg-amber-bg text-amber" },
  active: { label: "Active", badgeClass: "bg-clay-bg text-clay" },
  review: { label: "Review", badgeClass: "bg-violet-bg text-violet" },
  done: { label: "Done", badgeClass: "bg-green-bg text-green" },
};
