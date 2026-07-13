import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ListPrefs } from "@/lib/list-prefs";
import { ListPrefsProvider } from "@/lib/list-prefs-provider";
import type { McpServer } from "../schema";
import { McpRail } from "./mcp-rail";

vi.mock("next/navigation", () => ({
  usePathname: () => "/mcp",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

// Seam: the MCP servers rail server-rendered into the shell @header slot (ADR 0002). The durable
// anti-flash proof — the rail paints the saved health filter on the FIRST render, from the cookie.

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

const servers: McpServer[] = [server(), server({ id: "slack", name: "slack", status: "degraded" })];

function renderRail(initial: ListPrefs) {
  return render(
    <ListPrefsProvider initial={initial}>
      <McpRail servers={servers} />
    </ListPrefsProvider>,
  );
}

describe("McpRail", () => {
  it("shows the location and links the Connect server action", () => {
    renderRail({ query: {}, display: {} });
    expect(screen.getByText("MCP servers")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /connect server/i })).toHaveAttribute(
      "href",
      "/mcp/new",
    );
  });

  it("paints the saved health filter on the first render (no refresh flash)", () => {
    renderRail({ query: { mcp: { status: "degraded" } }, display: {} });
    expect(screen.getByRole("tab", { name: /degraded/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /^all/i })).toHaveAttribute("aria-selected", "false");
  });
});
