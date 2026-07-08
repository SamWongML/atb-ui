import { z } from "zod";

// One Zod schema per shape, shared by the client and the BFF router (CONTEXT.md).

/** How the BFF talks to the tool server. */
export const MCP_TRANSPORTS = ["http", "stdio"] as const;
export const mcpTransportSchema = z.enum(MCP_TRANSPORTS);
export type McpTransport = z.infer<typeof mcpTransportSchema>;

/** Health state (CONTEXT.md: healthy=green · degraded=amber; degraded pulses). */
export const MCP_STATUSES = ["healthy", "degraded"] as const;
export const mcpStatusSchema = z.enum(MCP_STATUSES);
export type McpStatus = z.infer<typeof mcpStatusSchema>;

export const mcpServerSchema = z.object({
  id: z.string(),
  name: z.string(),
  transport: mcpTransportSchema,
  status: mcpStatusSchema,
  /** Round-trip latency, pre-formatted for display (e.g. "86ms"). */
  latency: z.string(),
  /** Number of tools the server exposes. */
  toolCount: z.number().int().nonnegative(),
  auth: z.string(),
  description: z.string(),
  /** The exposed tool names. */
  tools: z.array(z.string()),
  /** Secret/env-var names the server needs (values never leave the BFF). */
  secrets: z.array(z.string()),
  /** Agent names that use this server. */
  usedBy: z.array(z.string()),
});
export type McpServer = z.infer<typeof mcpServerSchema>;

export const mcpServerListSchema = z.array(mcpServerSchema);

/** The user-editable subset — the connect/edit form contract. */
export const mcpInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  transport: mcpTransportSchema,
  auth: z.string().min(1, "Auth is required"),
  description: z.string().min(1, "Description is required"),
});
export type McpInput = z.infer<typeof mcpInputSchema>;

/** Project a full server onto the editable form contract (edit-mode default values). */
export function mcpToInput(server: McpServer): McpInput {
  return {
    name: server.name,
    transport: server.transport,
    auth: server.auth,
    description: server.description,
  };
}
