import { Suspense } from "react";
import { AgentsList } from "@/features/agents/components/agents-list";
import { AgentCardPrototypeGallery } from "@/features/agents/components/card-prototypes/gallery";
import { listAgents } from "@/server/trpc/reads";

// Agents roster. Routing glue only: the RSC reads the agent list from the BFF (tRPC) and hands it
// to the client roster body. Reads through the shared cached reader so this page and its @header
// slot collapse to one BFF call per request (ADR 0002).
//
// PROTOTYPE — temporary: the roster currently renders through the agent-card design gallery,
// which compares six `?variant=` card treatments in place and falls back to the shipping
// <AgentsList> by default and in production (features/agents/components/card-prototypes/).
// When a winner is picked, this page goes back to rendering <AgentsList> directly.
export default async function AgentsPage() {
  const agents = await listAgents();
  return (
    <Suspense fallback={<AgentsList agents={agents} />}>
      <AgentCardPrototypeGallery agents={agents} />
    </Suspense>
  );
}
