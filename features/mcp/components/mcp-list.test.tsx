import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { McpServer } from "../schema";
import { McpList } from "./mcp-list";

// Seam: the MCP servers list rendered from server data (CONTEXT.md §Components) — the
// distinctive behavior is surfacing health (healthy/degraded) inline. Roles/text only.

function server(overrides: Partial<McpServer> = {}): McpServer {
  return {
    id: "github",
    name: "github",
    transport: "http",
    status: "healthy",
    latency: "86ms",
    toolCount: 14,
    auth: "GitHub App",
    description: "Repos, PRs, reviews and checks.",
    tools: ["open_pr"],
    secrets: ["GITHUB_APP_ID"],
    usedBy: ["Builder"],
    ...overrides,
  };
}

const servers: McpServer[] = [
  server(),
  server({ id: "slack", name: "slack", status: "degraded", latency: "640ms", toolCount: 6 }),
];

describe("McpList", () => {
  it("links each server to its detail route", () => {
    render(<McpList servers={servers} />);
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute("href", "/mcp/github");
  });

  it("surfaces a degraded server's health state", () => {
    render(<McpList servers={servers} />);
    const slack = screen.getByRole("link", { name: /slack/i });
    expect(within(slack).getByText(/degraded/i)).toBeInTheDocument();
    expect(within(slack).getByText("640ms")).toBeInTheDocument();
  });

  it("offers a Connect server action linking to the create route", () => {
    render(<McpList servers={servers} />);
    expect(screen.getByRole("link", { name: /connect server/i })).toHaveAttribute(
      "href",
      "/mcp/new",
    );
  });

  it("shows an empty state when there are no servers", () => {
    render(<McpList servers={[]} />);
    expect(screen.getByText(/no mcp servers/i)).toBeInTheDocument();
  });
});
