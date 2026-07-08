import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Skill } from "../schema";
import { SkillDetail } from "./skill-detail";

// Seam: the skill detail view (README.md §Skills) — summary, instruction steps, allowed
// tools, and the version history. Roles/text.

const skill: Skill = {
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
  steps: ["Read the repo manifest to pick the runner.", "Run changed-file tests first."],
  usedBy: 4,
  invocations: "1,204",
  updated: "3 days ago",
  versionHistory: [
    { version: "v1.4", when: "3 days ago", note: "Detect go test runners" },
    { version: "v1.0", when: "2 months ago", note: "Initial release" },
  ],
};

describe("SkillDetail", () => {
  it("shows the skill name as a heading", () => {
    render(<SkillDetail skill={skill} />);
    expect(screen.getByRole("heading", { name: /test runner/i })).toBeInTheDocument();
  });

  it("shows the instruction steps", () => {
    render(<SkillDetail skill={skill} />);
    expect(screen.getByText(/pick the runner/i)).toBeInTheDocument();
    expect(screen.getByText(/changed-file tests first/i)).toBeInTheDocument();
  });

  it("lists the allowed tools", () => {
    render(<SkillDetail skill={skill} />);
    expect(screen.getByText("Bash")).toBeInTheDocument();
  });

  it("shows the version history with notes", () => {
    render(<SkillDetail skill={skill} />);
    expect(screen.getByText(/detect go test runners/i)).toBeInTheDocument();
    expect(screen.getByText(/initial release/i)).toBeInTheDocument();
  });

  it("offers an Edit action linking to the edit route", () => {
    render(<SkillDetail skill={skill} />);
    expect(screen.getByRole("link", { name: /edit/i })).toHaveAttribute(
      "href",
      "/skills/test-runner/edit",
    );
  });
});
