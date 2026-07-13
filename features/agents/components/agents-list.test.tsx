import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EMPTY_LIST_PREFS } from "@/lib/list-prefs";
import { ListPrefsProvider } from "@/lib/list-prefs-provider";
import type { Agent } from "../schema";
import { AgentsList } from "./agents-list";

// The card links read the app-router context; mock the next/navigation boundary so the roster
// renders standalone.
vi.mock("next/navigation", () => ({
  usePathname: () => "/agents",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

// Seam: the agents roster body rendered from server data (CONTEXT.md §Components) — asserted
// through roles/text, never structure. The rail (search · filter · sort · New) now lives in the
// @header slot and is covered by agents-rail.test.tsx.

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
  agent({
    id: "orchestrator",
    avatar: "OR",
    name: "Orchestrator",
    role: "Orchestrator",
    model: "Opus 4.8",
  }),
  agent({ id: "recon", avatar: "RC", name: "Recon", role: "Explorer", model: "Haiku 4.5" }),
];

function renderAgents(items: Agent[]) {
  return render(
    <ListPrefsProvider initial={EMPTY_LIST_PREFS}>
      <AgentsList agents={items} />
    </ListPrefsProvider>,
  );
}

describe("AgentsList", () => {
  it("links each agent card to its detail route", () => {
    renderAgents(agents);
    expect(screen.getByRole("link", { name: /orchestrator/i })).toHaveAttribute(
      "href",
      "/agents/orchestrator",
    );
  });

  it("shows each agent's role and model", () => {
    renderAgents(agents);
    const card = screen.getByRole("link", { name: /recon/i });
    // Role and model share one line ("Explorer · Haiku 4.5"), so match on substrings.
    expect(within(card).getByText(/Explorer/)).toBeInTheDocument();
    expect(within(card).getByText(/Haiku 4\.5/)).toBeInTheDocument();
  });

  it("shows an empty state when there are no agents", () => {
    renderAgents([]);
    expect(screen.getByText(/no agents/i)).toBeInTheDocument();
  });
});
