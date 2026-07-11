import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Squad } from "../schema";
import { SquadsList } from "./squads-list";

// The list renders the shared <ListRail>, which reads the route; mock the
// next/navigation boundary so the list renders standalone.
vi.mock("next/navigation", () => ({
  usePathname: () => "/squads",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

// Seam: the squads list rendered from server data (CONTEXT.md §Components) — agent teams
// with a lead, mission, phase and progress. Roles/text only.

function squad(overrides: Partial<Squad> = {}): Squad {
  return {
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
    recentRuns: [],
    ...overrides,
  };
}

const squads: Squad[] = [
  squad(),
  squad({
    id: "platform-maintenance",
    name: "Platform Maintenance",
    status: "idle",
    phase: "Idle",
  }),
];

describe("SquadsList", () => {
  it("links each squad to its detail route", () => {
    render(<SquadsList squads={squads} />);
    expect(screen.getByRole("link", { name: /auth migration squad/i })).toHaveAttribute(
      "href",
      "/squads/auth-migration",
    );
  });

  it("shows each squad's mission and status", () => {
    render(<SquadsList squads={squads} />);
    const active = screen.getByRole("link", { name: /auth migration squad/i });
    expect(within(active).getByText(/migrate auth module/i)).toBeInTheDocument();
    expect(within(active).getByText(/active/i)).toBeInTheDocument();
  });

  it("shows the squad's phase progress", () => {
    render(<SquadsList squads={squads} />);
    const active = screen.getByRole("link", { name: /auth migration squad/i });
    expect(within(active).getByText(/3\/5/)).toBeInTheDocument();
  });

  it("offers a New squad action linking to the create route", () => {
    render(<SquadsList squads={squads} />);
    expect(screen.getByRole("link", { name: /new squad/i })).toHaveAttribute("href", "/squads/new");
  });

  it("shows an empty state when there are no squads", () => {
    render(<SquadsList squads={[]} />);
    expect(screen.getByText(/no squads/i)).toBeInTheDocument();
  });
});
