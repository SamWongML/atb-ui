import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Workflow } from "../schema";
import { WorkflowsList } from "./workflows-list";

// The list renders the shared <ListRail>, which reads the route; mock the
// next/navigation boundary so the list renders standalone (no PageChromeProvider →
// <PageHeader> renders the rail inline).
vi.mock("next/navigation", () => ({
  usePathname: () => "/workflows",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

// Seam: the workflows list rendered from server data (CONTEXT.md §Components) — multi-agent
// pipelines with a trigger and lifecycle status. Roles/text only.

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
    nodes: [
      { id: "n1", agent: "BD" },
      { id: "n2", agent: "SR" },
    ],
    connections: [{ from: "n1", to: "n2" }],
    ...overrides,
  };
}

const workflows: Workflow[] = [
  workflow(),
  workflow({ id: "lint-sweep", name: "lint-sweep", trigger: "schedule", status: "paused" }),
];

describe("WorkflowsList", () => {
  it("links each workflow to its detail route", () => {
    render(<WorkflowsList workflows={workflows} />);
    expect(screen.getByRole("link", { name: /idempotency-review/i })).toHaveAttribute(
      "href",
      "/workflows/idem-review",
    );
  });

  it("shows each workflow's trigger and status", () => {
    render(<WorkflowsList workflows={workflows} />);
    const paused = screen.getByRole("link", { name: /lint-sweep/i });
    expect(within(paused).getByText(/schedule/i)).toBeInTheDocument();
    expect(within(paused).getByText(/paused/i)).toBeInTheDocument();
  });

  it("offers a New workflow action linking to the create route", () => {
    render(<WorkflowsList workflows={workflows} />);
    expect(screen.getByRole("link", { name: /new workflow/i })).toHaveAttribute(
      "href",
      "/workflows/new",
    );
  });

  it("shows an empty state when there are no workflows", () => {
    render(<WorkflowsList workflows={[]} />);
    expect(screen.getByText(/no workflows/i)).toBeInTheDocument();
  });
});
