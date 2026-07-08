import { getSessionFromRequest } from "@/server/auth/service";
import type { Session } from "@/server/auth/session";

// tRPC request context — the per-call BFF state. Holds the verified session so
// procedures can gate on auth (ARCHITECTURE.md §Security).
export type Context = {
  session: Session | null;
};

export async function createContext(opts: { req: Request }): Promise<Context> {
  return { session: await getSessionFromRequest(opts.req) };
}
