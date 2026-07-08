"use client";

import { ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import type { Environment, EnvironmentId, Workspace } from "@/lib/workspace";

// Top-of-sidebar workspace + environment switcher (README.md §App Shell). Both are
// single-select radio groups so the current choice is semantically checked.

const ENV_DOT: Record<Environment["tone"], string> = {
  green: "bg-green",
  amber: "bg-amber",
  blue: "bg-blue",
};

export type WorkspaceSwitcherProps = {
  workspaces: readonly Workspace[];
  workspaceId: string;
  environments: readonly Environment[];
  environmentId: EnvironmentId;
  onSelectWorkspace: (id: string) => void;
  onSelectEnvironment: (id: EnvironmentId) => void;
};

export function WorkspaceSwitcher({
  workspaces,
  workspaceId,
  environments,
  environmentId,
  onSelectWorkspace,
  onSelectEnvironment,
}: WorkspaceSwitcherProps) {
  const workspace = workspaces.find((w) => w.id === workspaceId) ?? workspaces[0];
  const environment = environments.find((e) => e.id === environmentId) ?? environments[0];

  // Nothing to switch between if a caller passes empty lists.
  if (!workspace || !environment) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Switch workspace or environment"
        className="flex w-full items-center gap-2.5 rounded-[10px] border border-transparent p-1.5 text-left outline-none transition-colors hover:bg-[var(--nav-hover)] focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span
          className="grid size-[29px] shrink-0 place-items-center rounded-lg font-serif text-sm text-on-accent"
          style={{ background: "linear-gradient(160deg,var(--accent-2),var(--accent))" }}
          aria-hidden
        >
          {workspace.mark}
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-sm font-semibold tracking-[-0.01em] text-text">
            {workspace.name}
          </span>
          <span className="mt-0.5 flex items-center gap-1.5">
            <span className={cn("size-[5px] shrink-0 rounded-full", ENV_DOT[environment.tone])} />
            <span className="truncate font-mono text-[9.5px] tracking-[0.04em] text-text-3">
              {environment.name}
            </span>
          </span>
        </span>
        <ChevronsUpDown className="size-4 shrink-0 text-text-4" aria-hidden />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-[var(--radix-dropdown-menu-trigger-width)]">
        <DropdownMenuLabel>Workspace</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={workspaceId} onValueChange={onSelectWorkspace}>
          {workspaces.map((w) => (
            <DropdownMenuRadioItem key={w.id} value={w.id}>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="truncate text-[13px] font-medium text-text">{w.name}</span>
                <span className="font-mono text-[10.5px] text-text-4">{w.plan}</span>
              </span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />
        <DropdownMenuLabel>Environment</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={environmentId}
          onValueChange={(value) => onSelectEnvironment(value as EnvironmentId)}
        >
          {environments.map((e) => (
            <DropdownMenuRadioItem key={e.id} value={e.id}>
              <span className={cn("size-2 shrink-0 rounded-full", ENV_DOT[e.tone])} aria-hidden />
              <span className="font-mono text-xs text-text-2">{e.name}</span>
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
