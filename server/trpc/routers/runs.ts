import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { type Run, runListSchema, runSchema } from "@/features/runs/schema";
import { runsStore } from "@/server/services/runs";
import { protectedProcedure, router } from "../trpc";

// Runs router. Read-only execution history: reads validate the seed shape at the BFF
// boundary. When the orchestration engine comes online this router's contract is unchanged.

function requireRun(id: string): Run {
  const run = runsStore.get(id);
  if (!run) throw new TRPCError({ code: "NOT_FOUND", message: `Run ${id} not found` });
  return run;
}

export const runsRouter = router({
  list: protectedProcedure.query(() => runListSchema.parse(runsStore.list())),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => runSchema.parse(requireRun(input.id))),
});
