import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { OverviewSummary } from "../schema";
import { OverviewHome } from "./overview-home";

// Seam: the overview home rendered from the composed BFF summary (CONTEXT.md §Components) —
// headline stats, the activity feed, recent failures, and the model mix. Roles/text only.

function summary(overrides: Partial<OverviewSummary> = {}): OverviewSummary {
  return {
    stats: [
      { label: "Active sessions", value: "1" },
      { label: "Runs · 7d", value: "434" },
      { label: "Spend · 7d", value: "$253.20" },
      { label: "Degraded servers", value: "1" },
    ],
    activity: [
      {
        id: "run_01",
        title: "pr-review autopilot",
        status: "running",
        meta: "claude-opus-4-8 · just now",
        href: "/runs/run_01",
      },
      {
        id: "run_02",
        title: "nightly dep-upgrade",
        status: "failed",
        meta: "claude-sonnet-5 · 12m ago",
        href: "/runs/run_02",
      },
    ],
    failures: [
      {
        id: "run_02",
        title: "nightly dep-upgrade",
        rootCause: "Type error after bumping zod — three call sites broke.",
        href: "/runs/run_02",
      },
    ],
    modelMix: [
      { model: "claude-opus-4-8", share: 29 },
      { model: "claude-haiku-4-5", share: 48 },
    ],
    ...overrides,
  };
}

describe("OverviewHome", () => {
  it("surfaces the headline stats", () => {
    render(<OverviewHome summary={summary()} />);
    expect(screen.getByText(/active sessions/i)).toBeInTheDocument();
    expect(screen.getByText("434")).toBeInTheDocument();
    expect(screen.getByText("$253.20")).toBeInTheDocument();
  });

  it("links each activity entry to its run", () => {
    render(<OverviewHome summary={summary()} />);
    expect(screen.getByRole("link", { name: /pr-review autopilot/i })).toHaveAttribute(
      "href",
      "/runs/run_01",
    );
  });

  it("surfaces recent failures with their root cause", () => {
    render(<OverviewHome summary={summary()} />);
    expect(screen.getByText(/three call sites broke/i)).toBeInTheDocument();
  });

  it("shows the model mix with each model's share", () => {
    render(<OverviewHome summary={summary()} />);
    expect(screen.getByText("claude-opus-4-8")).toBeInTheDocument();
    expect(screen.getByText("29%")).toBeInTheDocument();
  });

  it("shows a clear note when there are no recent failures", () => {
    render(<OverviewHome summary={summary({ failures: [] })} />);
    expect(screen.getByText(/no recent failures/i)).toBeInTheDocument();
  });
});
