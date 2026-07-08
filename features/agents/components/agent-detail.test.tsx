import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Agent } from "../schema";
import { AgentDetail } from "./agent-detail";

// Seam: the agent detail view (README.md §Agents) — permission chips, attached skills &
// MCPs, usage, and the full system prompt. Asserted through roles/text.

const agent: Agent = {
  id: "builder",
  avatar: "BD",
  name: "Builder",
  role: "Builder",
  model: "Sonnet 4.5",
  status: "working",
  description: "Ports and writes code inside an isolated worktree.",
  systemPrompt: "You are a Builder. Keep diffs minimal and reversible.",
  permissions: { edit: "allow", bash: "ask", network: "deny" },
  skills: ["sdk-migration", "api-conventions"],
  mcps: ["filesystem", "postgres"],
  usage: {
    tasks: "210 tasks",
    merged: "92% merged",
    tokens: "18.4M",
    cost: "$184.00",
    avgTime: "1m 44s",
  },
};

describe("AgentDetail", () => {
  it("shows the agent name as a heading", () => {
    render(<AgentDetail agent={agent} />);
    expect(screen.getByRole("heading", { name: /builder/i })).toBeInTheDocument();
  });

  it("shows each permission class with its granted level", () => {
    render(<AgentDetail agent={agent} />);
    const edit = screen.getByRole("group", { name: /edit permission/i });
    expect(within(edit).getByText("allow")).toBeInTheDocument();

    const network = screen.getByRole("group", { name: /network permission/i });
    expect(within(network).getByText("deny")).toBeInTheDocument();
  });

  it("lists the attached skills and MCP servers", () => {
    render(<AgentDetail agent={agent} />);
    expect(screen.getByText("sdk-migration")).toBeInTheDocument();
    expect(screen.getByText("filesystem")).toBeInTheDocument();
  });

  it("shows the full system prompt", () => {
    render(<AgentDetail agent={agent} />);
    expect(screen.getByText(/keep diffs minimal and reversible/i)).toBeInTheDocument();
  });

  it("shows usage stats", () => {
    render(<AgentDetail agent={agent} />);
    expect(screen.getByText("$184.00")).toBeInTheDocument();
    expect(screen.getByText("210 tasks")).toBeInTheDocument();
  });

  it("offers an Edit action linking to the edit route", () => {
    render(<AgentDetail agent={agent} />);
    expect(screen.getByRole("link", { name: /edit/i })).toHaveAttribute(
      "href",
      "/agents/builder/edit",
    );
  });
});
