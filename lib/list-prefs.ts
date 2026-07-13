import type { SortDir } from "@/lib/list-query";

// The per-screen toolbar preferences behind every BUILD list (Agents, Workflows, Squads,
// Skills, MCP) — search · status filter · sort field/direction, and the Display options
// (layout · density · full width · grouping · visible fields), keyed by screen `scope`.
//
// These live in a COOKIE, not localStorage, for one reason: the server can read a cookie.
// The RSC parses it and renders the saved view on the first paint, so a hard refresh shows
// the right layout immediately instead of flashing defaults. Still personal, per-browser,
// and never in the URL — the same "remember it locally" intent, made SSR-correct.
//
// This module is framework-free (no "use client") so both the server layout and the client
// provider can import it. serialize/parse are exact inverses and include URL-encoding, so
// the output is a valid cookie value and a malformed value degrades to empty, never throws.

export type ListLayout = "grid" | "list";
export type ListDensity = "comfortable" | "compact";

/** The query-toolbar dimensions (search · status filter · sort field · direction). */
export type QueryPrefs = {
  query: string;
  status: string;
  sortKey: string;
  dir: SortDir;
};

/** The Display-popover dimensions (layout · density · full width · grouping · fields). */
export type DisplayPrefs = {
  layout: ListLayout;
  density: ListDensity;
  fullWidth: boolean;
  grouped: boolean;
  /** Visibility per property key; absent keys fall back to visible. */
  visible: Record<string, boolean>;
};

/** All screens' prefs, each scope carrying only the dimensions it has changed. */
export type ListPrefs = {
  query: Record<string, Partial<QueryPrefs>>;
  display: Record<string, Partial<DisplayPrefs>>;
};

export const LIST_PREFS_COOKIE = "atb_list_prefs";
export const EMPTY_LIST_PREFS: ListPrefs = { query: {}, display: {} };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** Encode prefs into a cookie-safe value (URL-encoded JSON). Inverse of `parseListPrefs`. */
export function serializeListPrefs(prefs: ListPrefs): string {
  return encodeURIComponent(JSON.stringify(prefs));
}

/**
 * Decode the cookie value back into prefs. Untrusted input from a boundary: any malformed
 * value (bad JSON, bad percent-encoding, wrong shape) degrades to empty prefs rather than
 * throwing, so a corrupt cookie can never break the server render.
 */
export function parseListPrefs(raw: string | undefined): ListPrefs {
  if (!raw) return { query: {}, display: {} };
  try {
    const parsed: unknown = JSON.parse(decodeURIComponent(raw));
    if (!isRecord(parsed)) return { query: {}, display: {} };
    return {
      query: isRecord(parsed.query) ? (parsed.query as ListPrefs["query"]) : {},
      display: isRecord(parsed.display) ? (parsed.display as ListPrefs["display"]) : {},
    };
  } catch {
    return { query: {}, display: {} };
  }
}
