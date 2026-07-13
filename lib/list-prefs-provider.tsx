"use client";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  type DisplayPrefs,
  LIST_PREFS_COOKIE,
  type ListPrefs,
  type QueryPrefs,
  serializeListPrefs,
} from "@/lib/list-prefs";

// Holds the list-screen toolbar prefs for the session and mirrors every change to the
// cookie the server reads on the next render. Seeded from that same cookie (via `initial`,
// parsed in the RSC (app) layout), so the server render and the first client render agree —
// the saved view paints immediately on a hard refresh, with no flash of defaults. It lives
// in the persistent (app) layout, so the view also survives client navigations between
// list screens. This is the whole persistence mechanism; there is no other store.

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

type ListPrefsContextValue = {
  prefs: ListPrefs;
  setQuery: (scope: string, patch: Partial<QueryPrefs>) => void;
  setDisplay: (scope: string, patch: Partial<DisplayPrefs>) => void;
};

const ListPrefsContext = createContext<ListPrefsContextValue | null>(null);

function persist(prefs: ListPrefs): void {
  const secure = window.location.protocol === "https:" ? "; secure" : "";
  // biome-ignore lint/suspicious/noDocumentCookie: document.cookie is the sync, SSR-readable, jsdom-supported API; the Cookie Store API is async and unavailable in tests.
  document.cookie = `${LIST_PREFS_COOKIE}=${serializeListPrefs(prefs)}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax${secure}`;
}

export function ListPrefsProvider({
  initial,
  children,
}: {
  initial: ListPrefs;
  children: ReactNode;
}) {
  const [prefs, setPrefs] = useState(initial);

  // Mirror the live prefs to the cookie so the next server render seeds this same view.
  useEffect(() => {
    persist(prefs);
  }, [prefs]);

  const setQuery = useCallback((scope: string, patch: Partial<QueryPrefs>) => {
    setPrefs((prev) => ({
      ...prev,
      query: { ...prev.query, [scope]: { ...prev.query[scope], ...patch } },
    }));
  }, []);

  const setDisplay = useCallback((scope: string, patch: Partial<DisplayPrefs>) => {
    setPrefs((prev) => ({
      ...prev,
      display: { ...prev.display, [scope]: { ...prev.display[scope], ...patch } },
    }));
  }, []);

  const value = useMemo<ListPrefsContextValue>(
    () => ({ prefs, setQuery, setDisplay }),
    [prefs, setQuery, setDisplay],
  );

  return <ListPrefsContext.Provider value={value}>{children}</ListPrefsContext.Provider>;
}

export function useListPrefs(): ListPrefsContextValue {
  const value = useContext(ListPrefsContext);
  if (!value) throw new Error("useListPrefs must be used within <ListPrefsProvider>");
  return value;
}
