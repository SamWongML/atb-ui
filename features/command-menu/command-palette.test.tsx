import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { CommandPalette } from "./command-palette";

// Seam: the palette's public surface (cmdk exposes a combobox input + option roles,
// hosted in a dialog). Drive it via typing/clicking; assert navigation + action
// callbacks fire — never inspect cmdk internals.

function setup(props: Partial<React.ComponentProps<typeof CommandPalette>> = {}) {
  const onOpenChange = vi.fn();
  const onNavigate = vi.fn();
  const run = vi.fn();
  render(
    <CommandPalette
      open
      onOpenChange={onOpenChange}
      onNavigate={onNavigate}
      actions={[{ id: "new-session", label: "New session", hint: "⌘N", run }]}
      {...props}
    />,
  );
  return { onOpenChange, onNavigate, run, user: userEvent.setup() };
}

describe("CommandPalette", () => {
  it("lists navigation commands for every surface when open", () => {
    setup();
    expect(screen.getByRole("option", { name: /sessions/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /analytics/i })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /new session/i })).toBeInTheDocument();
  });

  it("fuzzy-filters the list as you type", async () => {
    const { user } = setup();
    await user.type(screen.getByRole("combobox"), "analy");
    expect(screen.getByRole("option", { name: /analytics/i })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: /sessions/i })).not.toBeInTheDocument();
  });

  it("navigates and closes when a surface is chosen", async () => {
    const { user, onNavigate, onOpenChange } = setup();
    await user.click(screen.getByRole("option", { name: /analytics/i }));
    expect(onNavigate).toHaveBeenCalledWith("/analytics");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("runs an action command and closes", async () => {
    const { user, run, onOpenChange } = setup();
    await user.click(screen.getByRole("option", { name: /new session/i }));
    expect(run).toHaveBeenCalledOnce();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("toggles open on ⌘K", async () => {
    const { user, onOpenChange } = setup({ open: false });
    await user.keyboard("{Meta>}k{/Meta}");
    expect(onOpenChange).toHaveBeenCalledWith(true);
  });
});
