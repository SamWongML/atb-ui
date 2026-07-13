import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EMPTY_LIST_PREFS } from "@/lib/list-prefs";
import { ListPrefsProvider } from "@/lib/list-prefs-provider";
import type { McpServer } from "../schema";
import { McpList } from "./mcp-list";

function renderMcp(servers: McpServer[]) {
  return render(
    <ListPrefsProvider initial={EMPTY_LIST_PREFS}>
      <McpList servers={servers} />
    </ListPrefsProvider>,
  );
}

// The card links read the app-router context; mock the next/navigation boundary so the list
// renders standalone.
vi.mock("next/navigation", () => ({
  usePathname: () => "/mcp",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

// Seam: the MCP servers list body rendered from server data (CONTEXT.md §Components) — the
// distinctive behavior is surfacing health (healthy/degraded) inline. Roles/text only. The rail
// lives in the @header slot (mcp-rail.test.tsx).

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
    renderMcp(servers);
    expect(screen.getByRole("link", { name: /github/i })).toHaveAttribute("href", "/mcp/github");
  });

  it("surfaces a degraded server's health state", () => {
    renderMcp(servers);
    const slack = screen.getByRole("link", { name: /slack/i });
    expect(within(slack).getByText(/degraded/i)).toBeInTheDocument();
    expect(within(slack).getByText("640ms")).toBeInTheDocument();
  });

  it("shows an empty state when there are no servers", () => {
    renderMcp([]);
    expect(screen.getByText(/no mcp servers/i)).toBeInTheDocument();
  });
});
