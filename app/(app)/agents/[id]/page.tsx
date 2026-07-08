import { AgentDetail } from "@/features/agents/components/agent-detail";
import { orNotFound } from "@/lib/trpc/not-found";
import { createServerCaller } from "@/server/trpc/caller";

// Agent detail. Routing glue only: the RSC reads one agent from the BFF and renders the
// read-only detail view. A missing id is a 404, not a thrown error.
export default async function AgentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await createServerCaller();
  const agent = await orNotFound(api.agents.get({ id }));
  return <AgentDetail agent={agent} />;
}
