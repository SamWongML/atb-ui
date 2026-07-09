import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Sandbox } from "../schema";
import { SandboxesList } from "./sandboxes-list";

// Seam: the sandboxes list rendered from server data (CONTEXT.md §Components) — compute
// environments with their status surfaced inline. Roles/text only.

function sandbox(overrides: Partial<Sandbox> = {}): Sandbox {
  return {
    id: "meridian-api-sbx",
    name: "meridian-api-sbx",
    status: "running",
    image: "node-22-bookworm",
    resources: "4 vCPU · 8 GB",
    region: "us-east-1",
    uptime: "3h 12m",
    repo: "meridian/api",
    usedBy: ["BD", "SR"],
    ...overrides,
  };
}

const sandboxes: Sandbox[] = [
  sandbox(),
  sandbox({ id: "infra-plan-sbx", name: "infra-plan-sbx", status: "stopped", usedBy: [] }),
];

describe("SandboxesList", () => {
  it("links each sandbox to its detail route", () => {
    render(<SandboxesList sandboxes={sandboxes} />);
    expect(screen.getByRole("link", { name: /meridian-api-sbx/i })).toHaveAttribute(
      "href",
      "/sandboxes/meridian-api-sbx",
    );
  });

  it("shows each sandbox's status and resources", () => {
    render(<SandboxesList sandboxes={sandboxes} />);
    const card = screen.getByRole("link", { name: /infra-plan-sbx/i });
    expect(within(card).getByText(/stopped/i)).toBeInTheDocument();
    const running = screen.getByRole("link", { name: /meridian-api-sbx/i });
    expect(within(running).getByText(/4 vCPU/i)).toBeInTheDocument();
  });

  it("shows an empty state when there are no sandboxes", () => {
    render(<SandboxesList sandboxes={[]} />);
    expect(screen.getByText(/no sandboxes/i)).toBeInTheDocument();
  });
});
