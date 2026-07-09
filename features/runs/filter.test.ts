import { describe, expect, it } from "vitest";
import { filterRuns, RUN_FILTERS } from "./filter";
import type { Run } from "./schema";

// Seam: pure run filtering (features/runs/filter.ts). The list is flat history; this narrows
// it to a status tab, independent of the DOM.

function run(id: string, status: Run["status"]): Run {
  return {
    id,
    source: id,
    status,
    model: "claude-opus-4-8",
    startedAt: "now",
    duration: "1s",
    cost: "$0.01",
    steps: { completed: 1, total: 1 },
    rootCause: status === "failed" ? "boom" : null,
  };
}

const runs: Run[] = [
  run("a", "running"),
  run("b", "failed"),
  run("c", "passed"),
  run("d", "failed"),
];

describe("filterRuns", () => {
  it("passes everything through for the 'all' filter", () => {
    expect(filterRuns(runs, "all").map((r) => r.id)).toEqual(["a", "b", "c", "d"]);
  });

  it("narrows to a single status", () => {
    expect(filterRuns(runs, "failed").map((r) => r.id)).toEqual(["b", "d"]);
  });
});

describe("RUN_FILTERS", () => {
  it("leads with All, then the statuses in priority order", () => {
    expect(RUN_FILTERS.map((f) => f.value)).toEqual(["all", "running", "failed", "passed"]);
    expect(RUN_FILTERS[0]?.label).toBe("All");
  });
});
