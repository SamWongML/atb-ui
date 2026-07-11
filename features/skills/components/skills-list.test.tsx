import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Skill } from "../schema";
import { SkillsList } from "./skills-list";

// The list renders the shared <ListRail>, which reads the route; mock the
// next/navigation boundary so the list renders standalone.
vi.mock("next/navigation", () => ({
  usePathname: () => "/skills",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn(), back: vi.fn() }),
}));

// Seam: the skills list rendered from server data (CONTEXT.md §Components) — versioned
// capability packages with a lifecycle status. Roles/text only.

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

const skills: Skill[] = [
  skill(),
  skill({
    id: "changelog",
    name: "Changelog",
    slug: "changelog",
    version: "v1.2",
    status: "draft",
  }),
];

describe("SkillsList", () => {
  it("links each skill to its detail route", () => {
    render(<SkillsList skills={skills} />);
    expect(screen.getByRole("link", { name: /test runner/i })).toHaveAttribute(
      "href",
      "/skills/test-runner",
    );
  });

  it("shows each skill's version and status", () => {
    render(<SkillsList skills={skills} />);
    const draft = screen.getByRole("link", { name: /changelog/i });
    expect(within(draft).getByText("v1.2")).toBeInTheDocument();
    expect(within(draft).getByText(/draft/i)).toBeInTheDocument();
  });

  it("offers a New skill action linking to the create route", () => {
    render(<SkillsList skills={skills} />);
    expect(screen.getByRole("link", { name: /new skill/i })).toHaveAttribute("href", "/skills/new");
  });

  it("shows an empty state when there are no skills", () => {
    render(<SkillsList skills={[]} />);
    expect(screen.getByText(/no skills/i)).toBeInTheDocument();
  });
});
