import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AppNotFound from "./not-found";

// Seam: the in-shell 404's accessible surface. A segment that throws notFound() (e.g. a detail
// page for a since-deleted entity) must land the user on a sane recovery view with a way back,
// not a blank frame. The framework wiring that selects this boundary is Next's; this asserts the
// UI a user actually sees.
describe("AppNotFound", () => {
  it("renders a recovery surface linking back to overview", () => {
    render(<AppNotFound />);
    expect(screen.getByText(/couldn't find that/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to overview/i })).toHaveAttribute(
      "href",
      "/overview",
    );
  });
});
