import { act, renderHook } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import {
  EMPTY_LIST_PREFS,
  LIST_PREFS_COOKIE,
  type ListPrefs,
  parseListPrefs,
} from "@/lib/list-prefs";
import { ListPrefsProvider } from "@/lib/list-prefs-provider";
import type { SortField } from "@/lib/list-query";
import { useListQuery } from "./use-list-query";

// Seam: the shared list query model — filtering by status + search and sorting, plus the
// per-status counts the rail's tabs read. State is seeded from the cookie the server read
// (so a refresh restores the view with no flash) and written back to the cookie on change.
// Exercised through the hook's public return, under a real <ListPrefsProvider>.

type Row = { id: string; name: string; status: string; runs: number };

const ROWS: Row[] = [
  { id: "a", name: "alpha", status: "active", runs: 10 },
  { id: "b", name: "bravo", status: "idle", runs: 30 },
  { id: "c", name: "charlie", status: "active", runs: 20 },
];

const SORT_FIELDS: SortField<Row>[] = [
  { key: "name", label: "Name", value: (row) => row.name },
  { key: "runs", label: "Runs", value: (row) => row.runs },
];

const config = (scope: string) => ({
  scope,
  items: ROWS,
  sortFields: SORT_FIELDS,
  statuses: ["active", "idle"],
  statusOf: (row: Row) => row.status,
  matches: (row: Row, q: string) => row.name.includes(q),
  defaultSortKey: "name",
});

function wrap(initial: ListPrefs) {
  return ({ children }: { children: ReactNode }) => (
    <ListPrefsProvider initial={initial}>{children}</ListPrefsProvider>
  );
}

function setup(initial: ListPrefs = EMPTY_LIST_PREFS) {
  return renderHook(() => useListQuery(config("test")), { wrapper: wrap(initial) });
}

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((entry) => entry.startsWith(`${name}=`))
    ?.slice(name.length + 1);
}

describe("useListQuery", () => {
  it("counts items per status, with `all` as the total", () => {
    const { result } = setup();
    expect(result.current.counts).toEqual({ all: 3, active: 2, idle: 1 });
  });

  it("filters by the selected status", () => {
    const { result } = setup();
    act(() => result.current.setStatus("idle"));
    expect(result.current.visible.map((row) => row.id)).toEqual(["b"]);
  });

  it("filters by the search query", () => {
    const { result } = setup();
    act(() => result.current.setQuery("char"));
    expect(result.current.visible.map((row) => row.id)).toEqual(["c"]);
  });

  it("sorts by the active field and direction", () => {
    const { result } = setup();
    act(() => result.current.setSortKey("runs"));
    expect(result.current.visible.map((row) => row.runs)).toEqual([10, 20, 30]);
    act(() => result.current.toggleDir());
    expect(result.current.visible.map((row) => row.runs)).toEqual([30, 20, 10]);
  });

  it("renders the saved view seeded from the cookie on first render (no refresh flash)", () => {
    const { result } = setup({
      query: { test: { status: "idle", sortKey: "runs", dir: "desc" } },
      display: {},
    });
    expect(result.current.status).toBe("idle");
    expect(result.current.sortKey).toBe("runs");
    expect(result.current.visible.map((row) => row.id)).toEqual(["b"]);
  });

  it("writes changes back to the cookie so the next server render restores them", () => {
    const { result } = setup();
    act(() => result.current.setStatus("idle"));
    expect(parseListPrefs(readCookie(LIST_PREFS_COOKIE)).query.test?.status).toBe("idle");
  });

  it("isolates one scope's view from another", () => {
    const { result } = renderHook(
      () => ({
        agents: useListQuery(config("agents")),
        workflows: useListQuery(config("workflows")),
      }),
      { wrapper: wrap({ query: { agents: { status: "idle" } }, display: {} }) },
    );
    expect(result.current.agents.status).toBe("idle");
    expect(result.current.workflows.status).toBe("all");
  });
});
