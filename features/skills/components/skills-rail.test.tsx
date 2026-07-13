import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { ListPrefs } from "@/lib/list-prefs";
import { ListPrefsProvider } from "@/lib/list-prefs-provider";
import type { Skill } from "../schema";
import { SkillsRail } from "./skills-rail";

vi.mock("next/navigation", () => ({
  usePathname: () => "/skills",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

// Seam: the skills rail server-rendered into the shell @header slot (ADR 0002). The durable
// anti-flash proof — the rail paints the saved filter on the FIRST render, seeded from the cookie.

function skill(overrides: Partial<Skill> = {}): Skill {
  return {
    id: "test-runner",
    name: "Test Runner",
    slug: "test-runner",
    category: "testing",
    description: "Run the suite, summarize failures",
    summary: "Detects the test command and summarizes failures.",
    version: "v1.4",
    status: "active",
    author: "Jules",
    tools: ["Bash", "Read"],
    steps: ["Pick the runner."],
    usedBy: 4,
    invocations: "1,204",
    updated: "3 days ago",
    versionHistory: [{ version: "v1.4", when: "3 days ago", note: "Detect go test" }],
    ...overrides,
  };
}

const skills: Skill[] = [skill(), skill({ id: "changelog", name: "Changelog", status: "draft" })];

function renderRail(initial: ListPrefs) {
  return render(
    <ListPrefsProvider initial={initial}>
      <SkillsRail skills={skills} />
    </ListPrefsProvider>,
  );
}

describe("SkillsRail", () => {
  it("shows the location and links the New skill action", () => {
    renderRail({ query: {}, display: {} });
    expect(screen.getByText("Skills")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /new skill/i })).toHaveAttribute("href", "/skills/new");
  });

  it("paints the saved status filter on the first render (no refresh flash)", () => {
    renderRail({ query: { skills: { status: "draft" } }, display: {} });
    expect(screen.getByRole("tab", { name: /draft/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /^all/i })).toHaveAttribute("aria-selected", "false");
  });
});
