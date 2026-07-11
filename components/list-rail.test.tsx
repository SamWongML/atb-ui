import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ListRail } from "./list-rail";

// ListRail reads the route for its location + back affordance; mock the boundary.
const back = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({
  usePathname: () => "/agents",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn(), back }),
}));

function setup(overrides: Partial<Parameters<typeof ListRail>[0]> = {}) {
  const onChangeStatus = vi.fn();
  const onChangeSort = vi.fn();
  const onToggleDir = vi.fn();
  const onChangeSearch = vi.fn();
  render(
    <ListRail
      count={7}
      filter={{
        options: [
          { value: "all", label: "All" },
          { value: "working", label: "Working" },
        ],
        value: "all",
        onChange: onChangeStatus,
        counts: { all: 7, working: 3 },
        ariaLabel: "Filter by status",
      }}
      sort={{
        fields: [
          { key: "status", label: "Status" },
          { key: "name", label: "Name" },
        ],
        value: "status",
        onChange: onChangeSort,
        dir: "asc",
        onToggleDir,
      }}
      search={{ value: "", onChange: onChangeSearch, placeholder: "Search agents…" }}
      newButton={{ href: "/agents/new", label: "New agent" }}
      {...overrides}
    />,
  );
  return { onChangeStatus, onChangeSort, onToggleDir, onChangeSearch };
}

describe("ListRail", () => {
  it("shows the location from the route with the count", () => {
    setup();
    const crumb = screen.getByRole("navigation", { name: /breadcrumb/i });
    expect(crumb).toHaveTextContent("Build");
    expect(crumb).toHaveTextContent("Agents");
    expect(crumb).toHaveTextContent("7");
  });

  it("goes back through the router", async () => {
    setup();
    await userEvent.click(screen.getByRole("button", { name: /back/i }));
    expect(back).toHaveBeenCalled();
  });

  it("renders the status filter as counted tabs and reports selection", async () => {
    const { onChangeStatus } = setup();
    await userEvent.click(screen.getByRole("tab", { name: /working/i }));
    expect(onChangeStatus).toHaveBeenCalledWith("working");
  });

  it("reveals the search field only when Filter is toggled", async () => {
    const { onChangeSearch } = setup();
    expect(screen.queryByRole("textbox", { name: /filter items/i })).not.toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: /filter this view/i }));
    await userEvent.type(await screen.findByRole("textbox", { name: /filter items/i }), "x");
    expect(onChangeSearch).toHaveBeenCalledWith("x");
  });

  it("links the New action to the create route", () => {
    setup();
    expect(screen.getByRole("link", { name: "New agent" })).toHaveAttribute("href", "/agents/new");
  });

  it("omits the Display control when no display state is provided", () => {
    setup();
    expect(screen.queryByRole("button", { name: /display options/i })).not.toBeInTheDocument();
  });
});
