import { describe, expect, it } from "vitest";
import { sessionBreadcrumbEntity } from "./breadcrumb";
import type { Session } from "./schema";

// Seam: the breadcrumb entity switcher derivation (README.md §App Shell). Off a
// detail route there is no entity; on one, the open session is the current crumb and
// its peers are the siblings.

const SESSIONS: Session[] = [
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
];

describe("sessionBreadcrumbEntity", () => {
  it("returns no entity off a session-detail route", () => {
    expect(sessionBreadcrumbEntity("/sessions", SESSIONS)).toBeUndefined();
    expect(sessionBreadcrumbEntity("/agents", SESSIONS)).toBeUndefined();
  });

  it("names the open session and lists its peers as siblings", () => {
    const entity = sessionBreadcrumbEntity("/sessions/sess_01", SESSIONS);
    expect(entity).toMatchObject({ label: "Refactor auth module", currentId: "sess_01" });
    expect(entity?.siblings).toHaveLength(2);
    expect(entity?.siblings[1]).toMatchObject({
      id: "sess_02",
      label: "Migrate Postgres schema",
      href: "/sessions/sess_02",
    });
  });

  it("falls back to the id when the session is not in the list yet", () => {
    const entity = sessionBreadcrumbEntity("/sessions/sess_unknown", SESSIONS);
    expect(entity?.label).toBe("sess_unknown");
  });
});
