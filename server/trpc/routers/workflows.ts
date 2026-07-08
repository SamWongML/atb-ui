import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  type Workflow,
  type WorkflowInput,
  workflowInputSchema,
  workflowListSchema,
  workflowSchema,
} from "@/features/workflows/schema";
import { slugId } from "@/server/services/store-id";
import { workflowsStore } from "@/server/services/workflows";
import { protectedProcedure, router } from "../trpc";

// Workflows router. Reads validate the seed shape at the BFF boundary; writes validate
// their input with the form's schema. A new workflow starts as a draft with an empty run
// history until it is first launched.

function requireWorkflow(id: string): Workflow {
  const workflow = workflowsStore.get(id);
  if (!workflow) throw new TRPCError({ code: "NOT_FOUND", message: `Workflow ${id} not found` });
  return workflow;
}

function newWorkflow(input: WorkflowInput): Workflow {
  const id = slugId(
    input.name,
    workflowsStore.list().map((w) => w.id),
  );
  return workflowSchema.parse({
    ...input,
    id,
    status: "draft",
    runs: "—",
    success: "—",
    cost: "—",
    avgTime: "—",
    lastRun: "never",
    nodes: [],
    connections: [],
  });
}

export const workflowsRouter = router({
  list: protectedProcedure.query(() => workflowListSchema.parse(workflowsStore.list())),

  get: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => workflowSchema.parse(requireWorkflow(input.id))),

  create: protectedProcedure
    .input(workflowInputSchema)
    .mutation(({ input }) => workflowsStore.create(newWorkflow(input))),

  update: protectedProcedure
    .input(z.object({ id: z.string(), data: workflowInputSchema }))
    .mutation(({ input }) => {
      requireWorkflow(input.id);
      return workflowSchema.parse(workflowsStore.update(input.id, input.data));
    }),
});
