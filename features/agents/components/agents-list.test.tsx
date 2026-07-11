import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Agent } from "../schema";
import { AgentsList } from "./agents-list";

// Seam: the agents roster rendered from server data (CONTEXT.md §Components) — asserted
// through roles/text, never structure. The RSC page passes `agents`; this component lays
// them out as cards that link to each agent's detail route.

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

describe("AgentsList", () => {
  it("links each agent card to its detail route", () => {
    render(<AgentsList agents={agents} />);
    expect(screen.getByRole("link", { name: /orchestrator/i })).toHaveAttribute(
      "href",
      "/agents/orchestrator",
    );
  });

  it("shows each agent's role and model", () => {
    render(<AgentsList agents={agents} />);
    const card = screen.getByRole("link", { name: /recon/i });
    // Role and model share one line ("Explorer · Haiku 4.5"), so match on substrings.
    expect(within(card).getByText(/Explorer/)).toBeInTheDocument();
    expect(within(card).getByText(/Haiku 4\.5/)).toBeInTheDocument();
  });

  it("offers a New agent action linking to the create route", () => {
    render(<AgentsList agents={agents} />);
    // Exact name targets the header CTA; the grid's "Define a new agent" card also links here.
    expect(screen.getByRole("link", { name: "New agent" })).toHaveAttribute("href", "/agents/new");
  });

  it("shows an empty state when there are no agents", () => {
    render(<AgentsList agents={[]} />);
    expect(screen.getByText(/no agents/i)).toBeInTheDocument();
  });
});
