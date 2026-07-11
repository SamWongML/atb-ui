import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { type ListDisplayConfig, ListDisplayMenu, useListDisplay } from "./list-display";

// Seam: the display model's public behaviour through the rendered menu — layout,
// full width, grouping and property visibility all round-trip through real controls.
// A tiny host wires the hook to the menu and surfaces the state as text, so the
// assertions stay on roles/text (CONTEXT.md), never on internals.

const CONFIG: ListDisplayConfig = {
  properties: [
    { key: "description", label: "Description" },
    { key: "usage", label: "Usage" },
  ],
  groupable: true,
};

function Host() {
  const display = useListDisplay(CONFIG);
  return (
    <>
      <ListDisplayMenu display={display}>
        <button type="button">Display options</button>
      </ListDisplayMenu>
      <output>
        {display.layout} · {display.fullWidth ? "full" : "capped"} ·{" "}
        {display.visible.description ? "description" : "no-description"}
      </output>
    </>
  );
}

async function openMenu() {
  await userEvent.click(screen.getByRole("button", { name: "Display options" }));
}

describe("list display", () => {
  it("switches layout through the menu tiles", async () => {
    render(<Host />);
    await openMenu();
    await userEvent.click(screen.getByRole("button", { name: "List" }));
    expect(screen.getByRole("status")).toHaveTextContent(/^list/);
  });

  it("toggles full width through the switch", async () => {
    render(<Host />);
    await openMenu();
    await userEvent.click(screen.getByRole("switch", { name: "Full width" }));
    expect(screen.getByRole("status")).toHaveTextContent("full");
  });

  it("disables grouping while the grid layout is active", async () => {
    render(<Host />);
    await openMenu();
    expect(screen.getByRole("switch", { name: "Group by status" })).toBeDisabled();
    await userEvent.click(screen.getByRole("button", { name: "List" }));
    expect(screen.getByRole("switch", { name: "Group by status" })).toBeEnabled();
  });

  it("toggles property visibility and restores it on reset", async () => {
    render(<Host />);
    await openMenu();
    await userEvent.click(screen.getByRole("button", { name: "Description" }));
    expect(screen.getByRole("status")).toHaveTextContent("no-description");
    await userEvent.click(screen.getByRole("button", { name: "Reset to default" }));
    expect(screen.getByRole("status")).toHaveTextContent(/· description/);
  });
});
