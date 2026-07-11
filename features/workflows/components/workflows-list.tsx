"use client";

import Link from "next/link";
import { ListRail } from "@/components/list-rail";
import { PageHeader } from "@/components/page-chrome";
import { Surface } from "@/components/surface";
import { leadingNumber, type SortField } from "@/lib/list-query";
import { useListQuery } from "@/lib/use-list-query";
import { cn } from "@/lib/utils";
import { WORKFLOW_STATUS_META, WORKFLOW_TRIGGER_META } from "../presentation";
import { WORKFLOW_STATUSES, type Workflow } from "../schema";

// The workflows list (README.md §Workflows, ADR 0001): a grid of multi-agent pipelines,
// each card showing its trigger, lifecycle status, step count and run tally. Chrome is
// the shared <ListRail> (search · status tabs · sort · New) in the shell header; state
// is the shared useListQuery. Data arrives as a prop from the RSC.

const SORT_FIELDS: SortField<Workflow>[] = [
  { key: "name", label: "Name", value: (workflow) => workflow.name.toLowerCase() },
  {
    key: "status",
    label: "Status",
    value: (workflow) => WORKFLOW_STATUSES.indexOf(workflow.status),
  },
  { key: "steps", label: "Steps", value: (workflow) => workflow.steps },
  { key: "runs", label: "Runs", value: (workflow) => leadingNumber(workflow.runs) },
];

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  ...WORKFLOW_STATUSES.map((status) => ({
    value: status,
    label: WORKFLOW_STATUS_META[status].label,
  })),
];

export function WorkflowsList({ workflows }: { workflows: readonly Workflow[] }) {
  const query = useListQuery({
    items: workflows,
    sortFields: SORT_FIELDS,
    statuses: WORKFLOW_STATUSES,
    statusOf: (workflow) => workflow.status,
    matches: (workflow, q) =>
      workflow.name.toLowerCase().includes(q) || workflow.description.toLowerCase().includes(q),
  });

  return (
    <>
      <PageHeader>
        <ListRail
          count={workflows.length}
          filter={{
            options: STATUS_FILTERS,
            value: query.status,
            onChange: query.setStatus,
            counts: query.counts,
            ariaLabel: "Filter by status",
          }}
          sort={{
            fields: SORT_FIELDS,
            value: query.sortKey,
            onChange: query.setSortKey,
            dir: query.dir,
            onToggleDir: query.toggleDir,
          }}
          search={{
            value: query.query,
            onChange: query.setQuery,
            placeholder: "Search workflows…",
          }}
          newButton={{ href: "/workflows/new", label: "New workflow" }}
        />
      </PageHeader>

      <Surface className="gap-4">
        {workflows.length === 0 ? (
          <EmptyState message="No workflows yet. Create one to get started." />
        ) : query.visible.length === 0 ? (
          <EmptyState message="No workflows match this view." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {query.visible.map((workflow) => (
              <WorkflowCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        )}
      </Surface>
    </>
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

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-hair bg-panel px-4 py-10 text-center text-[13px] text-text-3">
      {message}
    </p>
  );
}
