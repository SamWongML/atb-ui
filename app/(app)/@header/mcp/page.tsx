import { McpRail } from "@/features/mcp/components/mcp-rail";
import { listMcpServers } from "@/server/trpc/reads";

// The MCP servers rail, server-rendered into the shell @header slot so a hard refresh paints the
// full rail on the first frame (ADR 0002). Routing glue only; data from the BFF, deduped via cache().
export default async function McpHeader() {
  return <McpRail servers={await listMcpServers()} />;
}
