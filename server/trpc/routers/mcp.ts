import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  type McpInput,
  type McpServer,
  mcpInputSchema,
  mcpServerListSchema,
  mcpServerSchema,
} from "@/features/mcp/schema";
import { mcpStore } from "@/server/services/mcp";
import { slugId } from "@/server/services/store-id";
import { protectedProcedure, router } from "../trpc";

// MCP servers router. Reads validate the seed shape at the BFF boundary; writes validate
// their input with the same schema the form uses. A newly connected server starts healthy
// with an empty tool/secret roster until the registry reports otherwise.

function requireServer(id: string): McpServer {
  const server = mcpStore.get(id);
  if (!server) throw new TRPCError({ code: "NOT_FOUND", message: `MCP server ${id} not found` });
  return server;
}

// toolCount is a projection of the tool roster, not independent data — derive it at the BFF
// boundary so the count can never drift from the tools the server actually exposes.
function present(server: McpServer): McpServer {
  return { ...server, toolCount: server.tools.length };
}

function newServer(input: McpInput): McpServer {
  const id = slugId(
    input.name,
    mcpStore.list().map((m) => m.id),
  );
  return mcpServerSchema.parse({
    ...input,
    id,
    status: "healthy",
    latency: "—",
    toolCount: 0,
    tools: [],
    secrets: [],
    usedBy: [],
  });
}

export const mcpRouter = router({
  list: protectedProcedure.query(() => mcpServerListSchema.parse(mcpStore.list().map(present))),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => mcpServerSchema.parse(present(requireServer(input.id)))),

  create: protectedProcedure
    .input(mcpInputSchema)
    .mutation(({ input }) => present(mcpStore.create(newServer(input)))),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: mcpInputSchema }))
    .mutation(({ input }) => {
      requireServer(input.id);
      const updated = mcpStore.update(input.id, input.data);
      return mcpServerSchema.parse(updated && present(updated));
    }),
});
