import {
  BarChart3,
  Blocks,
  Bot,
  Boxes,
  LayoutDashboard,
  ListChecks,
  type LucideIcon,
  Radio,
  Server,
  Users,
  Workflow,
} from "lucide-react";
import type { Route } from "next";

// The single source of truth for navigation: the sidebar, the header breadcrumb,
// and the ⌘K command palette all read this model, so the surface list never drifts
// across the three places it appears (FOLDER_STRUCTURE.md — shared via lib/).

export type NavItem = {
  /** Section label shown in the sidebar and used as the breadcrumb section name. */
  readonly label: string;
  /** App Router route (typed against the pages under app/(app)/). */
  readonly href: Route;
  readonly icon: LucideIcon;
};

export type NavGroup = {
  readonly label: string;
  readonly items: readonly NavItem[];
};

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { label: "Overview", href: "/overview", icon: LayoutDashboard },
      { label: "Sessions", href: "/sessions", icon: Radio },
      { label: "Runs", href: "/runs", icon: ListChecks },
    ],
  },
  {
    label: "Build",
    items: [
      { label: "Workflows", href: "/workflows", icon: Workflow },
      { label: "Agents", href: "/agents", icon: Bot },
      { label: "Squads", href: "/squads", icon: Users },
      { label: "Skills", href: "/skills", icon: Blocks },
      { label: "MCP servers", href: "/mcp", icon: Server },
    ],
  },
  {
    label: "Runtime",
    items: [
      { label: "Sandboxes", href: "/sandboxes", icon: Boxes },
      { label: "Analytics", href: "/analytics", icon: BarChart3 },
    ],
  },
];

/** Flat list of every nav item, in sidebar order (for the palette + breadcrumb lookups). */
export const NAV_ITEMS: readonly NavItem[] = NAV_GROUPS.flatMap((group) => group.items);

/** Whether a nav item owns the pathname — its exact route or a nested child of it. */
export function isNavItemActive(pathname: string, item: NavItem): boolean {
  return pathname === item.href || pathname.startsWith(`${item.href}/`);
}

/**
 * The nav item that owns a given pathname — the longest matching route, so
 * `/sessions/sess_01` resolves to Sessions, and `/` resolves to nothing.
 */
export function activeNavItem(pathname: string): NavItem | undefined {
  return NAV_ITEMS.filter((item) => isNavItemActive(pathname, item)).sort(
    (a, b) => b.href.length - a.href.length,
  )[0];
}

/**
 * The active nav item plus the group it belongs to — the location a list-screen rail
 * shows as `Group / Section` (e.g. `Build / Agents`). Single source of truth so the
 * rail's location label never drifts from the sidebar.
 */
export function activeNavLocation(
  pathname: string,
): { group: NavGroup; item: NavItem } | undefined {
  const item = activeNavItem(pathname);
  if (!item) return undefined;
  const group = NAV_GROUPS.find((candidate) => candidate.items.includes(item));
  return group ? { group, item } : undefined;
}

/**
 * The BUILD list routes whose rail fills the shell `@header` slot (ADR 0002). Named by each
 * screen's `useListQuery` scope, which is also its `@header/<scope>` slot folder.
 */
export const LIST_ROUTE_SCOPES = ["agents", "workflows", "squads", "skills", "mcp"] as const;

/**
 * Whether a pathname is a build-list index (exactly `/agents`, `/workflows`, …). Those routes
 * render the server-rendered rail via the `@header` slot, so the shell omits its breadcrumb there;
 * every other route (including list detail/new pages) shows the breadcrumb.
 */
export function isListRoute(pathname: string): boolean {
  return LIST_ROUTE_SCOPES.some((scope) => pathname === `/${scope}`);
}
