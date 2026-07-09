import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Analytics } from "../schema";
import { AnalyticsDashboard } from "./analytics-dashboard";

// Seam: the analytics dashboard rendered from server data (CONTEXT.md §Components). The
// tested surface is the accessible text — KPI tiles and the model-mix legend — not the
// (decorative, aria-hidden) Recharts SVG. Roles/text only.

const data: Analytics = {
  totalCost: 253.2,
  totalRuns: 434,
  costSeries: [
    { label: "Mon", cost: 28.1 },
    { label: "Tue", cost: 41.5 },
  ],
  modelMix: [
    { model: "claude-opus-4-8", runs: 128, cost: 182.4 },
    { model: "claude-sonnet-5", runs: 96, cost: 58.2 },
    { model: "claude-haiku-4-5", runs: 210, cost: 12.6 },
  ],
};

describe("AnalyticsDashboard", () => {
  it("headlines total spend, runs, and average per run", () => {
    render(<AnalyticsDashboard data={data} />);
    expect(screen.getByText("$253.20")).toBeInTheDocument();
    expect(screen.getByText("434")).toBeInTheDocument();
    // 253.20 / 434 = $0.58 per run.
    expect(screen.getByText("$0.58")).toBeInTheDocument();
  });

  it("lists each model in the mix with its run share and cost", () => {
    render(<AnalyticsDashboard data={data} />);
    expect(screen.getByText("claude-opus-4-8")).toBeInTheDocument();
    expect(screen.getByText("$182.40")).toBeInTheDocument();
    // 128 of 434 runs ≈ 29%.
    expect(screen.getByText("29%")).toBeInTheDocument();
    expect(screen.getByText("claude-haiku-4-5")).toBeInTheDocument();
  });

  it("labels the cost and model-mix sections", () => {
    render(<AnalyticsDashboard data={data} />);
    expect(screen.getByRole("heading", { name: /cost over time/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /model mix/i })).toBeInTheDocument();
  });
});
