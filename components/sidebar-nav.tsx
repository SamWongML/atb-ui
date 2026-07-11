"use client";

import { ChevronRight, Plus, Search, SquarePen } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { isNavItemActive, NAV_GROUPS } from "@/lib/nav";
import { cn } from "@/lib/utils";

// Presentational sidebar navigation (README.md §App Shell, ADR 0001). The compose block
// holds ONE global create action — New session — beside a search button that opens the
// ⌘K command menu (Linear's "search sits next to compose" pattern; entity creation like
// "New agent" lives in each screen's own rail, not here, so there's never a duplicate
// New). Nav groups collapse; the Sessions row carries the live count and a hover-＋ for
// a quick session. Active state + the count are pure props so the component stays
// trivially testable; the shell wires usePathname() + the sessions query + the palette.

const GROUP_LABEL =
  "flex items-center gap-1 px-2.5 font-mono text-[10px] uppercase tracking-[0.14em]";

export type SidebarNavProps = {
  pathname: string;
  /** Live count badge on the Sessions item; omitted until the query resolves. */
  sessionCount?: number;
  onNewSession?: () => void;
  /** Opens the ⌘K command menu from the sidebar search button. */
  onOpenCommandMenu?: () => void;
};

export function SidebarNav({
  pathname,
  sessionCount,
  onNewSession,
  onOpenCommandMenu,
}: SidebarNavProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  return (
    <nav aria-label="Main" className="flex flex-col gap-4">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={onNewSession}
          className="flex h-9 flex-1 items-center gap-2 rounded-lg border border-primary-soft-bd bg-primary-soft px-3 text-[13.5px] font-medium text-primary transition-colors hover:bg-primary-bg"
        >
          <SquarePen className="size-4" aria-hidden />
          New session
          <kbd className="ml-auto font-mono text-[10px] text-text-4">⌘N</kbd>
        </button>
        <button
          type="button"
          aria-label="Search — open the command menu"
          title="Search — ⌘K"
          onClick={onOpenCommandMenu}
          className="grid size-9 shrink-0 place-items-center rounded-lg border border-border text-text-3 transition-colors hover:border-border-2 hover:text-text"
        >
          <Search className="size-4" />
        </button>
      </div>

      {NAV_GROUPS.map((group) => {
        const isCollapsed = collapsed[group.label] ?? false;
        return (
          <div key={group.label} className="flex flex-col gap-1">
            <button
              type="button"
              onClick={() => setCollapsed((prev) => ({ ...prev, [group.label]: !isCollapsed }))}
              aria-expanded={!isCollapsed}
              className={cn(
                GROUP_LABEL,
                "group/label text-text-4 transition-colors hover:text-text-3",
              )}
            >
              {group.label}
              <ChevronRight
                className={cn(
                  "size-3 opacity-0 transition-all group-hover/label:opacity-100",
                  !isCollapsed && "rotate-90",
                )}
                aria-hidden
              />
            </button>
            {!isCollapsed && (
              <ul className="flex flex-col gap-0.5">
                {group.items.map((item) => {
                  const active = isNavItemActive(pathname, item);
                  const Icon = item.icon;
                  const isSessions = item.label === "Sessions";
                  return (
                    <li key={item.href} className="group/item relative">
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-2.5 rounded-lg px-2.5 py-[7px] text-[13.5px] font-medium transition-colors",
                          active
                            ? "bg-[var(--sel-bg)] text-text"
                            : "text-text-2 hover:bg-[var(--nav-hover)] hover:text-text",
                        )}
                      >
                        <Icon
                          className={cn("size-4 shrink-0", active ? "text-primary" : "text-text-3")}
                          aria-hidden
                        />
                        <span className="flex-1">{item.label}</span>
                        {isSessions && sessionCount !== undefined && (
                          <span className="rounded-full bg-[var(--chip)] px-1.5 font-mono text-[10px] tabular-nums text-text-2 group-hover/item:hidden">
                            {sessionCount}
                          </span>
                        )}
                      </Link>
                      {isSessions && (
                        <button
                          type="button"
                          aria-label="Start a session"
                          title="Start a session"
                          onClick={onNewSession}
                          className="absolute right-1.5 top-1/2 hidden size-5 -translate-y-1/2 place-items-center rounded text-text-3 transition-colors hover:bg-[var(--chip)] hover:text-text group-hover/item:grid"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </nav>
  );
}
