import { AgentsRail } from "@/features/agents/components/agents-rail";
import { listAgents } from "@/server/trpc/reads";

// The Agents rail, server-rendered into the shell @header slot so a hard refresh paints the full
// rail on the first frame — no breadcrumb-to-rail flash (ADR 0002). Routing glue only; the agent
// list comes from the BFF, deduped with the page's read via React cache().
export default async function AgentsHeader() {
  return <AgentsRail agents={await listAgents()} />;
}
