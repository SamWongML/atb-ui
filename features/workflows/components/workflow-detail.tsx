import { Pencil } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { pipelineOrder, WORKFLOW_STATUS_META, WORKFLOW_TRIGGER_META } from "../presentation";
import type { Workflow } from "../schema";

// The workflow detail view (README.md §Workflows): trigger + its detail, lifecycle status,
// step count, the run stats, and the agents in the pipeline. Read-only; Edit routes to the
// form. Props from the RSC page.

export function WorkflowDetail({ workflow }: { workflow: Workflow }) {
  const status = WORKFLOW_STATUS_META[workflow.status];
  const trigger = WORKFLOW_TRIGGER_META[workflow.trigger];
  const pipeline = pipelineOrder(workflow.nodes, workflow.connections);
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-mono text-2xl font-medium tracking-tight text-text">
              {workflow.name}
            </h1>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
                status.badgeClass,
              )}
            >
              {status.label}
            </span>
          </div>
          <p className="text-[13px] text-text-3">
            {trigger.label} · {workflow.triggerDetail} · {workflow.steps} steps
          </p>
        </div>
        <Link
          href={`/workflows/${workflow.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-2 text-[13px] font-medium text-text transition-colors hover:border-border-2 hover:bg-[var(--nav-hover)]"
        >
          <Pencil className="size-3.5" /> Edit
        </Link>
      </header>

      <p className="text-[13.5px] leading-relaxed text-text-2">{workflow.description}</p>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Runs">{workflow.runs}</Stat>
        <Stat label="Success">{workflow.success}</Stat>
        <Stat label="Cost">{workflow.cost}</Stat>
        <Stat label="Avg time">{workflow.avgTime}</Stat>
        <Stat label="Last run">{workflow.lastRun}</Stat>
      </dl>

      <section className="space-y-2.5">
        <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-4">Pipeline</h2>
        {pipeline.length === 0 ? (
          <p className="text-[12.5px] text-text-3">No agents assigned yet.</p>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5">
            {pipeline.map((node, i) => (
              <span key={node.id} className="flex items-center gap-1.5">
                {i > 0 ? <span className="text-text-4">→</span> : null}
                <span className="grid size-8 place-items-center rounded-lg bg-chip font-mono text-[11px] font-semibold text-text-2">
                  {node.agent}
                </span>
              </span>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-hair bg-panel px-3 py-2.5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-4">{label}</dt>
      <dd className="mt-0.5 text-[13px] font-medium text-text">{children}</dd>
    </div>
  );
}
