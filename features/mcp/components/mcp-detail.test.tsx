import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { McpServer } from "../schema";
import { McpDetail } from "./mcp-detail";

// Seam: the MCP server detail view (README.md §MCP servers) — health + latency, transport,
// auth, exposed tools, required secret names (never values), and consumers. Roles/text.

const server: McpServer = {
  id: "slack",
  name: "slack",
  transport: "http",
  status: "degraded",
  latency: "640ms",
  toolCount: 6,
  auth: "Bot token",
  description: "Notifications and approvals — currently degraded.",
  tools: ["post_message", "open_dm"],
  secrets: ["SLACK_BOT_TOKEN"],
  usedBy: ["Orchestrator"],
};

describe("McpDetail", () => {
  it("shows the server name as a heading", () => {
    render(<McpDetail server={server} />);
    expect(screen.getByRole("heading", { name: /slack/i })).toBeInTheDocument();
  });

  it("surfaces the degraded health state and latency", () => {
    render(<McpDetail server={server} />);
    // The health badge label (capitalized), distinct from the prose description.
    expect(screen.getByText("Degraded")).toBeInTheDocument();
    expect(screen.getByText("640ms")).toBeInTheDocument();
  });

  it("lists the exposed tools", () => {
    render(<McpDetail server={server} />);
    expect(screen.getByText("post_message")).toBeInTheDocument();
    expect(screen.getByText("open_dm")).toBeInTheDocument();
  });

  it("lists the required secret names", () => {
    render(<McpDetail server={server} />);
    expect(screen.getByText("SLACK_BOT_TOKEN")).toBeInTheDocument();
  });

  it("lists the agents that use the server", () => {
    render(<McpDetail server={server} />);
    expect(screen.getByText("Orchestrator")).toBeInTheDocument();
  });

  it("offers an Edit action linking to the edit route", () => {
    render(<McpDetail server={server} />);
    expect(screen.getByRole("link", { name: /edit/i })).toHaveAttribute("href", "/mcp/slack/edit");
  });
});
