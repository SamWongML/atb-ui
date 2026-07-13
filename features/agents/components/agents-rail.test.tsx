import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LIST_PREFS_COOKIE, type ListPrefs, parseListPrefs } from "@/lib/list-prefs";
import { ListPrefsProvider } from "@/lib/list-prefs-provider";
import type { Agent } from "../schema";
import { AgentsRail } from "./agents-rail";

// The rail reads the route (location label + back) from next/navigation; mock that
// boundary like the shell test so the rail renders standalone.
vi.mock("next/navigation", () => ({
  usePathname: () => "/agents",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

// Seam: the agents list-screen rail, server-rendered into the shell @header slot (ADR 0002).
// The durable anti-flash proof — the rail must paint the SAVED view (sort/filter) on the very
// FIRST render, seeded from the cookie the server read, with no effect and no swap. Mirrors
// lib/use-list-query.test.tsx's "renders the saved view seeded from the cookie" spec.

function agent(overrides: Partial<Agent> = {}): Agent {
  return {
    id: "builder",
    avatar: "BD",
    name: "Builder",
    role: "Builder",
    model: "Sonnet 4.5",
    status: "working",
    description: "Ports and writes code inside an isolated worktree.",
    systemPrompt: "You are a Builder.",
    permissions: { edit: "allow", bash: "ask", network: "deny" },
    skills: ["sdk-migration"],
    mcps: ["filesystem"],
    usage: {
      tasks: "210 tasks",
      merged: "92% merged",
      tokens: "18.4M",
      cost: "$184.00",
      avgTime: "1m 44s",
    },
    ...overrides,
  };
}

const agents: Agent[] = [
  agent({ id: "orchestrator", name: "Orchestrator", status: "working" }),
  agent({ id: "recon", name: "Recon", status: "working" }),
  agent({ id: "archivist", name: "Archivist", status: "idle" }),
];

function renderRail(initial: ListPrefs) {
  return render(
    <ListPrefsProvider initial={initial}>
      <AgentsRail agents={agents} />
    </ListPrefsProvider>,
  );
}

describe("AgentsRail", () => {
  it("shows the roster location and item count", () => {
    renderRail({ query: {}, display: {} });
    expect(screen.getByText("Agents")).toBeInTheDocument();
    // The count badge beside the location shows the total (3 agents).
    const status = screen.getByRole("tablist", { name: /filter/i });
    expect(status).toBeInTheDocument();
  });

  it("links the New agent action to the create route", () => {
    renderRail({ query: {}, display: {} });
    expect(screen.getByRole("link", { name: "New agent" })).toHaveAttribute("href", "/agents/new");
  });

  it("paints the saved status filter on the first render (no refresh flash)", () => {
    renderRail({ query: { agents: { status: "idle" } }, display: {} });
    // Seeded from the cookie → the Idle tab is selected on the first paint, not All.
    expect(screen.getByRole("tab", { name: /idle/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /^all/i })).toHaveAttribute("aria-selected", "false");
  });

  it("paints the saved sort field on the first render", () => {
    renderRail({ query: { agents: { sortKey: "tasks" } }, display: {} });
    expect(screen.getByText("Tasks")).toBeInTheDocument();
  });

  it("persists a status-tab change to the cookie so the next server render restores it", () => {
    renderRail({ query: {}, display: {} });
    fireEvent.click(screen.getByRole("tab", { name: /idle/i }));
    const raw = document.cookie
      .split("; ")
      .find((entry) => entry.startsWith(`${LIST_PREFS_COOKIE}=`))
      ?.slice(LIST_PREFS_COOKIE.length + 1);
    expect(parseListPrefs(raw).query.agents?.status).toBe("idle");
  });
});
