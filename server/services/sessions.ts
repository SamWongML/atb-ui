import type { Session } from "@/features/sessions/schema";

// The BFF's sessions data source. No real downstream exists yet, so this returns an
// in-memory seed; when the agent engine comes online this becomes a client call. The
// shape is the single Zod schema in features/sessions/schema.ts.
const SEED_SESSIONS: Session[] = [
  {
    id: "sess_01",
    title: "Refactor auth module",
    status: "needs_you",
    steps: { completed: 3, total: 5 },
    updatedAt: "2026-07-07T10:12:00.000Z",
  },
  {
    id: "sess_02",
    title: "Migrate Postgres schema",
    status: "active",
    steps: { completed: 1, total: 4 },
    updatedAt: "2026-07-07T10:20:00.000Z",
  },
  {
    id: "sess_03",
    title: "Add Recharts dashboard",
    status: "review",
    steps: { completed: 4, total: 4 },
    updatedAt: "2026-07-07T09:50:00.000Z",
  },
];

export function listSessions(): Session[] {
  return SEED_SESSIONS;
}

export function getSession(id: string): Session | undefined {
  return SEED_SESSIONS.find((session) => session.id === id);
}
