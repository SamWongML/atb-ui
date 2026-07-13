"use client";

import { ListRail } from "@/components/list-rail";
import { useListQuery } from "@/lib/use-list-query";
import {
  WORKFLOWS_LIST_QUERY,
  WORKFLOWS_NEW_BUTTON,
  WORKFLOWS_SEARCH_PLACEHOLDER,
  WORKFLOWS_SORT_FIELDS,
  WORKFLOWS_STATUS_FILTERS,
} from "../list-config";
import type { Workflow } from "../schema";

// The workflows rail (ADR 0002), server-rendered into the shell @header slot from the route's
// RSC. It reads sort/filter from the cookie-backed list-prefs provider, so the saved view paints
// on the first server render — no refresh flash. The list body renders the same state in parallel.

export function WorkflowsRail({ workflows }: { workflows: readonly Workflow[] }) {
  const query = useListQuery({ items: workflows, ...WORKFLOWS_LIST_QUERY });

  return (
    <ListRail
      count={workflows.length}
      filter={{
        options: WORKFLOWS_STATUS_FILTERS,
        value: query.status,
        onChange: query.setStatus,
        counts: query.counts,
        ariaLabel: "Filter by status",
      }}
      sort={{
        fields: WORKFLOWS_SORT_FIELDS,
        value: query.sortKey,
        onChange: query.setSortKey,
        dir: query.dir,
        onToggleDir: query.toggleDir,
      }}
      search={{
        value: query.query,
        onChange: query.setQuery,
        placeholder: WORKFLOWS_SEARCH_PLACEHOLDER,
      }}
      newButton={WORKFLOWS_NEW_BUTTON}
    />
  );
}
