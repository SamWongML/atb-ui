import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { type Sandbox, sandboxListSchema, sandboxSchema } from "@/features/sandboxes/schema";
import { sandboxesStore } from "@/server/services/sandboxes";
import { protectedProcedure, router } from "../trpc";

// Sandboxes router. Read-only: reads validate the seed shape at the BFF boundary. When the
// compute plane comes online this router's contract is unchanged.

function requireSandbox(id: string): Sandbox {
  const sandbox = sandboxesStore.get(id);
  if (!sandbox) throw new TRPCError({ code: "NOT_FOUND", message: `Sandbox ${id} not found` });
  return sandbox;
}

export const sandboxesRouter = router({
  list: protectedProcedure.query(() => sandboxListSchema.parse(sandboxesStore.list())),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => sandboxSchema.parse(requireSandbox(input.id))),
});
