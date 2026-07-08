import { AgentEditor } from "@/features/agents/components/agent-editor";
import { orNotFound } from "@/lib/trpc/not-found";
import { createServerCaller } from "@/server/trpc/caller";

// Edit an agent. Routing glue only: the RSC loads the agent, then hands it to the
// connected form shell in edit mode. A missing id is a 404.
export default async function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await createServerCaller();
  const agent = await orNotFound(api.agents.get({ id }));
  return <AgentEditor agent={agent} />;
}
