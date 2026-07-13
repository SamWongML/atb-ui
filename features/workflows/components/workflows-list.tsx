"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Surface } from "@/components/surface";
import { useListQuery } from "@/lib/use-list-query";
import { cn } from "@/lib/utils";
import { WORKFLOWS_LIST_QUERY } from "../list-config";
import { WORKFLOW_STATUS_META, WORKFLOW_TRIGGER_META } from "../presentation";
import type { Workflow } from "../schema";

// The workflows list body (README.md §Workflows, ADR 0002): a grid of multi-agent pipelines,
// each card showing its trigger, lifecycle status, step count and run tally. The rail (search ·
// status tabs · sort · New) is server-rendered into the shell @header slot; state is the shared
// useListQuery. Data arrives as a prop from the RSC.

export function WorkflowsList({ workflows }: { workflows: readonly Workflow[] }) {
  const query = useListQuery({ items: workflows, ...WORKFLOWS_LIST_QUERY });

  return (
    <Surface className="gap-4">
      {workflows.length === 0 ? (
        <EmptyState title="No workflows yet." description="Create one to get started." />
      ) : query.visible.length === 0 ? (
        <EmptyState title="No workflows match this view." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {query.visible.map((workflow) => (
            <WorkflowCard key={workflow.id} workflow={workflow} />
          ))}
        </div>
      )}
    </Surface>
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
