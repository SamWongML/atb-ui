import type { Route } from "next";
import { leadingNumber, type SortField } from "@/lib/list-query";
import { MCP_STATUS_META } from "./presentation";
import { MCP_STATUSES, type McpServer } from "./schema";

// The MCP servers list configuration — shared by the rail (server-rendered into the shell
// @header slot) and the list body (the page), so their sort/filter view can't drift.

const MCP_SCOPE = "mcp";

export const MCP_SORT_FIELDS: SortField<McpServer>[] = [
  { key: "name", label: "Name", value: (server) => server.name.toLowerCase() },
  { key: "status", label: "Health", value: (server) => MCP_STATUSES.indexOf(server.status) },
  { key: "tools", label: "Tools", value: (server) => server.toolCount },
  { key: "latency", label: "Latency", value: (server) => leadingNumber(server.latency) },
];

export const MCP_STATUS_FILTERS = [
  { value: "all", label: "All" },
  ...MCP_STATUSES.map((status) => ({ value: status, label: MCP_STATUS_META[status].label })),
];

function serverMatches(server: McpServer, query: string): boolean {
  return (
    server.name.toLowerCase().includes(query) || server.description.toLowerCase().includes(query)
  );
}

/** The useListQuery config minus `items` — both the rail and the body spread this in. */
export const MCP_LIST_QUERY = {
  scope: MCP_SCOPE,
  sortFields: MCP_SORT_FIELDS,
  statuses: MCP_STATUSES,
  statusOf: (server: McpServer) => server.status,
  matches: serverMatches,
};

export const MCP_NEW_BUTTON: { href: Route; label: string } = {
  href: "/mcp/new",
  label: "Connect server",
};

export const MCP_SEARCH_PLACEHOLDER = "Search servers…";
