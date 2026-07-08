"use client";

import { skipToken, useQuery } from "@tanstack/react-query";
import type { SessionCanvas } from "@/features/sessions/canvas";
import { queryKeys } from "@/lib/query/keys";

// Subscribe a component to a session's live canvas cache entry. The RSC seeds the initial
// snapshot (initialData); the SSE stream — opened by useSessionStream — feeds canvas
// frames through reconcile() into this same entry, so the four views grow as the run
// proceeds. The hook only reads the cache (skipToken → no fetch, reconcile is the writer);
// components never touch the socket (ARCHITECTURE.md §Real-time).
export function useSessionCanvas(sessionId: string, initialCanvas: SessionCanvas): SessionCanvas {
  const { data } = useQuery<SessionCanvas>({
    queryKey: queryKeys.sessionCanvas(sessionId),
    queryFn: skipToken,
    initialData: initialCanvas,
  });
  // initialData guarantees a value at runtime; the skipToken overload still widens to
  // `| undefined`, so fall back to the seed to keep the return non-nullable.
  return data ?? initialCanvas;
}
