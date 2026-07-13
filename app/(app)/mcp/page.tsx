import { McpList } from "@/features/mcp/components/mcp-list";
import { listMcpServers } from "@/server/trpc/reads";

// MCP servers. Routing glue only: the RSC reads the server list from the BFF (tRPC) and hands it to
// the client list component. Reads through the shared cached reader so this page and its @header
// slot collapse to one BFF call per request (ADR 0002).
export default async function McpPage() {
  return <McpList servers={await listMcpServers()} />;
}
