import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Run } from "../schema";
import { RunDetail } from "./run-detail";

// Seam: the run detail view (CONTEXT.md §Components) — a run's provenance, timing, cost, and,
// for a failure, its root cause. Roles/text only. Props from the RSC page.

function run(overrides: Partial<Run> = {}): Run {
  return {
    id: "run_02",
    source: "nightly dep-upgrade",
    status: "failed",
    model: "claude-sonnet-5",
    startedAt: "12m ago",
    duration: "5m 40s",
    cost: "$0.31",
    steps: { completed: 4, total: 5 },
    rootCause: "Type error after bumping zod — three call sites broke.",
    ...overrides,
  };
}

describe("RunDetail", () => {
  it("shows the run's source and status", () => {
    render(<RunDetail run={run()} />);
    expect(screen.getByRole("heading", { name: /nightly dep-upgrade/i })).toBeInTheDocument();
    expect(screen.getByText(/failed/i)).toBeInTheDocument();
  });

  it("surfaces the root cause of a failed run", () => {
    render(<RunDetail run={run()} />);
    expect(screen.getByText(/root cause/i)).toBeInTheDocument();
    expect(screen.getByText(/three call sites broke/i)).toBeInTheDocument();
  });

  it("shows no root cause section for a passed run", () => {
    render(<RunDetail run={run({ status: "passed", rootCause: null })} />);
    expect(screen.queryByText(/root cause/i)).not.toBeInTheDocument();
  });

  it("shows the run's cost, duration, and model", () => {
    render(<RunDetail run={run()} />);
    expect(screen.getByText("$0.31")).toBeInTheDocument();
    expect(screen.getByText("5m 40s")).toBeInTheDocument();
    expect(screen.getByText("claude-sonnet-5")).toBeInTheDocument();
  });
});
