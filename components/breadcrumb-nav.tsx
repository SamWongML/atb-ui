"use client";

import { Check, ChevronDown } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { activeNavItem } from "@/lib/nav";
import { cn } from "@/lib/utils";

// Header breadcrumb (README.md §App Shell): `Section / Entity`. The section is
// derived from the route via the shared nav model. With no entity it is the current
// page; with one it links back to the list and the entity becomes a sibling switcher.

export type BreadcrumbSibling = {
  readonly id: string;
  readonly label: string;
  readonly href: Route;
  readonly sub?: string;
};

export type BreadcrumbEntity = {
  readonly label: string;
  readonly currentId: string;
  readonly siblings: readonly BreadcrumbSibling[];
};

export type BreadcrumbNavProps = {
  pathname: string;
  entity?: BreadcrumbEntity;
};

const crumbText = "flex h-[30px] items-center whitespace-nowrap px-2.5 text-[13px]";

export function BreadcrumbNav({ pathname, entity }: BreadcrumbNavProps) {
  const section = activeNavItem(pathname);

  return (
    <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-0.5">
      {section &&
        (entity ? (
          <Link
            href={section.href}
            className={cn(
              crumbText,
              "rounded-lg font-medium text-text-3 transition-colors hover:bg-[var(--nav-hover)] hover:text-text",
            )}
          >
            {section.label}
          </Link>
        ) : (
          <span aria-current="page" className={cn(crumbText, "font-semibold text-text")}>
            {section.label}
          </span>
        ))}

      {entity && (
        <span className="flex min-w-0 items-center gap-0.5">
          <span aria-hidden className="select-none text-sm text-text-4">
            /
          </span>
          <DropdownMenu>
            <DropdownMenuTrigger
              aria-current="page"
              className={cn(
                crumbText,
                "min-w-0 max-w-[360px] gap-1.5 rounded-lg font-semibold text-text outline-none transition-colors hover:bg-[var(--nav-hover)] focus-visible:ring-[3px] focus-visible:ring-ring/50",
              )}
            >
              <span className="truncate">{entity.label}</span>
              <ChevronDown className="size-3 shrink-0 text-text-4" aria-hidden />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[322px]">
              {entity.siblings.map((sibling) => (
                <DropdownMenuItem key={sibling.id} asChild>
                  <Link href={sibling.href}>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-text">{sibling.label}</span>
                      {sibling.sub && (
                        <span className="truncate font-mono text-[11px] text-text-4">
                          {sibling.sub}
                        </span>
                      )}
                    </span>
                    {sibling.id === entity.currentId && (
                      <Check className="size-3.5 text-primary" aria-hidden />
                    )}
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </span>
      )}
    </nav>
  );
}
