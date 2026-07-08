"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import Link from "next/link";
import { useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { filterSessions, groupSessions, SESSION_FILTERS, type SessionFilter } from "../grouping";
import type { Session } from "../schema";
import { STATUS_META } from "../status";

// The hero surface's list (README.md §Sessions): a flat server list, bucketed into the
// ordered status groups and filtered by the active tab. The rows are virtualized
// (TanStack Virtual) so a long, live-updating list stays cheap (ARCHITECTURE.md budgets:
// "virtualize every live list"). Server data arrives as a prop — the RSC page fetches it.

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

export function SessionsList({ sessions }: { sessions: readonly Session[] }) {
  const [filter, setFilter] = useState<SessionFilter>("all");
  const scrollRef = useRef<HTMLDivElement>(null);

  const rows = toRows(filterSessions([...sessions], filter));

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: (index) => (rows[index]?.kind === "header" ? HEADER_SIZE : ROW_SIZE),
    overscan: 8,
    // jsdom never measures a layout; seed a viewport so tests (and the first paint) see
    // rows before the ResizeObserver settles the real height.
    initialRect: { width: 760, height: 900 },
  });

  return (
    <div className="mx-auto flex h-full max-w-3xl flex-col gap-5">
      <div role="tablist" aria-label="Filter sessions" className="flex flex-wrap gap-1.5">
        {SESSION_FILTERS.map((tab) => {
          const selected = tab.value === filter;
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setFilter(tab.value)}
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
        <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
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
    </div>
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
