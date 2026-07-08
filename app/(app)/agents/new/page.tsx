import { AgentEditor } from "@/features/agents/components/agent-editor";

// Create an agent. Routing glue only: renders the connected form shell in create mode.
export default function NewAgentPage() {
  return <AgentEditor />;
}
