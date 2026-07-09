import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RUN_STATUS_META } from "../presentation";
import type { Run } from "../schema";

// The run detail view: a run's provenance, timing, cost, step progress and,
// when it failed, its root cause surfaced in red. Read-only; runs are history. Props from the
// RSC page.

export function RunDetail({ run }: { run: Run }) {
  const status = RUN_STATUS_META[run.status];
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-mono text-2xl font-medium tracking-tight text-text">{run.source}</h1>
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
          {run.model} · started {run.startedAt} · {run.duration}
        </p>
      </header>

      {run.rootCause ? (
        <section className="space-y-1.5 rounded-xl border border-red-bg bg-red-bg px-4 py-3">
          <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-red">Root cause</h2>
          <p className="text-[13px] leading-relaxed text-text">{run.rootCause}</p>
        </section>
      ) : null}

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Cost">{run.cost}</Stat>
        <Stat label="Duration">{run.duration}</Stat>
        <Stat label="Steps">
          {run.steps.completed}/{run.steps.total}
        </Stat>
        <Stat label="Model">
          <span className="break-all font-mono text-[12px]">{run.model}</span>
        </Stat>
      </dl>
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
