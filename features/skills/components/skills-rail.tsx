"use client";

import { ListRail } from "@/components/list-rail";
import { useListQuery } from "@/lib/use-list-query";
import {
  SKILLS_LIST_QUERY,
  SKILLS_NEW_BUTTON,
  SKILLS_SEARCH_PLACEHOLDER,
  SKILLS_SORT_FIELDS,
  SKILLS_STATUS_FILTERS,
} from "../list-config";
import type { Skill } from "../schema";

// The skills rail (ADR 0002), server-rendered into the shell @header slot from the route's RSC.
// It reads sort/filter from the cookie-backed list-prefs provider, so the saved view paints on the
// first server render — no refresh flash. The list body renders the same state in parallel.

export function SkillsRail({ skills }: { skills: readonly Skill[] }) {
  const query = useListQuery({ items: skills, ...SKILLS_LIST_QUERY });

  return (
    <ListRail
      count={skills.length}
      filter={{
        options: SKILLS_STATUS_FILTERS,
        value: query.status,
        onChange: query.setStatus,
        counts: query.counts,
        ariaLabel: "Filter by status",
      }}
      sort={{
        fields: SKILLS_SORT_FIELDS,
        value: query.sortKey,
        onChange: query.setSortKey,
        dir: query.dir,
        onToggleDir: query.toggleDir,
      }}
      search={{
        value: query.query,
        onChange: query.setQuery,
        placeholder: SKILLS_SEARCH_PLACEHOLDER,
      }}
      newButton={SKILLS_NEW_BUTTON}
    />
  );
}
