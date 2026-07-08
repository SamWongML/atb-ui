import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SidebarNav } from "./sidebar-nav";

// Seam (CONTEXT.md §Components): render via RTL, assert on roles/text — the public
// output — never internal structure. SidebarNav is presentational: it takes the
// current pathname and the live session count as props, so active state and the
// badge are pure inputs (the container wires usePathname + the sessions query).

describe("SidebarNav", () => {
  it("renders every primary navigation surface as a link", () => {
    render(<SidebarNav pathname="/overview" />);
    for (const name of [
      "Overview",
      "Sessions",
      "Runs",
      "Workflows",
      "Agents",
      "Skills",
      "MCP servers",
      "Sandboxes",
      "Analytics",
    ]) {
      expect(screen.getByRole("link", { name: new RegExp(name, "i") })).toBeInTheDocument();
    }
  });

  it("points each nav item at its route", () => {
    render(<SidebarNav pathname="/overview" />);
    expect(screen.getByRole("link", { name: /sessions/i })).toHaveAttribute("href", "/sessions");
    expect(screen.getByRole("link", { name: /mcp servers/i })).toHaveAttribute("href", "/mcp");
  });

  it("marks the item matching the current path as the current page", () => {
    render(<SidebarNav pathname="/sessions/sess_01" />);
    expect(screen.getByRole("link", { name: /sessions/i })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: /overview/i })).not.toHaveAttribute("aria-current");
  });

  it("groups the surfaces under Workspace / Build / Runtime", () => {
    render(<SidebarNav pathname="/overview" />);
    expect(screen.getByText("Workspace")).toBeInTheDocument();
    expect(screen.getByText("Build")).toBeInTheDocument();
    expect(screen.getByText("Runtime")).toBeInTheDocument();
  });

  it("offers the New session CTA", () => {
    render(<SidebarNav pathname="/overview" />);
    expect(screen.getByRole("button", { name: /new session/i })).toBeInTheDocument();
  });

  it("shows the live session count beside Sessions", () => {
    render(<SidebarNav pathname="/overview" sessionCount={4} />);
    expect(screen.getByRole("link", { name: /sessions/i })).toHaveTextContent("4");
  });
});
