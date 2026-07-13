"use client";

import { ListRail } from "@/components/list-rail";
import { useListQuery } from "@/lib/use-list-query";
import {
  MCP_LIST_QUERY,
  MCP_NEW_BUTTON,
  MCP_SEARCH_PLACEHOLDER,
  MCP_SORT_FIELDS,
  MCP_STATUS_FILTERS,
} from "../list-config";
import type { McpServer } from "../schema";

// The MCP servers rail (ADR 0002), server-rendered into the shell @header slot from the route's
// RSC. It reads sort/filter from the cookie-backed list-prefs provider, so the saved view paints on
// the first server render — no refresh flash. The list body renders the same state in parallel.

export function McpRail({ servers }: { servers: readonly McpServer[] }) {
  const query = useListQuery({ items: servers, ...MCP_LIST_QUERY });

  return (
    <ListRail
      count={servers.length}
      filter={{
        options: MCP_STATUS_FILTERS,
        value: query.status,
        onChange: query.setStatus,
        counts: query.counts,
        ariaLabel: "Filter by health",
      }}
      sort={{
        fields: MCP_SORT_FIELDS,
        value: query.sortKey,
        onChange: query.setSortKey,
        dir: query.dir,
        onToggleDir: query.toggleDir,
      }}
      search={{
        value: query.query,
        onChange: query.setQuery,
        placeholder: MCP_SEARCH_PLACEHOLDER,
      }}
      newButton={MCP_NEW_BUTTON}
    />
  );
}
