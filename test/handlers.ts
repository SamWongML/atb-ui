import { HttpResponse, http } from "msw";
import type { Session } from "@/features/sessions/schema";

// MSW request handlers. With no real backend, these fake the BFF surface so
// day-one feature work (and tests) run against realistic responses/streams.
// Feature slices register their handlers here.

const sessions: Session[] = [
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

export const handlers = [http.get("*/api/sessions", () => HttpResponse.json(sessions))];
