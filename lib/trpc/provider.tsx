"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, useState } from "react";
import superjson from "superjson";
import { makeQueryClient } from "@/lib/query/client";
import { trpc } from "./react";

// Wires the tRPC client + the single Query cache into the React tree. The same
// QueryClient is what reconcile() writes streamed events into (ARCHITECTURE.md). The
// NuqsAdapter lets feature surfaces put filters/tabs in the URL (TECH_STACK.md L4).
export function TRPCProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(makeQueryClient);
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [httpBatchLink({ url: "/api/trpc", transformer: superjson })],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>{children}</NuqsAdapter>
      </QueryClientProvider>
    </trpc.Provider>
  );
}
