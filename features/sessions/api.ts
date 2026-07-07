import { type Session, sessionListSchema } from "./schema";

// The client talks only to the BFF (ARCHITECTURE.md). During Phase 0 that surface
// is faked by the MSW harness; in Phase 1 it becomes tRPC/route handlers, but the
// UI contract — Zod-validated shapes — does not change.
const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "";

/** Fetch the session list and validate it at the boundary before it reaches the UI. */
export async function fetchSessions(): Promise<Session[]> {
  const res = await fetch(`${API_BASE}/api/sessions`);
  if (!res.ok) {
    throw new Error(`Failed to fetch sessions: ${res.status}`);
  }
  return sessionListSchema.parse(await res.json());
}
