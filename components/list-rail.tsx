"use client";

import {
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronLeft,
  ListFilter,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ListDisplayMenu, type ListDisplayState } from "@/components/list-display";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { SortDir } from "@/lib/list-query";
import { activeNavLocation } from "@/lib/nav";
import { cn } from "@/lib/utils";

// The one list-screen rail (ADR 0001) — every BUILD list (Agents, Workflows, Squads,
// Skills, MCP) renders this into the shell header via the @header slot. A single dense row:
// back · location (Group / Section · count) · status tabs · [gap] · sort · filter ·
// optional display · New. Search lives in a toggled "Filter" subheader (Linear's
// pattern), separate from the global ⌘K search in the sidebar. Generic + prop-driven:
// it knows nothing about any feature, so the look and behaviour never drift per screen.

export type FilterOption = { value: string; label: string };
export type SortOption = { key: string; label: string };

export type ListRailProps = {
  /** Total item count shown beside the location. */
  count: number;
  filter: {
    options: readonly FilterOption[];
    value: string;
    onChange: (value: string) => void;
    /** Count per option value (`all` = total) for the tab badges. */
    counts?: Record<string, number>;
    ariaLabel?: string;
  };
  sort: {
    fields: readonly SortOption[];
    value: string;
    onChange: (key: string) => void;
    dir: SortDir;
    onToggleDir: () => void;
  };
  search: { value: string; onChange: (value: string) => void; placeholder?: string };
  newButton: { href: Route; label: string };
  /** Optional Display popover (layout/density/full width/properties). */
  display?: ListDisplayState;
};

const iconButton =
  "grid size-7 shrink-0 place-items-center rounded-md text-text-3 transition-colors hover:bg-[var(--nav-hover)] hover:text-text";

export function ListRail({ count, filter, sort, search, newButton, display }: ListRailProps) {
  const router = useRouter();
  const pathname = usePathname() || "";
  const location = activeNavLocation(pathname);
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef<HTMLInputElement>(null);
  const activeSort = sort.fields.find((field) => field.key === sort.value) ?? sort.fields[0];

  useEffect(() => {
    if (filterOpen) filterRef.current?.focus();
  }, [filterOpen]);

  const toggleFilter = () => {
    if (filterOpen) search.onChange("");
    setFilterOpen((open) => !open);
  };

  return (
    <>
      <div className="flex h-11 items-center gap-1.5 px-3">
        <button
          type="button"
          aria-label="Back"
          onClick={() => router.back()}
          className={iconButton}
        >
          <ChevronLeft className="size-4" />
        </button>

        <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1 text-[13px]">
          {location && (
            <>
              <span className="whitespace-nowrap px-1 text-text-3">{location.group.label}</span>
              <span aria-hidden className="select-none text-text-4">
                /
              </span>
            </>
          )}
          <span
            aria-current="page"
            className="flex items-center gap-1.5 whitespace-nowrap px-1 font-medium text-text"
          >
            {location && <location.item.icon className="size-3.5 text-text-3" aria-hidden />}
            {location?.item.label ?? "List"}
            <span className="rounded-full bg-[var(--chip)] px-1.5 font-mono text-[10px] tabular-nums text-text-2">
              {count}
            </span>
          </span>
        </nav>

        <span className="mx-1.5 h-4 w-px shrink-0 bg-hair" aria-hidden />

        <div
          role="tablist"
          aria-label={filter.ariaLabel ?? "Filter"}
          className="flex min-w-0 items-center gap-0.5 overflow-x-auto"
        >
          {filter.options.map((option) => {
            const selected = option.value === filter.value;
            const optionCount = filter.counts?.[option.value];
            return (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => filter.onChange(option.value)}
                className={cn(
                  "flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2.5 text-[12.5px] font-medium transition-colors",
                  selected
                    ? "bg-panel-2 text-text"
                    : "text-text-3 hover:bg-[var(--nav-hover)] hover:text-text-2",
                )}
              >
                {option.label}
                {optionCount !== undefined && (
                  <span className="font-mono text-[10px] tabular-nums text-text-4">
                    {optionCount}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-0.5 pl-2">
          <button
            type="button"
            onClick={sort.onToggleDir}
            aria-label={
              sort.dir === "asc"
                ? "Sorted ascending — switch to descending"
                : "Sorted descending — switch to ascending"
            }
            title={sort.dir === "asc" ? "Ascending" : "Descending"}
            className={iconButton}
          >
            {sort.dir === "asc" ? (
              <ArrowUp className="size-3.5" />
            ) : (
              <ArrowDown className="size-3.5" />
            )}
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger className="flex h-7 items-center gap-1.5 rounded-md px-2 text-[12px] outline-none transition-colors hover:bg-[var(--nav-hover)]">
              <span className="font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-4">
                Sort
              </span>
              <span className="font-medium text-text">{activeSort?.label}</span>
              <ChevronDown className="size-3 text-text-4" aria-hidden />
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

          <button
            type="button"
            onClick={toggleFilter}
            aria-expanded={filterOpen}
            aria-label="Filter this view"
            title="Filter this view"
            className={cn(
              "flex h-7 items-center gap-1.5 rounded-md px-2 text-[12px] font-medium transition-colors",
              filterOpen || search.value
                ? "bg-panel-2 text-text"
                : "text-text-3 hover:bg-[var(--nav-hover)] hover:text-text",
            )}
          >
            <ListFilter className="size-3.5" aria-hidden />
            Filter
          </button>

          {display && (
            <ListDisplayMenu display={display}>
              <button
                type="button"
                aria-label="Display options"
                title="Display options"
                className={iconButton}
              >
                <SlidersHorizontal className="size-3.5" />
              </button>
            </ListDisplayMenu>
          )}

          <span className="mx-1 h-4 w-px bg-hair" aria-hidden />

          <Link
            href={newButton.href}
            className="flex h-7 items-center gap-1.5 rounded-md border border-primary-soft-bd bg-primary-soft px-2.5 text-[12px] font-medium text-primary transition-colors hover:bg-primary-bg"
          >
            <Plus className="size-3.5" aria-hidden />
            {newButton.label}
          </Link>
        </div>
      </div>

      {filterOpen && (
        <div className="flex h-10 items-center gap-2 border-t border-hair px-3">
          <label className="relative flex w-[280px] items-center">
            <Search
              className="pointer-events-none absolute left-2.5 size-3.5 text-text-4"
              aria-hidden
            />
            <input
              ref={filterRef}
              value={search.value}
              onChange={(event) => search.onChange(event.target.value)}
              placeholder={search.placeholder ?? "Filter…"}
              aria-label="Filter items"
              className="h-7 w-full rounded-md border border-border bg-inset pl-8 pr-2 text-[12.5px] text-text outline-none transition-colors placeholder:text-text-4 focus:border-border-2"
            />
          </label>
          <button
            type="button"
            onClick={toggleFilter}
            aria-label="Close filter"
            className="ml-auto grid size-6 place-items-center rounded text-text-4 transition-colors hover:bg-[var(--nav-hover)] hover:text-text-2"
          >
            <X className="size-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
