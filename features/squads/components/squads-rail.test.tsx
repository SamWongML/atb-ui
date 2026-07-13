import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ListPrefs } from "@/lib/list-prefs";
import { ListPrefsProvider } from "@/lib/list-prefs-provider";
import type { Squad } from "../schema";
import { SquadsRail } from "./squads-rail";

vi.mock("next/navigation", () => ({
  usePathname: () => "/squads",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

// Seam: the squads rail server-rendered into the shell @header slot (ADR 0002). The durable
// anti-flash proof — the rail paints the saved filter on the FIRST render, seeded from the cookie.

function squad(overrides: Partial<Squad> = {}): Squad {
  return {
    id: "auth-migration",
    name: "Auth Migration Squad",
    status: "active",
    lead: "OR",
    members: ["RC", "BD"],
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

const squads: Squad[] = [squad(), squad({ id: "platform", name: "Platform", status: "idle" })];

function renderRail(initial: ListPrefs) {
  return render(
    <ListPrefsProvider initial={initial}>
      <SquadsRail squads={squads} />
    </ListPrefsProvider>,
  );
}

describe("SquadsRail", () => {
  it("shows the location and links the New squad action", () => {
    renderRail({ query: {}, display: {} });
    expect(screen.getByText("Squads")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /new squad/i })).toHaveAttribute("href", "/squads/new");
  });

  it("paints the saved status filter on the first render (no refresh flash)", () => {
    renderRail({ query: { squads: { status: "idle" } }, display: {} });
    expect(screen.getByRole("tab", { name: /idle/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /^all/i })).toHaveAttribute("aria-selected", "false");
  });
});
