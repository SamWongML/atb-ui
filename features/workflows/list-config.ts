import type { Route } from "next";
import { leadingNumber, type SortField } from "@/lib/list-query";
import { WORKFLOW_STATUS_META } from "./presentation";
import { WORKFLOW_STATUSES, type Workflow } from "./schema";

// The workflows list configuration — shared by the rail (server-rendered into the shell
// @header slot) and the list body (the page), so their sort/filter view can't drift.

const WORKFLOWS_SCOPE = "workflows";

export const WORKFLOWS_SORT_FIELDS: SortField<Workflow>[] = [
  { key: "name", label: "Name", value: (workflow) => workflow.name.toLowerCase() },
  {
    key: "status",
    label: "Status",
    value: (workflow) => WORKFLOW_STATUSES.indexOf(workflow.status),
  },
  { key: "steps", label: "Steps", value: (workflow) => workflow.steps },
  { key: "runs", label: "Runs", value: (workflow) => leadingNumber(workflow.runs) },
];

export const WORKFLOWS_STATUS_FILTERS = [
  { value: "all", label: "All" },
  ...WORKFLOW_STATUSES.map((status) => ({
    value: status,
    label: WORKFLOW_STATUS_META[status].label,
  })),
];

function workflowMatches(workflow: Workflow, query: string): boolean {
  return (
    workflow.name.toLowerCase().includes(query) ||
    workflow.description.toLowerCase().includes(query)
  );
}

/** The useListQuery config minus `items` — both the rail and the body spread this in. */
export const WORKFLOWS_LIST_QUERY = {
  scope: WORKFLOWS_SCOPE,
  sortFields: WORKFLOWS_SORT_FIELDS,
  statuses: WORKFLOW_STATUSES,
  statusOf: (workflow: Workflow) => workflow.status,
  matches: workflowMatches,
};

export const WORKFLOWS_NEW_BUTTON: { href: Route; label: string } = {
  href: "/workflows/new",
  label: "New workflow",
};

export const WORKFLOWS_SEARCH_PLACEHOLDER = "Search workflows…";
