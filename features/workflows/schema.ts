import { z } from "zod";

// One Zod schema per shape, shared by the client and the BFF router (CONTEXT.md).

/** What launches a workflow run. */
export const WORKFLOW_TRIGGERS = ["manual", "schedule", "pr"] as const;
export const workflowTriggerSchema = z.enum(WORKFLOW_TRIGGERS);
export type WorkflowTrigger = z.infer<typeof workflowTriggerSchema>;

/** Lifecycle: active, paused (schedule held), draft (unpublished). */
export const WORKFLOW_STATUSES = ["active", "paused", "draft"] as const;
export const workflowStatusSchema = z.enum(WORKFLOW_STATUSES);
export type WorkflowStatus = z.infer<typeof workflowStatusSchema>;

/** One pipeline stage, bound to the agent (2-letter mono) that runs it. */
export const workflowNodeSchema = z.object({
  id: z.string(),
  agent: z.string(),
});
export type WorkflowNode = z.infer<typeof workflowNodeSchema>;

/** A directed edge between two node ids — the pipeline's connections. */
export const workflowConnectionSchema = z.object({
  from: z.string(),
  to: z.string(),
});
export type WorkflowConnection = z.infer<typeof workflowConnectionSchema>;

export const workflowSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  trigger: workflowTriggerSchema,
  /** Human detail for the trigger (cron string, PR glob, …). */
  triggerDetail: z.string(),
  status: workflowStatusSchema,
  /** Number of pipeline steps. */
  steps: z.number().int().positive(),
  runs: z.string(),
  success: z.string(),
  cost: z.string(),
  avgTime: z.string(),
  lastRun: z.string(),
  /** The pipeline: agent-bound stages and the connections between them (CONTEXT.md). */
  nodes: z.array(workflowNodeSchema),
  connections: z.array(workflowConnectionSchema),
});
export type Workflow = z.infer<typeof workflowSchema>;

export const workflowListSchema = z.array(workflowSchema);

/** The user-editable subset — the create/edit form contract. */
export const workflowInputSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  trigger: workflowTriggerSchema,
  // Plain string (empty allowed) rather than .default("") — a default makes the schema's
  // input and output types diverge, which trips React Hook Form's generic inference.
  triggerDetail: z.string(),
  steps: z.number().int().positive("At least one step is required"),
});
export type WorkflowInput = z.infer<typeof workflowInputSchema>;

/** Project a full workflow onto the editable form contract (edit-mode default values). */
export function workflowToInput(workflow: Workflow): WorkflowInput {
  return {
    name: workflow.name,
    description: workflow.description,
    trigger: workflow.trigger,
    triggerDetail: workflow.triggerDetail,
    steps: workflow.steps,
  };
}
