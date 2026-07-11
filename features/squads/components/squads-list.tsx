"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ListHeader } from "@/components/list-header";
import { Surface } from "@/components/surface";
import { leadingNumber, type SortDir, type SortField, sortItems } from "@/lib/list-query";
import { cn } from "@/lib/utils";
import { SQUAD_STATUS_META } from "../presentation";
import { SQUAD_STATUSES, type Squad } from "../schema";

// The squads list (README.md §Squads): a grid of agent teams, each card showing its lead +
// members, mission, phase and progress. The shared <ListHeader> drives search + status
// filter + sort; data arrives as a prop from the RSC.

const SORT_FIELDS: SortField<Squad>[] = [
  { key: "name", label: "Name", value: (squad) => squad.name.toLowerCase() },
  { key: "status", label: "Status", value: (squad) => SQUAD_STATUSES.indexOf(squad.status) },
  { key: "progress", label: "Progress", value: (squad) => squad.stepsDone / squad.stepsTotal },
  { key: "runs", label: "Runs", value: (squad) => leadingNumber(squad.runs) },
];

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  ...SQUAD_STATUSES.map((status) => ({ value: status, label: SQUAD_STATUS_META[status].label })),
];

export function SquadsList({ squads }: { squads: readonly Squad[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("status");
  const [dir, setDir] = useState<SortDir>("asc");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = squads.filter((squad) => {
      if (status !== "all" && squad.status !== status) return false;
      if (!q) return true;
      return (
        squad.name.toLowerCase().includes(q) ||
        squad.mission.toLowerCase().includes(q) ||
        squad.description.toLowerCase().includes(q)
      );
    });
    return sortItems(filtered, SORT_FIELDS, sortKey, dir);
  }, [squads, query, status, sortKey, dir]);

  return (
    <Surface className="gap-5">
      <ListHeader
        title="Squads"
        subtitle="Agent teams with a lead and a mission."
        count={squads.length}
        newButton={{ href: "/squads/new", label: "New squad" }}
        search={{ value: query, onChange: setQuery, placeholder: "Search squads…" }}
        filter={{
          options: STATUS_FILTERS,
          value: status,
          onChange: setStatus,
          ariaLabel: "Filter by status",
        }}
        sort={{
          fields: SORT_FIELDS,
          value: sortKey,
          onChange: setSortKey,
          dir,
          onToggleDir: () => setDir((current) => (current === "asc" ? "desc" : "asc")),
        }}
      />

      {squads.length === 0 ? (
        <EmptyState message="No squads yet. Create one to get started." />
      ) : visible.length === 0 ? (
        <EmptyState message="No squads match this view." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {visible.map((squad) => (
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

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-hair bg-panel px-4 py-10 text-center text-[13px] text-text-3">
      {message}
    </p>
  );
}
