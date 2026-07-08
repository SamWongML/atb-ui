import { getServerSession } from "@/server/auth/server";
import type { Session } from "@/server/auth/session";
import { appRouter } from "./routers/_app";

// In-process tRPC caller for React Server Components. RSC pages read the BFF through the
// same typed router the client uses (ARCHITECTURE.md: "the BFF is the stable contract the
// UI is written against") — a direct call, no HTTP — so there's one validated data path,
// not a service-layer bypass.
export function serverCaller(session: Session | null) {
  return appRouter.createCaller({ session });
}

/** A caller carrying the current request's session (from the cookie). */
export async function createServerCaller() {
  return serverCaller(await getServerSession());
}
