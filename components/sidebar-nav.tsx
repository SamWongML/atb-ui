"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { isNavItemActive, NAV_GROUPS } from "@/lib/nav";
import { cn } from "@/lib/utils";

// Presentational sidebar navigation (README.md §App Shell). Active state and the
// live Sessions count are pure props so the component stays trivially testable;
// the container (app/(app)/layout.tsx) wires usePathname() + the sessions query.

const MICRO_LABEL = "px-2.5 font-mono text-[10px] uppercase tracking-[0.14em] text-text-4";

export type SidebarNavProps = {
  pathname: string;
  /** Live count badge on the Sessions item; omitted until the query resolves. */
  sessionCount?: number;
  onNewSession?: () => void;
};

export function SidebarNav({ pathname, sessionCount, onNewSession }: SidebarNavProps) {
  return (
    <nav aria-label="Main" className="flex flex-col gap-5">
      <button
        type="button"
        onClick={onNewSession}
        className="flex h-9 items-center gap-2 rounded-lg border border-primary-soft-bd bg-primary-soft px-3 text-[13.5px] font-medium text-primary transition-colors hover:bg-primary-bg"
      >
        <Plus className="size-4" aria-hidden />
        New session
        <kbd className="ml-auto font-mono text-[10px] text-text-4">⌘N</kbd>
      </button>

      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="flex flex-col gap-1">
          <p className={MICRO_LABEL}>{group.label}</p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => {
              const active = isNavItemActive(pathname, item);
              const Icon = item.icon;
              return (
                <li key={item.href}>
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
                    {item.label === "Sessions" && sessionCount !== undefined && (
                      <span className="rounded-full bg-[var(--chip)] px-1.5 font-mono text-[10px] text-text-2 tabular-nums">
                        {sessionCount}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
