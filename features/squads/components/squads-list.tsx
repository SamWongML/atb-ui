"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Surface } from "@/components/surface";
import { useListQuery } from "@/lib/use-list-query";
import { cn } from "@/lib/utils";
import { SQUADS_LIST_QUERY } from "../list-config";
import { SQUAD_STATUS_META } from "../presentation";
import type { Squad } from "../schema";

// The squads list body (README.md §Squads, ADR 0002): a grid of agent teams, each card
// showing its lead + members, mission, phase and progress. The rail (search · status tabs ·
// sort · New) is server-rendered into the shell @header slot; state is the shared
// useListQuery. Data arrives as a prop from the RSC.

export function SquadsList({ squads }: { squads: readonly Squad[] }) {
  const query = useListQuery({ items: squads, ...SQUADS_LIST_QUERY });

  return (
    <Surface className="gap-4">
      {squads.length === 0 ? (
        <EmptyState title="No squads yet." description="Create one to get started." />
      ) : query.visible.length === 0 ? (
        <EmptyState title="No squads match this view." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {query.visible.map((squad) => (
            <SquadCard key={squad.id} squad={squad} />
          ))}
        </div>
      )}
    </Surface>
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
