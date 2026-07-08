"use client";

import { LogOut, Search, TerminalSquare } from "lucide-react";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { BreadcrumbNav } from "@/components/breadcrumb-nav";
import { SidebarNav } from "@/components/sidebar-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { WorkspaceSwitcher } from "@/components/workspace-switcher";
import { CommandMenu } from "@/features/command-menu/command-menu";
import type { CommandAction } from "@/features/command-menu/command-palette";
import { useCommandMenu } from "@/features/command-menu/store";
import { toggleTheme } from "@/lib/theme";
import {
  DEFAULT_ENVIRONMENT_ID,
  DEFAULT_WORKSPACE_ID,
  ENVIRONMENTS,
  type EnvironmentId,
  WORKSPACES,
} from "@/lib/workspace";
import type { SessionUser } from "@/server/auth/session";

function monogram(name: string): string {
  return name.trim().slice(0, 2).toLowerCase() || "you";
}

async function signOut() {
  await fetch("/api/auth/sign-out", { method: "POST" });
  window.location.href = "/sign-in";
}

// The Phase 1 app shell (README.md §App Shell): fixed sidebar (workspace switcher ·
// nav · account) + a main column (breadcrumb header · scrolling content). Sub-parts
// are individually tested; this composes them and wires the ⌘K palette + account menu.

export function AppShell({ children, user }: { children: ReactNode; user?: SessionUser }) {
  const pathname = usePathname() || "/overview";
  const setPaletteOpen = useCommandMenu((state) => state.setOpen);

  const [workspaceId, setWorkspaceId] = useState<string>(DEFAULT_WORKSPACE_ID);
  const [environmentId, setEnvironmentId] = useState<EnvironmentId>(DEFAULT_ENVIRONMENT_ID);

  const runNewSession = () => {};
  const actions: CommandAction[] = [
    { id: "new-session", label: "New session", hint: "⌘N", run: runNewSession },
    { id: "toggle-theme", label: "Toggle theme", hint: "⌘⇧L", run: () => toggleTheme() },
  ];

  return (
    <div className="flex min-h-screen bg-bg text-text">
      <aside className="flex w-[238px] flex-shrink-0 flex-col gap-4 overflow-y-auto border-r border-border bg-bg p-4">
        <WorkspaceSwitcher
          workspaces={WORKSPACES}
          workspaceId={workspaceId}
          environments={ENVIRONMENTS}
          environmentId={environmentId}
          onSelectWorkspace={setWorkspaceId}
          onSelectEnvironment={setEnvironmentId}
        />
        <SidebarNav pathname={pathname} onNewSession={runNewSession} />
        <div className="mt-auto">
          <AccountMenu user={user} onOpenCommandMenu={() => setPaletteOpen(true)} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[53px] flex-shrink-0 items-center justify-between gap-4 border-b border-border px-5">
          <BreadcrumbNav pathname={pathname} />
          <button
            type="button"
            onClick={() => setPaletteOpen(true)}
            className="flex min-w-[186px] items-center gap-2 rounded-lg border border-border bg-panel px-2.5 py-1.5 text-[12.5px] font-medium text-text-3 transition-colors hover:border-border-2 hover:text-text-2"
          >
            <Search className="size-3.5" aria-hidden />
            Search or run a command
            <kbd className="ml-auto rounded border border-border px-1.5 font-mono text-[10.5px] text-text-3">
              ⌘K
            </kbd>
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>

      <CommandMenu actions={actions} />
    </div>
  );
}

function AccountMenu({
  user,
  onOpenCommandMenu,
}: {
  user?: SessionUser;
  onOpenCommandMenu: () => void;
}) {
  const name = user?.name ?? "You";
  const detail = user?.email ?? "Signed in";
  return (
    <Popover>
      <PopoverTrigger
        aria-label="Account"
        className="flex w-full items-center gap-2.5 rounded-[10px] border border-transparent p-1.5 text-left outline-none transition-colors hover:bg-[var(--nav-hover)] focus-visible:ring-[3px] focus-visible:ring-ring/50"
      >
        <span className="relative grid size-7 shrink-0 place-items-center rounded-lg bg-panel-2 font-mono text-[11px] text-text-2">
          {monogram(name)}
          <span
            className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full border border-bg bg-green"
            aria-hidden
          />
        </span>
        <span className="min-w-0 flex-1 leading-tight">
          <span className="block truncate text-[13px] font-medium text-text">{name}</span>
          <span className="block truncate font-mono text-[9.5px] text-text-4">{detail}</span>
        </span>
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="w-[248px]">
        <div className="flex items-center justify-between px-2.5 py-2">
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-4">
            Theme
          </span>
          <ThemeToggle />
        </div>
        <div className="my-1.5 h-px bg-hair" />
        <button
          type="button"
          onClick={onOpenCommandMenu}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-text transition-colors hover:bg-[var(--nav-hover)]"
        >
          <TerminalSquare className="size-4 text-text-3" aria-hidden />
          Command menu
          <kbd className="ml-auto rounded border border-border px-1.5 font-mono text-[10px] text-text-4">
            ⌘K
          </kbd>
        </button>
        <button
          type="button"
          onClick={signOut}
          className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-[13px] text-red transition-colors hover:bg-red-bg"
        >
          <LogOut className="size-4" aria-hidden />
          Sign out
        </button>
      </PopoverContent>
    </Popover>
  );
}
