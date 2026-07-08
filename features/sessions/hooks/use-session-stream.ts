"use client";

import { skipToken, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import type { SessionDetail } from "@/features/sessions/realtime";
import { queryKeys } from "@/lib/query/keys";
import { reconcile } from "@/lib/realtime/reconcile";
import { openSessionStream } from "@/lib/realtime/sse";

// Subscribe a component to a session's live cache entry. The SSE stream feeds every
// frame through reconcile() into the cache; this hook just reads that entry (skipToken
// → no fetch, the stream is the only writer) and re-renders as it grows. Components
// never touch the socket (ARCHITECTURE.md §Real-time).
export function useSessionStream(sessionId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const controller = new AbortController();
    openSessionStream({
      sessionId,
      signal: controller.signal,
      onEvent: (event) => reconcile(queryClient, event),
    });
    return () => controller.abort();
  }, [sessionId, queryClient]);

  return useQuery<SessionDetail>({
    queryKey: queryKeys.session(sessionId),
    queryFn: skipToken,
  });
}
