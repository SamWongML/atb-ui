"use client";

import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { cn } from "@/lib/utils";
import { filterRuns, RUN_FILTER_VALUES, RUN_FILTERS } from "../filter";
import { RUN_STATUS_META } from "../presentation";
import type { Run } from "../schema";

// The runs surface: a flat, newest-first execution history narrowed by a
// status filter tab. The active filter lives in the URL (nuqs) so a filtered view is
// shareable and reload-correct. Data arrives as a prop; the RSC page reads it via tRPC.

export function RunsList({ runs }: { runs: readonly Run[] }) {
  const [filter, setFilter] = useQueryState(
    "filter",
    parseAsStringLiteral(RUN_FILTER_VALUES).withDefault("all"),
  );
  const failures = runs.filter((run) => run.status === "failed").length;
  const visible = filterRuns([...runs], filter);

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-5">
      <header>
        <h1 className="font-serif text-2xl font-medium tracking-tight text-text">Runs</h1>
        <p className="text-[13px] text-text-3">
          {runs.length} runs · {failures} failed
        </p>
      </header>

      <div role="tablist" aria-label="Filter runs" className="flex flex-wrap gap-1.5">
        {RUN_FILTERS.map((tab) => {
          const selected = tab.value === filter;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => void setFilter(tab.value)}
              className={cn(
                "rounded-full border px-3 py-1 text-[12.5px] font-medium transition-colors",
                selected
                  ? "border-primary-soft-bd bg-primary-soft text-primary"
                  : "border-border bg-panel text-text-3 hover:border-border-2 hover:text-text-2",
              )}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-hair bg-panel px-4 py-10 text-center text-[13px] text-text-3">
          No runs in this view.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {visible.map((run) => (
            <RunRow key={run.id} run={run} />
          ))}
        </div>
      )}
    </div>
  );
}

function RunRow({ run }: { run: Run }) {
  const meta = RUN_STATUS_META[run.status];
  return (
    <Link
      href={`/runs/${run.id}`}
      className="flex items-center gap-3 rounded-lg border border-hair bg-panel px-3.5 py-3 transition-colors hover:border-border-2 hover:bg-panel-2"
    >
      <span
        className={cn(
          "shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
          meta.badgeClass,
        )}
      >
        {meta.label}
      </span>
      <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-text">
        {run.source}
      </span>
      <span className="hidden font-mono text-[11px] text-text-3 sm:inline">{run.model}</span>
      <span className="font-mono text-[11px] text-text-3">{run.cost}</span>
      <span className="hidden font-mono text-[11px] text-text-4 sm:inline">{run.startedAt}</span>
    </Link>
  );
}
