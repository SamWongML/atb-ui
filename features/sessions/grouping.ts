import { SESSION_STATUSES, type Session, type SessionStatus } from "./schema";
import { STATUS_META } from "./status";

// Pure list-shaping for the sessions surface. The BFF returns a flat, unordered list;
// the UI buckets it into the ordered status groups (README.md §Sessions) and filters by
// the active tab. Kept pure and colocated so it's tested at its seam, not through the DOM.

/** Attention priority — the order groups and tabs appear in, most-urgent first. */
const STATUS_ORDER = SESSION_STATUSES;

export interface SessionGroup {
  status: SessionStatus;
  label: string;
  sessions: Session[];
}

/** Bucket a flat list into ordered, non-empty status groups. */
export function groupSessions(sessions: Session[]): SessionGroup[] {
  return STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_META[status].label,
    sessions: sessions.filter((session) => session.status === status),
  })).filter((group) => group.sessions.length > 0);
}

/** The filter tab a session belongs to — "all" plus each status, in priority order. */
export type SessionFilter = "all" | SessionStatus;

/** Filter values as a literal tuple — the URL parser (nuqs) validates against this. */
export const SESSION_FILTER_VALUES = ["all", ...STATUS_ORDER] as const;

export const SESSION_FILTERS: ReadonlyArray<{ value: SessionFilter; label: string }> = [
  { value: "all", label: "All" },
  ...STATUS_ORDER.map((status) => ({ value: status, label: STATUS_META[status].label })),
];

/** Narrow a list to the active filter tab; "all" passes everything through. */
export function filterSessions(sessions: Session[], filter: SessionFilter): Session[] {
  if (filter === "all") return sessions;
  return sessions.filter((session) => session.status === filter);
}
