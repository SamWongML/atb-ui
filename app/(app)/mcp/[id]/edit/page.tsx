import { McpEditor } from "@/features/mcp/components/mcp-editor";
import { orNotFound } from "@/lib/trpc/not-found";
import { createServerCaller } from "@/server/trpc/caller";

// Edit an MCP server. Routing glue only: the RSC loads the server, then hands it to the
// connected form shell in edit mode. A missing id is a 404.
export default async function EditMcpPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const api = await createServerCaller();
  const server = await orNotFound(api.mcp.get({ id }));
  return <McpEditor server={server} />;
}
