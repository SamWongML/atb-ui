"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useRef } from "react";
import { Surface } from "@/components/surface";
import { cn } from "@/lib/utils";
import { filterSessions, groupSessions, SESSION_FILTER_VALUES, SESSION_FILTERS } from "../grouping";
import type { Session } from "../schema";
import { STATUS_META } from "../status";

// The hero surface's list (README.md §Sessions): a flat server snapshot (fetched through
// the BFF, refreshed on navigation), bucketed into the ordered status groups and filtered
// by the active tab. Rows are virtualized (TanStack Virtual) to stay cheap as the list
// grows — the readiness the "virtualize every live list" budget calls for. Data arrives
// as a prop; the RSC page reads it via tRPC.

/** A flattened virtual row: a group header or one session. */
type Row =
  | { kind: "header"; key: string; label: string; count: number }
  | { kind: "session"; key: string; session: Session };

function toRows(sessions: Session[]): Row[] {
  return groupSessions(sessions).flatMap((group) => [
    {
      kind: "header" as const,
      key: `group:${group.status}`,
      label: group.label,
      count: group.sessions.length,
    },
    ...group.sessions.map((session) => ({ kind: "session" as const, key: session.id, session })),
  ]);
}

const HEADER_SIZE = 40;
const ROW_SIZE = 68;
// A viewport to seed the virtualizer with before it can measure real layout — the server
// render (and jsdom) have none, so without this the first paint computes an empty range.
const PREMEASURE_VIEWPORT = { width: 760, height: 900 };

export function SessionsList({ sessions }: { sessions: readonly Session[] }) {
  // The active filter lives in the URL (nuqs, TECH_STACK.md L4) so a filtered view is
  // shareable, reloadable, and back-button-correct.
  const [filter, setFilter] = useQueryState(
    "filter",
    parseAsStringLiteral(SESSION_FILTER_VALUES).withDefault("all"),
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  const rows = toRows(filterSessions([...sessions], filter));

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => (rows[index]?.kind === "header" ? HEADER_SIZE : ROW_SIZE),
    overscan: 8,
    initialRect: PREMEASURE_VIEWPORT,
  });

  return (
    <Surface fill className="gap-5">
      <div role="tablist" aria-label="Filter sessions" className="flex flex-wrap gap-1.5">
        {SESSION_FILTERS.map((tab) => {
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

      {rows.length === 0 ? (
        <p className="rounded-xl border border-hair bg-panel px-4 py-10 text-center text-[13px] text-text-3">
          No sessions in this view.
        </p>
      ) : (
        <div ref={scrollRef} className="scroll-surface min-h-0 flex-1 overflow-y-auto">
          <div className="relative w-full" style={{ height: virtualizer.getTotalSize() }}>
            {virtualizer.getVirtualItems().map((item) => {
              const row = rows[item.index];
              if (!row) return null;
              return (
                <div
                  key={row.key}
                  data-index={item.index}
                  className="absolute left-0 top-0 w-full"
                  style={{ height: item.size, transform: `translateY(${item.start}px)` }}
                >
                  {row.kind === "header" ? (
                    <GroupHeader label={row.label} count={row.count} />
                  ) : (
                    <SessionRow session={row.session} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Surface>
  );
}

function GroupHeader({ label, count }: { label: string; count: number }) {
  return (
    <h2 className="flex items-center gap-2 pb-2 pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-text-4">
      {label}
      <span className="rounded-full bg-chip px-1.5 text-[10px] text-text-3">{count}</span>
    </h2>
  );
}

function SessionRow({ session }: { session: Session }) {
  const meta = STATUS_META[session.status];
  return (
    <Link
      href={`/sessions/${session.id}`}
      className="flex items-center gap-3 rounded-lg border border-hair bg-panel px-3.5 py-3 transition-colors hover:border-border-2 hover:bg-panel-2"
    >
      <span
        className={cn(
          "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
          meta.badgeClass,
        )}
      >
        {meta.label}
      </span>
      <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-text">
        {session.title || session.id}
      </span>
      <span className="font-mono text-[11px] text-text-4">
        {session.steps.completed}/{session.steps.total}
      </span>
    </Link>
  );
}
