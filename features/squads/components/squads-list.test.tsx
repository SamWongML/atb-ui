import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EMPTY_LIST_PREFS } from "@/lib/list-prefs";
import { ListPrefsProvider } from "@/lib/list-prefs-provider";
import type { Squad } from "../schema";
import { SquadsList } from "./squads-list";

function renderSquads(squads: Squad[]) {
  return render(
    <ListPrefsProvider initial={EMPTY_LIST_PREFS}>
      <SquadsList squads={squads} />
    </ListPrefsProvider>,
  );
}

// The card links read the app-router context; mock the next/navigation boundary so the list
// renders standalone.
vi.mock("next/navigation", () => ({
  usePathname: () => "/squads",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

// Seam: the squads list body rendered from server data (CONTEXT.md §Components) — agent teams
// with a lead, mission, phase and progress. Roles/text only. The rail lives in the @header slot
// (squads-rail.test.tsx).

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
    renderSquads(squads);
    expect(screen.getByRole("link", { name: /auth migration squad/i })).toHaveAttribute(
      "href",
      "/squads/auth-migration",
    );
  });

  it("shows each squad's mission and status", () => {
    renderSquads(squads);
    const active = screen.getByRole("link", { name: /auth migration squad/i });
    expect(within(active).getByText(/migrate auth module/i)).toBeInTheDocument();
    expect(within(active).getByText(/active/i)).toBeInTheDocument();
  });

  it("shows the squad's phase progress", () => {
    renderSquads(squads);
    const active = screen.getByRole("link", { name: /auth migration squad/i });
    expect(within(active).getByText(/3\/5/)).toBeInTheDocument();
  });

  it("shows an empty state when there are no squads", () => {
    renderSquads([]);
    expect(screen.getByText(/no squads/i)).toBeInTheDocument();
  });
});
