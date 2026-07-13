import type { Route } from "next";
import { leadingNumber, type SortField } from "@/lib/list-query";
import { SQUAD_STATUS_META } from "./presentation";
import { SQUAD_STATUSES, type Squad } from "./schema";

// The squads list configuration — shared by the rail (server-rendered into the shell
// @header slot) and the list body (the page), so their sort/filter view can't drift.

const SQUADS_SCOPE = "squads";

export const SQUADS_SORT_FIELDS: SortField<Squad>[] = [
  { key: "name", label: "Name", value: (squad) => squad.name.toLowerCase() },
  { key: "status", label: "Status", value: (squad) => SQUAD_STATUSES.indexOf(squad.status) },
  { key: "progress", label: "Progress", value: (squad) => squad.stepsDone / squad.stepsTotal },
  { key: "runs", label: "Runs", value: (squad) => leadingNumber(squad.runs) },
];

export const SQUADS_STATUS_FILTERS = [
  { value: "all", label: "All" },
  ...SQUAD_STATUSES.map((status) => ({ value: status, label: SQUAD_STATUS_META[status].label })),
];

function squadMatches(squad: Squad, query: string): boolean {
  return (
    squad.name.toLowerCase().includes(query) ||
    squad.mission.toLowerCase().includes(query) ||
    squad.description.toLowerCase().includes(query)
  );
}

/** The useListQuery config minus `items` — both the rail and the body spread this in. */
export const SQUADS_LIST_QUERY = {
  scope: SQUADS_SCOPE,
  sortFields: SQUADS_SORT_FIELDS,
  statuses: SQUAD_STATUSES,
  statusOf: (squad: Squad) => squad.status,
  matches: squadMatches,
};

export const SQUADS_NEW_BUTTON: { href: Route; label: string } = {
  href: "/squads/new",
  label: "New squad",
};

export const SQUADS_SEARCH_PLACEHOLDER = "Search squads…";
