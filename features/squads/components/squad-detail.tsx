import { Pencil } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { RUN_OUTCOME_META, SQUAD_STATUS_META } from "../presentation";
import type { Squad } from "../schema";

// The squad detail view (README.md §Squads): mission + target repo, the roster (lead marked,
// then members), phase progress, the usage stats, and the recent runs with outcome dots.
// Read-only; Edit routes to the form. Props from the RSC page.

export function SquadDetail({ squad }: { squad: Squad }) {
  const status = SQUAD_STATUS_META[squad.status];
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex items-start gap-3">
        <span
          role="img"
          aria-label={status.label}
          className={cn(
            "mt-2 size-2.5 shrink-0 rounded-full",
            status.dotClass,
            status.pulse && "motion-safe:animate-pulse",
          )}
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-serif text-2xl font-medium tracking-tight text-text">{squad.name}</h1>
          <p className="text-[13px] text-text-3">
            {squad.mission} · <span className="font-mono">{squad.repo}</span>
          </p>
        </div>
        <Link
          href={`/squads/${squad.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-2 text-[13px] font-medium text-text transition-colors hover:border-border-2 hover:bg-[var(--nav-hover)]"
        >
          <Pencil className="size-3.5" /> Edit
        </Link>
      </header>

      {squad.description ? (
        <p className="text-[13.5px] leading-relaxed text-text-2">{squad.description}</p>
      ) : null}

      <section className="space-y-2.5">
        <SectionLabel>
          Roster · {squad.phase} · {squad.stepsDone}/{squad.stepsTotal}
        </SectionLabel>
        <div className="flex flex-wrap gap-2">
          <RosterMember mono={squad.lead} lead />
          {squad.members.map((mono) => (
            <RosterMember key={mono} mono={mono} />
          ))}
        </div>
      </section>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <Stat label="Runs" value={squad.runs} />
        <Stat label="Merged" value={squad.merged} />
        <Stat label="Tokens" value={squad.tokens} />
        <Stat label="Cost" value={squad.cost} />
        <Stat label="Avg time" value={squad.avgTime} />
        <Stat label="Schedule" value={squad.schedule} />
      </dl>

      <section className="space-y-2.5">
        <SectionLabel>Recent runs</SectionLabel>
        {squad.recentRuns.length === 0 ? (
          <p className="text-[12.5px] text-text-3">No runs yet.</p>
        ) : (
          <ul className="space-y-2">
            {squad.recentRuns.map((run) => {
              const outcome = RUN_OUTCOME_META[run.status];
              return (
                <li
                  key={run.id}
                  className="flex items-center gap-3 rounded-lg border border-hair bg-panel px-3 py-2"
                >
                  <span
                    role="img"
                    aria-label={outcome.label}
                    className={cn("size-2 shrink-0 rounded-full", outcome.dotClass)}
                  />
                  <span className="font-mono text-[11px] text-text-4">{run.id}</span>
                  <span className="min-w-0 flex-1 truncate text-[12.5px] text-text-2">
                    {run.title}
                  </span>
                  <span className="font-mono text-[11px] text-text-4">{run.when}</span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function RosterMember({ mono, lead = false }: { mono: string; lead?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg border border-hair bg-panel px-2.5 py-1.5">
      <span className="grid size-6 place-items-center rounded-full bg-chip font-mono text-[10px] font-semibold text-text-2">
        {mono}
      </span>
      {lead ? (
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-primary">Lead</span>
      ) : null}
    </span>
  );
}

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-4">{children}</h2>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-hair bg-panel px-3 py-2.5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-4">{label}</dt>
      <dd className="mt-0.5 text-[13px] font-medium text-text">{value}</dd>
    </div>
  );
}
