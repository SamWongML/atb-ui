"use client";

import type { Route } from "next";
import { useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { NAV_ITEMS } from "@/lib/nav";

// The ⌘K command palette (README.md §Overlays). Fuzzy search over navigation + a
// set of injected action commands. Controlled (open/onOpenChange) so it stays
// testable; the container wires the Zustand store, the router, and the actions.

export type CommandAction = {
  readonly id: string;
  readonly label: string;
  readonly hint?: string;
  readonly run: () => void;
};

export type CommandPaletteProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNavigate: (href: Route) => void;
  actions?: readonly CommandAction[];
};

export function CommandPalette({
  open,
  onOpenChange,
  onNavigate,
  actions = [],
}: CommandPaletteProps) {
  // Global ⌘K / Ctrl-K toggles the palette from anywhere.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        onOpenChange(!open);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onOpenChange]);

  function close() {
    onOpenChange(false);
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search sessions, runs, agents, skills, servers — or a command" />
      <CommandList>
        <CommandEmpty>No matches</CommandEmpty>

        {actions.length > 0 && (
          <CommandGroup heading="Commands">
            {actions.map((action) => (
              <CommandItem
                key={action.id}
                value={action.label}
                onSelect={() => {
                  action.run();
                  close();
                }}
              >
                {action.label}
                {action.hint && <CommandShortcut>{action.hint}</CommandShortcut>}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandGroup heading="Go to">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <CommandItem
                key={item.href}
                value={`Go to ${item.label}`}
                onSelect={() => {
                  onNavigate(item.href);
                  close();
                }}
              >
                <Icon aria-hidden />
                {item.label}
              </CommandItem>
            );
          })}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
