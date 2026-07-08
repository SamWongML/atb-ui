import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Workflow } from "../schema";
import { WorkflowDetail } from "./workflow-detail";

// Seam: the workflow detail view (README.md §Workflows) — trigger detail, lifecycle, step
// count, and the run stats. Roles/text.

const workflow: Workflow = {
  id: "nightly-dep",
  name: "nightly dep-upgrade",
  description: "Survey outdated deps, bump the safe ones, run the suite.",
  trigger: "schedule",
  triggerDetail: "0 3 * * · daily 03:00",
  status: "active",
  steps: 5,
  runs: "30",
  success: "90%",
  cost: "$31.00",
  avgTime: "5m 40s",
  lastRun: "03:46 today",
  nodes: [
    { id: "n1", agent: "RC" },
    { id: "n2", agent: "BD" },
    { id: "n3", agent: "TR" },
  ],
  connections: [
    { from: "n1", to: "n2" },
    { from: "n2", to: "n3" },
  ],
};

describe("WorkflowDetail", () => {
  it("shows the workflow name as a heading", () => {
    render(<WorkflowDetail workflow={workflow} />);
    expect(screen.getByRole("heading", { name: /nightly dep-upgrade/i })).toBeInTheDocument();
  });

  it("shows the trigger detail", () => {
    render(<WorkflowDetail workflow={workflow} />);
    expect(screen.getByText(/daily 03:00/i)).toBeInTheDocument();
  });

  it("shows the run stats", () => {
    render(<WorkflowDetail workflow={workflow} />);
    expect(screen.getByText("90%")).toBeInTheDocument();
    expect(screen.getByText("$31.00")).toBeInTheDocument();
  });

  it("shows the step count", () => {
    render(<WorkflowDetail workflow={workflow} />);
    expect(screen.getByText(/5 steps/i)).toBeInTheDocument();
  });

  it("renders the pipeline agents from its nodes", () => {
    render(<WorkflowDetail workflow={workflow} />);
    expect(screen.getByText("RC")).toBeInTheDocument();
    expect(screen.getByText("TR")).toBeInTheDocument();
  });

  it("offers an Edit action linking to the edit route", () => {
    render(<WorkflowDetail workflow={workflow} />);
    expect(screen.getByRole("link", { name: /edit/i })).toHaveAttribute(
      "href",
      "/workflows/nightly-dep/edit",
    );
  });
});
