import { act, renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { SortField } from "@/lib/list-query";
import { useListQuery } from "./use-list-query";

// Seam: the shared list query model — filtering by status + search and sorting, plus the
// per-status counts the rail's tabs read. Tested through the hook's public return.

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

function setup() {
  return renderHook(() =>
    useListQuery({
      items: ROWS,
      sortFields: SORT_FIELDS,
      statuses: ["active", "idle"],
      statusOf: (row) => row.status,
      matches: (row, q) => row.name.includes(q),
      defaultSortKey: "name",
    }),
  );
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
});
