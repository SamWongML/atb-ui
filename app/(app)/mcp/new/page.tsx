import { McpEditor } from "@/features/mcp/components/mcp-editor";

// Connect an MCP server. Routing glue only: renders the connected form shell in create mode.
export default function NewMcpPage() {
  return <McpEditor />;
}
