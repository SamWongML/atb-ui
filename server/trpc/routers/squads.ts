import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  type Squad,
  type SquadInput,
  squadInputSchema,
  squadListSchema,
  squadSchema,
} from "@/features/squads/schema";
import { squadsStore } from "@/server/services/squads";
import { slugId } from "@/server/services/store-id";
import { protectedProcedure, router } from "../trpc";

// Squads router. Reads validate the seed shape at the BFF boundary; writes validate their
// input with the form's schema. A new squad starts idle with the lead + members from the form
// and an empty run history until it is first launched.

function requireSquad(id: string): Squad {
  const squad = squadsStore.get(id);
  if (!squad) throw new TRPCError({ code: "NOT_FOUND", message: `Squad ${id} not found` });
  return squad;
}

function newSquad(input: SquadInput): Squad {
  const id = slugId(
    input.name,
    squadsStore.list().map((s) => s.id),
  );
  return squadSchema.parse({
    ...input,
    id,
    status: "idle",
    stepsDone: 0,
    description: "",
    runs: "—",
    merged: "—",
    tokens: "0",
    cost: "$0.00",
    avgTime: "—",
    schedule: "On demand",
    lastRun: "never",
    recentRuns: [],
  });
}

export const squadsRouter = router({
  list: protectedProcedure.query(() => squadListSchema.parse(squadsStore.list())),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => squadSchema.parse(requireSquad(input.id))),

  create: protectedProcedure
    .input(squadInputSchema)
    .mutation(({ input }) => squadsStore.create(newSquad(input))),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: squadInputSchema }))
    .mutation(({ input }) => {
      requireSquad(input.id);
      return squadSchema.parse(squadsStore.update(input.id, input.data));
    }),
});
