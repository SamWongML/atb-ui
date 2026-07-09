import { RUN_STATUS_META } from "./presentation";
import { RUN_STATUSES, type Run, type RunStatus } from "./schema";

// Pure list-shaping for the runs surface. The BFF returns a flat, newest-first history; the
// UI narrows it to the active status tab. Kept pure and colocated so it's tested at its seam,
// not through the DOM. RUN_STATUSES doubles as the tab order after "All".

/** The filter tab a run belongs to — "all" plus each status, in declaration order. */
export type RunFilter = "all" | RunStatus;

/** Filter values as a literal tuple — the URL parser (nuqs) validates against this. */
export const RUN_FILTER_VALUES = ["all", ...RUN_STATUSES] as const;

export const RUN_FILTERS: ReadonlyArray<{ value: RunFilter; label: string }> = [
  { value: "all", label: "All" },
  ...RUN_STATUSES.map((status) => ({ value: status, label: RUN_STATUS_META[status].label })),
];

/** Narrow a list to the active filter tab; "all" passes everything through. */
export function filterRuns(runs: Run[], filter: RunFilter): Run[] {
  if (filter === "all") return runs;
  return runs.filter((run) => run.status === filter);
}
