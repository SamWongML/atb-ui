import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ListPrefs } from "@/lib/list-prefs";
import { ListPrefsProvider } from "@/lib/list-prefs-provider";
import type { Workflow } from "../schema";
import { WorkflowsRail } from "./workflows-rail";

vi.mock("next/navigation", () => ({
  usePathname: () => "/workflows",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

// Seam: the workflows rail server-rendered into the shell @header slot (ADR 0002). The durable
// anti-flash proof — the rail paints the saved filter on the FIRST render, seeded from the cookie.

function workflow(overrides: Partial<Workflow> = {}): Workflow {
  return {
    id: "idem-review",
    name: "idempotency-review",
    description: "Plan → implement → review, then open a PR.",
    trigger: "manual",
    triggerDetail: "or on PR → meridian/api",
    status: "active",
    steps: 3,
    runs: "142",
    success: "98%",
    cost: "$61.20",
    avgTime: "3m 12s",
    lastRun: "2m ago",
    nodes: [{ id: "n1", agent: "BD" }],
    connections: [],
    ...overrides,
  };
}

const workflows: Workflow[] = [
  workflow(),
  workflow({ id: "lint-sweep", name: "lint-sweep", status: "paused" }),
];

function renderRail(initial: ListPrefs) {
  return render(
    <ListPrefsProvider initial={initial}>
      <WorkflowsRail workflows={workflows} />
    </ListPrefsProvider>,
  );
}

describe("WorkflowsRail", () => {
  it("shows the location and links the New workflow action", () => {
    renderRail({ query: {}, display: {} });
    expect(screen.getByText("Workflows")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /new workflow/i })).toHaveAttribute(
      "href",
      "/workflows/new",
    );
  });

  it("paints the saved status filter on the first render (no refresh flash)", () => {
    renderRail({ query: { workflows: { status: "paused" } }, display: {} });
    expect(screen.getByRole("tab", { name: /paused/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /^all/i })).toHaveAttribute("aria-selected", "false");
  });
});
