"use client";

import { useListDisplay } from "@/components/list-display";
import { ListRail } from "@/components/list-rail";
import { useListQuery } from "@/lib/use-list-query";
import {
  AGENTS_DISPLAY_CONFIG,
  AGENTS_LIST_QUERY,
  AGENTS_NEW_BUTTON,
  AGENTS_SEARCH_PLACEHOLDER,
  AGENTS_SORT_FIELDS,
  AGENTS_STATUS_FILTERS,
} from "../list-config";
import type { Agent } from "../schema";

// The agents roster's rail (ADR 0002), server-rendered into the shell @header slot from the
// route's RSC. It reads sort/filter/display from the cookie-backed list-prefs provider (global
// in the (app) layout), so the saved view paints on the first server render — no refresh flash.
// The roster body renders the same useListQuery/useListDisplay from the same config, in parallel.

export function AgentsRail({ agents }: { agents: readonly Agent[] }) {
  const query = useListQuery({ items: agents, ...AGENTS_LIST_QUERY });
  const display = useListDisplay(AGENTS_DISPLAY_CONFIG);

  return (
    <ListRail
      count={agents.length}
      filter={{
        options: AGENTS_STATUS_FILTERS,
        value: query.status,
        onChange: query.setStatus,
        counts: query.counts,
        ariaLabel: "Filter by status",
      }}
      sort={{
        fields: AGENTS_SORT_FIELDS,
        value: query.sortKey,
        onChange: query.setSortKey,
        dir: query.dir,
        onToggleDir: query.toggleDir,
      }}
      search={{
        value: query.query,
        onChange: query.setQuery,
        placeholder: AGENTS_SEARCH_PLACEHOLDER,
      }}
      newButton={AGENTS_NEW_BUTTON}
      display={display}
    />
  );
}
