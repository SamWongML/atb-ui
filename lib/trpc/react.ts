import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@/server/trpc/routers/_app";

// The typed React Query hooks for the BFF — zero codegen, no client/server drift
// (TECH_STACK.md L3). `trpc.sessions.list.useQuery()` etc.
export const trpc = createTRPCReact<AppRouter>();
