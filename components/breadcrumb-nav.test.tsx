import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { BreadcrumbNav } from "./breadcrumb-nav";

// Seam: the breadcrumb's public output. The section is derived from the current
// route (the shared nav model); when viewing an entity, the section becomes a link
// and the entity is a switcher of siblings. Assert through roles/aria, not internals.

const entity = {
  label: "Refactor auth module",
  currentId: "sess_01",
  siblings: [
    { id: "sess_01", label: "Refactor auth module", href: "/sessions/sess_01" as const },
    { id: "sess_02", label: "Migrate Postgres schema", href: "/sessions/sess_02" as const },
  ],
};

describe("BreadcrumbNav", () => {
  it("renders a breadcrumb landmark", () => {
    render(<BreadcrumbNav pathname="/sessions" />);
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
  });

  it("shows the current section as the current page when there is no entity", () => {
    render(<BreadcrumbNav pathname="/sessions" />);
    expect(screen.getByText("Sessions")).toHaveAttribute("aria-current", "page");
  });

  it("links the section back to its list when an entity is in view", () => {
    render(<BreadcrumbNav pathname="/sessions/sess_01" entity={entity} />);
    expect(screen.getByRole("link", { name: /sessions/i })).toHaveAttribute("href", "/sessions");
  });

  it("presents the current entity as a switcher trigger", () => {
    render(<BreadcrumbNav pathname="/sessions/sess_01" entity={entity} />);
    expect(screen.getByRole("button", { name: /refactor auth module/i })).toBeInTheDocument();
  });

  it("lists sibling entities as navigable links when opened", async () => {
    const user = userEvent.setup();
    render(<BreadcrumbNav pathname="/sessions/sess_01" entity={entity} />);
    await user.click(screen.getByRole("button", { name: /refactor auth module/i }));
    expect(
      await screen.findByRole("menuitem", { name: /migrate postgres schema/i }),
    ).toHaveAttribute("href", "/sessions/sess_02");
  });
});
