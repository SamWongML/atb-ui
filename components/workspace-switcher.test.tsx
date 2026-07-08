import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ENVIRONMENTS, WORKSPACES } from "@/lib/workspace";
import { WorkspaceSwitcher } from "./workspace-switcher";

// Seam: the switcher's public ARIA surface. Workspaces + environments are single-
// select radio groups, so the current choice is an aria-checked menuitemradio and a
// pick fires the corresponding callback — no reaching into component internals.

function setup(props: Partial<React.ComponentProps<typeof WorkspaceSwitcher>> = {}) {
  const onSelectWorkspace = vi.fn();
  const onSelectEnvironment = vi.fn();
  render(
    <WorkspaceSwitcher
      workspaces={WORKSPACES}
      workspaceId="meridian"
      environments={ENVIRONMENTS}
      environmentId="production"
      onSelectWorkspace={onSelectWorkspace}
      onSelectEnvironment={onSelectEnvironment}
      {...props}
    />,
  );
  return { onSelectWorkspace, onSelectEnvironment, user: userEvent.setup() };
}

describe("WorkspaceSwitcher", () => {
  it("shows the current workspace and environment on the trigger", () => {
    setup();
    const trigger = screen.getByRole("button", { name: /switch workspace/i });
    expect(trigger).toHaveTextContent(/meridian/i);
    expect(trigger).toHaveTextContent(/production/i);
  });

  it("lists sibling workspaces when opened, with the current one checked", async () => {
    const { user } = setup();
    await user.click(screen.getByRole("button", { name: /switch workspace/i }));
    expect(await screen.findByRole("menuitemradio", { name: /atlas-labs/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /meridian/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("selects a different workspace", async () => {
    const { user, onSelectWorkspace } = setup();
    await user.click(screen.getByRole("button", { name: /switch workspace/i }));
    await user.click(await screen.findByRole("menuitemradio", { name: /northwind/i }));
    expect(onSelectWorkspace).toHaveBeenCalledWith("northwind");
  });

  it("switches the environment", async () => {
    const { user, onSelectEnvironment } = setup();
    await user.click(screen.getByRole("button", { name: /switch workspace/i }));
    await user.click(await screen.findByRole("menuitemradio", { name: /staging/i }));
    expect(onSelectEnvironment).toHaveBeenCalledWith("staging");
  });
});
