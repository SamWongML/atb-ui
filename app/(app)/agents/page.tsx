import { AgentsList } from "@/features/agents/components/agents-list";
import { listAgents } from "@/server/trpc/reads";

// Agents roster. Routing glue only: the RSC reads the agent list from the BFF (tRPC) and hands it
// to the client roster body. Reads through the shared cached reader so this page and its @header
// slot collapse to one BFF call per request (ADR 0002).
export default async function AgentsPage() {
  return <AgentsList agents={await listAgents()} />;
}
