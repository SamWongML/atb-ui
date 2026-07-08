import { Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SQUAD_STATUS_META } from "../presentation";
import type { Squad } from "../schema";

// The squads list (README.md §Squads): a grid of agent teams, each card showing its lead +
// members, mission, phase and progress. Fed by the RSC page through tRPC; a header action
// opens the create form.

export function SquadsList({ squads }: { squads: readonly Squad[] }) {
  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-text">Squads</h1>
          <p className="text-[13px] text-text-3">Agent teams with a lead and a mission.</p>
        </div>
        <Link
          href="/squads/new"
          className="inline-flex items-center gap-1.5 rounded-md border border-primary-soft-bd bg-primary-soft px-3 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary-bg"
        >
          <Plus className="size-4" /> New squad
        </Link>
      </header>

      {squads.length === 0 ? (
        <p className="rounded-xl border border-hair bg-panel px-4 py-10 text-center text-[13px] text-text-3">
          No squads yet. Create one to get started.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {squads.map((squad) => (
            <SquadCard key={squad.id} squad={squad} />
          ))}
        </div>
      )}
    </div>
  );
}

function SquadCard({ squad }: { squad: Squad }) {
  const status = SQUAD_STATUS_META[squad.status];
  const roster = [squad.lead, ...squad.members];
  return (
    <Link
      href={`/squads/${squad.id}`}
      className="flex flex-col gap-3 rounded-xl border border-hair bg-panel p-4 transition-colors hover:border-border-2 hover:bg-panel-2"
    >
      <div className="flex items-center gap-2">
        <span
          role="img"
          aria-label={status.label}
          className={cn(
            "size-2 shrink-0 rounded-full",
            status.dotClass,
            status.pulse && "motion-safe:animate-pulse",
          )}
        />
        <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-text">
          {squad.name}
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
      <p className="text-[12.5px] text-text-2">{squad.mission}</p>
      <div className="flex items-center gap-3">
        <div className="flex -space-x-1.5">
          {roster.slice(0, 5).map((mono) => (
            <span
              key={mono}
              className="grid size-6 place-items-center rounded-full border border-panel bg-chip font-mono text-[9px] font-semibold text-text-2"
            >
              {mono}
            </span>
          ))}
        </div>
        <span className="ml-auto font-mono text-[11px] text-text-4">
          {squad.phase} · {squad.stepsDone}/{squad.stepsTotal}
        </span>
      </div>
    </Link>
  );
}
