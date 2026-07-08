import { McpList } from "@/features/mcp/components/mcp-list";
import { createServerCaller } from "@/server/trpc/caller";

// MCP servers. Routing glue only: the RSC reads the server list from the BFF (tRPC) and
// hands it to the client list component.
export default async function McpPage() {
  const api = await createServerCaller();
  return <McpList servers={await api.mcp.list()} />;
}
