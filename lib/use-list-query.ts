"use client";

import { useMemo, useState } from "react";
import { type SortDir, type SortField, sortItems } from "@/lib/list-query";

// The one query model behind every BUILD list screen (Agents, Workflows, Squads,
// Skills, MCP). Each screen repeated the same four pieces of state (search · status ·
// sort field · direction) plus a filter/sort memo and a per-status count; this hook
// centralizes all of it. A screen supplies only what is screen-specific: its sort
// fields, how to read an item's status, its status vocabulary, and its search
// predicate. Framework state lives here; the rendering (rail + cards) stays in the
// screen. Pairs with <ListRail>, which renders this state.

export type ListQuery<T> = {
  query: string;
  setQuery: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  sortKey: string;
  setSortKey: (key: string) => void;
  dir: SortDir;
  setDir: (dir: SortDir) => void;
  toggleDir: () => void;
  /** Filtered + sorted items for the current query. */
  visible: T[];
  /** Count per status value (`all` = every item) — drives the counted status tabs. */
  counts: Record<string, number>;
  activeSortLabel: string;
};

export function useListQuery<T>({
  items,
  sortFields,
  statuses,
  statusOf,
  matches,
  defaultSortKey = "status",
  defaultDir = "asc",
}: {
  items: readonly T[];
  sortFields: readonly SortField<T>[];
  /** The status values this screen filters by (excluding the synthetic `all`). */
  statuses: readonly string[];
  statusOf: (item: T) => string;
  /** Whether an item matches the trimmed, lowercased search query. */
  matches: (item: T, query: string) => boolean;
  defaultSortKey?: string;
  defaultDir?: SortDir;
}): ListQuery<T> {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState(defaultSortKey);
  const [dir, setDir] = useState<SortDir>(defaultDir);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = items.filter((item) => {
      if (status !== "all" && statusOf(item) !== status) return false;
      if (!q) return true;
      return matches(item, q);
    });
    return sortItems(filtered, sortFields, sortKey, dir);
  }, [items, query, status, sortKey, dir, sortFields, statusOf, matches]);

  const counts = useMemo(() => {
    const byStatus: Record<string, number> = { all: items.length };
    for (const value of statuses) {
      byStatus[value] = items.filter((item) => statusOf(item) === value).length;
    }
    return byStatus;
  }, [items, statuses, statusOf]);

  return {
    query,
    setQuery,
    status,
    setStatus,
    sortKey,
    setSortKey,
    dir,
    setDir,
    toggleDir: () => setDir((current) => (current === "asc" ? "desc" : "asc")),
    visible,
    counts,
    activeSortLabel:
      sortFields.find((field) => field.key === sortKey)?.label ?? sortFields[0]?.label ?? "",
  };
}
