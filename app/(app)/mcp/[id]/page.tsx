import { McpDetail } from "@/features/mcp/components/mcp-detail";
import { orNotFound } from "@/lib/trpc/not-found";
import { createServerCaller } from "@/server/trpc/caller";

// MCP server detail. Routing glue only: the RSC reads one server from the BFF and renders
// the read-only detail view. A missing id is a 404.
export default async function McpDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await createServerCaller();
  const server = await orNotFound(api.mcp.get({ id }));
  return <McpDetail server={server} />;
}
