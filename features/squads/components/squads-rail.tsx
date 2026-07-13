"use client";

import { ListRail } from "@/components/list-rail";
import { useListQuery } from "@/lib/use-list-query";
import {
  SQUADS_LIST_QUERY,
  SQUADS_NEW_BUTTON,
  SQUADS_SEARCH_PLACEHOLDER,
  SQUADS_SORT_FIELDS,
  SQUADS_STATUS_FILTERS,
} from "../list-config";
import type { Squad } from "../schema";

// The squads rail (ADR 0002), server-rendered into the shell @header slot from the route's RSC.
// It reads sort/filter from the cookie-backed list-prefs provider, so the saved view paints on the
// first server render — no refresh flash. The list body renders the same state in parallel.

export function SquadsRail({ squads }: { squads: readonly Squad[] }) {
  const query = useListQuery({ items: squads, ...SQUADS_LIST_QUERY });

  return (
    <ListRail
      count={squads.length}
      filter={{
        options: SQUADS_STATUS_FILTERS,
        value: query.status,
        onChange: query.setStatus,
        counts: query.counts,
        ariaLabel: "Filter by status",
      }}
      sort={{
        fields: SQUADS_SORT_FIELDS,
        value: query.sortKey,
        onChange: query.setSortKey,
        dir: query.dir,
        onToggleDir: query.toggleDir,
      }}
      search={{
        value: query.query,
        onChange: query.setQuery,
        placeholder: SQUADS_SEARCH_PLACEHOLDER,
      }}
      newButton={SQUADS_NEW_BUTTON}
    />
  );
}
