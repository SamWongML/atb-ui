import { Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { WORKFLOW_STATUS_META, WORKFLOW_TRIGGER_META } from "../presentation";
import type { Workflow } from "../schema";

// The workflows list (README.md §Workflows): a grid of multi-agent pipelines, each card
// showing its trigger, lifecycle status, step count and the agents in the pipeline. Fed by
// the RSC page through tRPC; a header action opens the create form.

export function WorkflowsList({ workflows }: { workflows: readonly Workflow[] }) {
  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-text">Workflows</h1>
          <p className="text-[13px] text-text-3">Multi-agent pipelines.</p>
        </div>
        <Link
          href="/workflows/new"
          className="inline-flex items-center gap-1.5 rounded-md border border-primary-soft-bd bg-primary-soft px-3 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary-bg"
        >
          <Plus className="size-4" /> New workflow
        </Link>
      </header>

      {workflows.length === 0 ? (
        <p className="rounded-xl border border-hair bg-panel px-4 py-10 text-center text-[13px] text-text-3">
          No workflows yet. Create one to get started.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {workflows.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      )}
    </div>
  );
}

function WorkflowCard({ workflow }: { workflow: Workflow }) {
  const status = WORKFLOW_STATUS_META[workflow.status];
  const trigger = WORKFLOW_TRIGGER_META[workflow.trigger];
  return (
    <Link
      href={`/workflows/${workflow.id}`}
      className="flex flex-col gap-3 rounded-xl border border-hair bg-panel p-4 transition-colors hover:border-border-2 hover:bg-panel-2"
    >
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] font-medium text-text">
          {workflow.name}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
            status.badgeClass,
          )}
        >
          {status.label}
        </span>
      </div>
      <p className="line-clamp-2 text-[12.5px] leading-relaxed text-text-2">
        {workflow.description}
      </p>
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.1em] text-text-4">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 tracking-[0.08em] normal-case",
            trigger.badgeClass,
          )}
        >
          {trigger.label}
        </span>
        <span>{workflow.steps} steps</span>
        <span className="ml-auto">{workflow.runs} runs</span>
      </div>
    </Link>
  );
}
