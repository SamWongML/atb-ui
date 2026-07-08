import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  type Agent,
  agentInitials,
  agentInputSchema,
  agentListSchema,
  agentSchema,
} from "@/features/agents/schema";
import { agentsStore } from "@/server/services/agents";
import { slugId } from "@/server/services/store-id";
import { protectedProcedure, router } from "../trpc";

// Agents router. Reads validate the seed shape at the BFF boundary (schema.parse) so a
// malformed payload is a caught error, never a silent leak. Writes validate their input
// with the same schema the form uses (agentInputSchema) — one contract, both sides.

function requireAgent(id: string): Agent {
  const agent = agentsStore.get(id);
  if (!agent) throw new TRPCError({ code: "NOT_FOUND", message: `Agent ${id} not found` });
  return agent;
}

/** Server-owned defaults for a newly created agent (avatar, status, empty usage). */
function newAgent(input: (typeof agentInputSchema)["_output"]): Agent {
  const id = slugId(
    input.name,
    agentsStore.list().map((a) => a.id),
  );
  return agentSchema.parse({
    ...input,
    id,
    avatar: agentInitials(input.name),
    status: "idle",
    usage: { tasks: "0 tasks", merged: "—", tokens: "0", cost: "$0.00", avgTime: "—" },
  });
}

export const agentsRouter = router({
  list: protectedProcedure.query(() => agentListSchema.parse(agentsStore.list())),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => agentSchema.parse(requireAgent(input.id))),

  create: protectedProcedure
    .input(agentInputSchema)
    .mutation(({ input }) => agentsStore.create(newAgent(input))),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: agentInputSchema }))
    .mutation(({ input }) => {
      requireAgent(input.id);
      const updated = agentsStore.update(input.id, {
        ...input.data,
        avatar: agentInitials(input.data.name),
      });
      return agentSchema.parse(updated);
    }),
});
