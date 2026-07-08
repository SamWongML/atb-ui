// Query key factory — the shared vocabulary for the TanStack Query cache. Both the
// tRPC/query hooks and lib/realtime/reconcile.ts key off these, so a streamed update
// lands on the exact cache entry a component renders (ARCHITECTURE.md §Real-time).

export const queryKeys = {
  /** The sessions list. */
  sessions: () => ["sessions"] as const,
  /** One session's detail + streaming transcript — the reconcile() sink target. */
  session: (id: string) => ["session", id] as const,
};

export type SessionQueryKey = ReturnType<typeof queryKeys.session>;
