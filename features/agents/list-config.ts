import type { Route } from "next";
import type { DisplayProperty, ListDisplayConfig } from "@/components/list-display";
import { leadingNumber, type SortField } from "@/lib/list-query";
import { AGENT_STATUS_META } from "./presentation";
import { AGENT_STATUSES, type Agent } from "./schema";

// The agents roster's list configuration — sort fields, status filter tabs, search
// predicate and the Display vocabulary — shared by the screen's two halves: the rail
// (server-rendered into the shell @header slot) and the roster body (the page). Both feed
// the same useListQuery/useListDisplay from this one source, so their view can never drift.

const AGENTS_SCOPE = "agents";

export const AGENTS_SORT_FIELDS: SortField<Agent>[] = [
  { key: "name", label: "Name", value: (agent) => agent.name.toLowerCase() },
  { key: "status", label: "Status", value: (agent) => AGENT_STATUSES.indexOf(agent.status) },
  { key: "tasks", label: "Tasks", value: (agent) => leadingNumber(agent.usage.tasks) },
  { key: "merged", label: "Merged rate", value: (agent) => leadingNumber(agent.usage.merged) },
  { key: "cost", label: "Cost", value: (agent) => leadingNumber(agent.usage.cost) },
];

export const AGENTS_STATUS_FILTERS = [
  { value: "all", label: "All" },
  ...AGENT_STATUSES.map((status) => ({ value: status, label: AGENT_STATUS_META[status].label })),
];

const AGENTS_DISPLAY_PROPERTIES: readonly DisplayProperty[] = [
  { key: "description", label: "Description" },
  { key: "capabilities", label: "Capabilities" },
  { key: "usage", label: "Usage" },
  { key: "permissions", label: "Permissions" },
];

export const AGENTS_DISPLAY_CONFIG: ListDisplayConfig = {
  scope: AGENTS_SCOPE,
  properties: AGENTS_DISPLAY_PROPERTIES,
  groupable: true,
};

function agentMatches(agent: Agent, query: string): boolean {
  return (
    agent.name.toLowerCase().includes(query) ||
    agent.role.toLowerCase().includes(query) ||
    agent.description.toLowerCase().includes(query) ||
    agent.skills.some((skill) => skill.toLowerCase().includes(query)) ||
    agent.mcps.some((mcp) => mcp.toLowerCase().includes(query))
  );
}

/** The useListQuery config minus `items` — both the rail and the body spread this in. */
export const AGENTS_LIST_QUERY = {
  scope: AGENTS_SCOPE,
  sortFields: AGENTS_SORT_FIELDS,
  statuses: AGENT_STATUSES,
  statusOf: (agent: Agent) => agent.status,
  matches: agentMatches,
};

export const AGENTS_NEW_BUTTON: { href: Route; label: string } = {
  href: "/agents/new",
  label: "New agent",
};

export const AGENTS_SEARCH_PLACEHOLDER = "Search agents, roles, skills…";
