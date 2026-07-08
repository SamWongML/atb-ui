import { z } from "zod";

// One Zod schema per shape, shared by the client and the BFF router (CONTEXT.md).
// It validates the downstream/seed payload at the BFF boundary and types the form.

/** An agent's capability permission for a class of action (CONTEXT.md: allow/ask/deny). */
export const AGENT_PERMISSIONS = ["allow", "ask", "deny"] as const;
export const agentPermissionSchema = z.enum(AGENT_PERMISSIONS);
export type AgentPermission = z.infer<typeof agentPermissionSchema>;

/** The three permission classes an agent is granted (README.md §Agents). */
export const agentPermissionsSchema = z.object({
  edit: agentPermissionSchema,
  bash: agentPermissionSchema,
  network: agentPermissionSchema,
});
export type AgentPermissions = z.infer<typeof agentPermissionsSchema>;

/** Models an agent can run on (TECH_STACK: default to the latest Claude models). */
export const AGENT_MODELS = ["Opus 4.8", "Sonnet 4.5", "Haiku 4.5"] as const;
export const agentModelSchema = z.enum(AGENT_MODELS);
export type AgentModel = z.infer<typeof agentModelSchema>;

/** Live work state; `working` pulses in the UI. */
export const AGENT_STATUSES = ["working", "idle"] as const;
export const agentStatusSchema = z.enum(AGENT_STATUSES);
export type AgentStatus = z.infer<typeof agentStatusSchema>;

/** Read-only usage rollup shown on the detail view (pre-formatted for display). */
export const agentUsageSchema = z.object({
  tasks: z.string(),
  merged: z.string(),
  tokens: z.string(),
  cost: z.string(),
  avgTime: z.string(),
});
export type AgentUsage = z.infer<typeof agentUsageSchema>;

export const agentSchema = z.object({
  id: z.string(),
  /** Two-letter avatar initials, derived from the name for created agents. */
  avatar: z.string(),
  name: z.string(),
  role: z.string(),
  model: agentModelSchema,
  status: agentStatusSchema,
  description: z.string(),
  systemPrompt: z.string(),
  permissions: agentPermissionsSchema,
  skills: z.array(z.string()),
  mcps: z.array(z.string()),
  usage: agentUsageSchema,
});
export type Agent = z.infer<typeof agentSchema>;

export const agentListSchema = z.array(agentSchema);

/** The user-editable subset — the create/edit form contract (React Hook Form + Zod). */
export const agentInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  model: agentModelSchema,
  description: z.string().min(1, "Description is required"),
  systemPrompt: z.string().min(1, "A system prompt is required"),
  permissions: agentPermissionsSchema,
  /** Attached skill ids and MCP server names (CONTEXT.md: an agent's skills/MCPs). */
  skills: z.array(z.string()),
  mcps: z.array(z.string()),
});
export type AgentInput = z.infer<typeof agentInputSchema>;

/** Project a full agent onto the editable form contract (edit-mode default values). */
export function agentToInput(agent: Agent): AgentInput {
  return {
    name: agent.name,
    role: agent.role,
    model: agent.model,
    description: agent.description,
    systemPrompt: agent.systemPrompt,
    permissions: agent.permissions,
    skills: agent.skills,
    mcps: agent.mcps,
  };
}

/**
 * Two-letter initials for an agent avatar — first two letters of a single word, or the
 * first letter of the first and last word. Pure so the form preview and the created
 * record agree on the same value.
 */
export function agentInitials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean);
  const first = words[0] ?? "";
  if (!first) return "?";
  const letters =
    words.length === 1
      ? first.slice(0, 2)
      : `${first.charAt(0)}${(words[words.length - 1] ?? "").charAt(0)}`;
  return letters.toUpperCase();
}
