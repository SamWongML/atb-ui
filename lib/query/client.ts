import { QueryClient } from "@tanstack/react-query";

// The single Query cache the whole app renders from — server data (tRPC) and live
// streams (reconcile) both write here (TECH_STACK.md L4).
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Streams keep data fresh; avoid redundant refetch churn fighting them.
        staleTime: 30_000,
        refetchOnWindowFocus: false,
      },
    },
  });
}
