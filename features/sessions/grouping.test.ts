import { describe, expect, it } from "vitest";
import { filterSessions, groupSessions, SESSION_FILTERS } from "./grouping";
import type { Session } from "./schema";

// Seam: the pure list-shaping fns the sessions surface renders from. The BFF returns a
// flat list (server/services/sessions.ts); the UI buckets it by status into the ordered
// groups (README.md §Sessions: Needs you / Active / Review / Done) and filters by tab.

function session(id: string, status: Session["status"]): Session {
  return {
    id,
    title: id,
    status,
    steps: { completed: 1, total: 2 },
    updatedAt: "2026-07-07T10:00:00.000Z",
  };
}

const sessions: Session[] = [
  session("a", "done"),
  session("b", "needs_you"),
  session("c", "active"),
  session("d", "review"),
  session("e", "needs_you"),
];

describe("groupSessions", () => {
  it("orders groups by attention priority: needs_you, active, review, done", () => {
    const groups = groupSessions(sessions);
    expect(groups.map((g) => g.status)).toEqual(["needs_you", "active", "review", "done"]);
  });

  it("buckets each session under its status with a human label", () => {
    const groups = groupSessions(sessions);
    const needsYou = groups.find((g) => g.status === "needs_you");
    expect(needsYou?.label).toBe("Needs you");
    expect(needsYou?.sessions.map((s) => s.id)).toEqual(["b", "e"]);
  });

  it("omits groups that have no sessions", () => {
    const groups = groupSessions([session("c", "active")]);
    expect(groups.map((g) => g.status)).toEqual(["active"]);
  });

  it("returns no groups for an empty list", () => {
    expect(groupSessions([])).toEqual([]);
  });
});

describe("filterSessions", () => {
  it("returns every session for the 'all' tab", () => {
    expect(filterSessions(sessions, "all")).toHaveLength(5);
  });

  it("keeps only sessions matching a status tab", () => {
    expect(filterSessions(sessions, "needs_you").map((s) => s.id)).toEqual(["b", "e"]);
  });
});

describe("SESSION_FILTERS", () => {
  it("leads with All, then the four status tabs in priority order", () => {
    expect(SESSION_FILTERS.map((f) => f.value)).toEqual([
      "all",
      "needs_you",
      "active",
      "review",
      "done",
    ]);
  });
});
