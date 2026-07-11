import { AgentsList } from "@/features/agents/components/agents-list";
import { createServerCaller } from "@/server/trpc/caller";

// Agents roster. Routing glue only: the RSC reads the agent list from the BFF (tRPC) and
// hands it to the client roster component, which renders its rail into the shell header.
export default async function AgentsPage() {
  const api = await createServerCaller();
  return <AgentsList agents={await api.agents.list()} />;
}
