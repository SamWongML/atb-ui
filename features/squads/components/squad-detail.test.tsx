import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Squad } from "../schema";
import { SquadDetail } from "./squad-detail";

// Seam: the squad detail view (README.md §Squads) — mission, target repo, roster (lead +
// members), phase progress, stats, and recent runs. Roles/text.

const squad: Squad = {
  id: "auth-migration",
  name: "Auth Migration Squad",
  status: "active",
  lead: "OR",
  members: ["RC", "BD", "SR"],
  mission: "Migrate auth module",
  repo: "meridian/api",
  phase: "Verify",
  stepsDone: 3,
  stepsTotal: 5,
  description: "Ports the legacy auth stack onto the v2 SDK.",
  runs: "34 runs",
  merged: "92% merged",
  tokens: "48.6M",
  cost: "$486.00",
  avgTime: "18m 20s",
  schedule: "On demand",
  lastRun: "running now",
  recentRuns: [
    { id: "run-4821", title: "Migrate auth module · verify phase", when: "now", status: "running" },
    { id: "run-4802", title: "Port session store to v2 SDK", when: "2h ago", status: "merged" },
  ],
};

describe("SquadDetail", () => {
  it("shows the squad name as a heading", () => {
    render(<SquadDetail squad={squad} />);
    expect(screen.getByRole("heading", { name: /auth migration squad/i })).toBeInTheDocument();
  });

  it("shows the mission and target repo", () => {
    render(<SquadDetail squad={squad} />);
    // The mission also appears in a run title, so assert it is present at least once.
    expect(screen.getAllByText(/migrate auth module/i).length).toBeGreaterThan(0);
    expect(screen.getByText("meridian/api")).toBeInTheDocument();
  });

  it("shows the recent runs", () => {
    render(<SquadDetail squad={squad} />);
    expect(screen.getByText(/port session store to v2 sdk/i)).toBeInTheDocument();
  });

  it("shows the squad stats", () => {
    render(<SquadDetail squad={squad} />);
    expect(screen.getByText("$486.00")).toBeInTheDocument();
    expect(screen.getByText("92% merged")).toBeInTheDocument();
  });

  it("offers an Edit action linking to the edit route", () => {
    render(<SquadDetail squad={squad} />);
    expect(screen.getByRole("link", { name: /edit/i })).toHaveAttribute(
      "href",
      "/squads/auth-migration/edit",
    );
  });
});
