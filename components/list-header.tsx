"use client";

import { ArrowDown, ArrowUp, ChevronDown, Search } from "lucide-react";
import { NewButton } from "@/components/new-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SortDir } from "@/lib/list-query";
import { cn } from "@/lib/utils";

// The shared list header for every BUILD screen (Agents, Workflows, Squads, Skills, MCP).
// The "command bar" design: title + count badge + New action on top, then one bordered bar
// holding search (grows), a segmented status filter, and an integrated sort (field menu +
// direction toggle) split by hairlines. Controlled — each screen owns the state and the
// query logic; this only renders and reports changes. Returns a fragment so the header and
// the bar become direct children of the host <Surface> (inheriting its vertical rhythm).

export interface FilterOption {
  value: string;
  label: string;
}

export interface SortOption {
  key: string;
  label: string;
}

export function ListHeader({
  title,
  subtitle,
  count,
  newButton,
  search,
  filter,
  sort,
}: {
  title: string;
  subtitle?: string;
  count: number;
  newButton: { href: string; label: string };
  search: { value: string; onChange: (value: string) => void; placeholder?: string };
  filter?: {
    options: readonly FilterOption[];
    value: string;
    onChange: (value: string) => void;
    ariaLabel?: string;
  };
  sort: {
    fields: readonly SortOption[];
    value: string;
    onChange: (key: string) => void;
    dir: SortDir;
    onToggleDir: () => void;
  };
}) {
  const activeSort = sort.fields.find((field) => field.key === sort.value) ?? sort.fields[0];

  return (
    <>
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="font-serif text-[27px] font-medium tracking-tight text-text">{title}</h1>
            <span className="rounded-full border border-border bg-panel px-2 py-0.5 font-mono text-[11px] tabular-nums text-text-2">
              {count}
            </span>
          </div>
          {subtitle && <p className="mt-0.5 text-[13px] text-text-3">{subtitle}</p>}
        </div>
        <NewButton href={newButton.href} label={newButton.label} />
      </header>

      <div className="flex items-center gap-1.5 rounded-xl border border-border bg-panel p-1.5">
        <label className="relative flex min-w-0 flex-1 items-center">
          <Search
            className="pointer-events-none absolute left-2.5 size-3.5 text-text-4"
            aria-hidden
          />
          <input
            value={search.value}
            onChange={(event) => search.onChange(event.target.value)}
            placeholder={search.placeholder ?? "Search…"}
            aria-label={`Search ${title.toLowerCase()}`}
            className="h-8 w-full rounded-lg bg-transparent pl-8 pr-2 text-[13px] text-text outline-none placeholder:text-text-4"
          />
        </label>

        {filter && (
          <>
            <span className="h-5 w-px shrink-0 bg-hair" aria-hidden />
            <div
              role="tablist"
              aria-label={filter.ariaLabel ?? "Filter"}
              className="flex items-center gap-0.5"
            >
              {filter.options.map((option) => {
                const selected = option.value === filter.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="tab"
                    aria-selected={selected}
                    onClick={() => filter.onChange(option.value)}
                    className={cn(
                      "h-8 rounded-lg px-2.5 text-[12.5px] font-medium transition-colors",
                      selected
                        ? "bg-panel-2 text-text"
                        : "text-text-3 hover:bg-[var(--nav-hover)] hover:text-text-2",
                    )}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </>
        )}

        <span className="h-5 w-px shrink-0 bg-hair" aria-hidden />

        <div className="flex items-center">
          <button
            type="button"
            onClick={sort.onToggleDir}
            aria-label={
              sort.dir === "asc"
                ? "Sorted ascending — switch to descending"
                : "Sorted descending — switch to ascending"
            }
            title={sort.dir === "asc" ? "Ascending" : "Descending"}
            className="grid size-8 shrink-0 place-items-center rounded-lg text-text-2 transition-colors hover:bg-[var(--nav-hover)] hover:text-text"
          >
            {sort.dir === "asc" ? (
              <ArrowUp className="size-3.5" />
            ) : (
              <ArrowDown className="size-3.5" />
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-8 items-center gap-1.5 rounded-lg px-2.5 text-[12.5px] outline-none transition-colors hover:bg-[var(--nav-hover)]">
              <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-4">
                Sort
              </span>
              <span className="font-medium text-text">{activeSort?.label}</span>
              <ChevronDown className="size-3.5 text-text-4" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-[9rem]">
              <DropdownMenuLabel>Sort by</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sort.value} onValueChange={sort.onChange}>
                {sort.fields.map((field) => (
                  <DropdownMenuRadioItem key={field.key} value={field.key}>
                    {field.label}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </>
  );
}
