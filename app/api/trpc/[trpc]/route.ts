import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { createContext } from "@/server/trpc/context";
import { appRouter } from "@/server/trpc/routers/_app";

// The tRPC BFF endpoint (FOLDER_STRUCTURE.md). One handler serves GET (queries) and
// POST (mutations); context carries the verified session.
function handler(req: Request): Promise<Response> {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req,
    router: appRouter,
    createContext: () => createContext({ req }),
  });
}

export { handler as GET, handler as POST };
