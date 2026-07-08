import type { SessionCanvas } from "@/features/sessions/canvas";
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

// The canvas (Plan / Run / Diff / Trace) each session exposes beside its transcript.
// Seeded in-memory until the agent engine is wired; the shape is the single Zod schema in
// features/sessions/canvas.ts, validated at the router boundary.
const AUTH_DIFF = `diff --git a/src/auth.ts b/src/auth.ts
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -1,5 +1,6 @@
 import { verify } from "./jwt";
-export function login(token: string) {
-  return verify(token);
+export async function login(token: string) {
+  const claims = await verify(token);
+  return claims;
 }
`;

const SEED_CANVASES: Record<string, SessionCanvas> = {
  sess_01: {
    sessionId: "sess_01",
    plan: [
      { id: "p1", text: "Read the current auth module", state: "done" },
      { id: "p2", text: "Make login() async and await verify()", state: "active" },
      { id: "p3", text: "Update callers and add tests", state: "pending" },
    ],
    run: [
      { id: "r1", at: "2026-07-07T10:10:02.000Z", level: "info", text: "$ pnpm test auth" },
      {
        id: "r2",
        at: "2026-07-07T10:10:04.000Z",
        level: "info",
        text: "verify() now returns claims",
      },
      {
        id: "r3",
        at: "2026-07-07T10:10:05.000Z",
        level: "warn",
        text: "2 callers still pass sync",
      },
    ],
    diff: AUTH_DIFF,
    trace: [
      { id: "t1", name: "read src/auth.ts", durationMs: 42, status: "ok" },
      { id: "t2", name: "edit login()", durationMs: 118, status: "ok" },
      { id: "t3", name: "pnpm test auth", durationMs: 2140, status: "error" },
    ],
  },
  sess_02: {
    sessionId: "sess_02",
    plan: [
      { id: "p1", text: "Inspect the current Postgres schema", state: "done" },
      { id: "p2", text: "Write the migration", state: "active" },
      { id: "p3", text: "Backfill and verify", state: "pending" },
    ],
    run: [{ id: "r1", at: "2026-07-07T10:20:01.000Z", level: "info", text: "$ pnpm db:migrate" }],
    diff: `diff --git a/db/schema.sql b/db/schema.sql
--- a/db/schema.sql
+++ b/db/schema.sql
@@ -3,3 +3,4 @@
 create table sessions (
   id uuid primary key,
+  archived_at timestamptz,
 );
`,
    trace: [{ id: "t1", name: "introspect schema", durationMs: 88, status: "ok" }],
  },
  sess_03: {
    sessionId: "sess_03",
    plan: [
      { id: "p1", text: "Scaffold the Recharts dashboard", state: "done" },
      { id: "p2", text: "Wire cost + model-mix series", state: "done" },
      { id: "p3", text: "Review the layout", state: "active" },
    ],
    run: [{ id: "r1", at: "2026-07-07T09:50:00.000Z", level: "info", text: "$ pnpm build" }],
    diff: `diff --git a/app/analytics/page.tsx b/app/analytics/page.tsx
--- a/app/analytics/page.tsx
+++ b/app/analytics/page.tsx
@@ -1 +1,2 @@
-export default function Page() { return null; }
+import { CostChart } from "@/features/analytics/components/cost-chart";
+export default function Page() { return <CostChart />; }
`,
    trace: [{ id: "t1", name: "render dashboard", durationMs: 310, status: "ok" }],
  },
};

export function getSessionCanvas(id: string): SessionCanvas | undefined {
  return SEED_CANVASES[id];
}
