import { cache } from "react";
import { createServerCaller } from "./caller";

// Cached server reads for the build-list routes. Each list route renders two server components on
// one request — the page (the roster body) and its @header slot (the rail) — and both need the same
// list. React cache() memoizes the read for the render pass, so they collapse to a single BFF call
// instead of fetching twice. (ADR 0002.)
export const listAgents = cache(async () => (await createServerCaller()).agents.list());
export const listWorkflows = cache(async () => (await createServerCaller()).workflows.list());
export const listSquads = cache(async () => (await createServerCaller()).squads.list());
export const listSkills = cache(async () => (await createServerCaller()).skills.list());
export const listMcpServers = cache(async () => (await createServerCaller()).mcp.list());
