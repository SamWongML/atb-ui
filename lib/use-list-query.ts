"use client";

import { useMemo } from "react";
import { useListPrefs } from "@/lib/list-prefs-provider";
import { type SortDir, type SortField, sortItems } from "@/lib/list-query";

// The one query model behind every BUILD list screen (Agents, Workflows, Squads, Skills,
// MCP). Each screen repeated the same four pieces of state (search · status · sort field ·
// direction) plus a filter/sort memo and a per-status count; this hook centralizes it. A
// screen supplies only what is screen-specific: a `scope` (its persistence key), its sort
// fields, how to read an item's status, its status vocabulary, and its search predicate.
// State is read from (and written to) the cookie-backed list-prefs provider, so it survives
// a refresh with no flash. Pairs with <ListRail>, which renders this state.

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
  scope,
  items,
  sortFields,
  statuses,
  statusOf,
  matches,
  defaultSortKey = "status",
  defaultDir = "asc",
}: {
  /** Persistence key — each screen's remembered view is isolated under its scope. */
  scope: string;
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
  const { prefs, setQuery: setQueryPref } = useListPrefs();
  const scoped = prefs.query[scope];
  const query = scoped?.query ?? "";
  const status = scoped?.status ?? "all";
  const sortKey = scoped?.sortKey ?? defaultSortKey;
  const dir = scoped?.dir ?? defaultDir;

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
    setQuery: (value) => setQueryPref(scope, { query: value }),
    status,
    setStatus: (value) => setQueryPref(scope, { status: value }),
    sortKey,
    setSortKey: (key) => setQueryPref(scope, { sortKey: key }),
    dir,
    setDir: (value) => setQueryPref(scope, { dir: value }),
    toggleDir: () => setQueryPref(scope, { dir: dir === "asc" ? "desc" : "asc" }),
    visible,
    counts,
    activeSortLabel:
      sortFields.find((field) => field.key === sortKey)?.label ?? sortFields[0]?.label ?? "",
  };
}
