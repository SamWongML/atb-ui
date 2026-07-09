import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Sandbox } from "../schema";
import { SandboxDetail } from "./sandbox-detail";

// Seam: the sandbox detail view (CONTEXT.md §Components) — a compute environment's image,
// resources, region, uptime, and the agents running inside it. Roles/text only.

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

describe("SandboxDetail", () => {
  it("shows the sandbox's name and status", () => {
    render(<SandboxDetail sandbox={sandbox()} />);
    expect(screen.getByRole("heading", { name: /meridian-api-sbx/i })).toBeInTheDocument();
    expect(screen.getByText(/running/i)).toBeInTheDocument();
  });

  it("shows the image, resources, region, and uptime", () => {
    render(<SandboxDetail sandbox={sandbox()} />);
    expect(screen.getByText("node-22-bookworm")).toBeInTheDocument();
    expect(screen.getByText("4 vCPU · 8 GB")).toBeInTheDocument();
    expect(screen.getByText("us-east-1")).toBeInTheDocument();
    expect(screen.getByText("3h 12m")).toBeInTheDocument();
  });

  it("lists the agents running inside it", () => {
    render(<SandboxDetail sandbox={sandbox()} />);
    expect(screen.getByText("BD")).toBeInTheDocument();
    expect(screen.getByText("SR")).toBeInTheDocument();
  });

  it("shows an empty occupancy note when no agents are running", () => {
    render(<SandboxDetail sandbox={sandbox({ status: "stopped", usedBy: [] })} />);
    expect(screen.getByText(/no agents/i)).toBeInTheDocument();
  });
});
