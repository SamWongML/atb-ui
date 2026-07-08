import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCommandMenu } from "@/features/command-menu/store";
import { AppShell } from "./app-shell";

// next/navigation is the framework boundary the shell reads its route from; mock it
// (like fetch) so the composed shell can be exercised through its ARIA surface.
vi.mock("next/navigation", () => ({
  usePathname: () => "/sessions",
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn() }),
}));

beforeEach(() => {
  useCommandMenu.setState({ open: false });
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("AppShell", () => {
  it("hosts page content in a main landmark", () => {
    render(
      <AppShell>
        <p>hello world</p>
      </AppShell>,
    );
    expect(screen.getByRole("main")).toHaveTextContent("hello world");
  });

  it("renders the primary navigation and the breadcrumb", () => {
    render(<AppShell>content</AppShell>);
    expect(screen.getByRole("navigation", { name: /main/i })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /breadcrumb/i })).toBeInTheDocument();
  });

  it("marks the active surface from the current route", () => {
    render(<AppShell>content</AppShell>);
    expect(screen.getByRole("link", { name: /sessions/i })).toHaveAttribute("aria-current", "page");
  });

  it("opens the command palette from the header search", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /search or run a command/i }));
    expect(await screen.findByRole("combobox")).toBeInTheDocument();
  });

  it("shows the current workspace and reveals the account menu", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);
    expect(screen.getByRole("button", { name: /switch workspace/i })).toHaveTextContent(
      /meridian/i,
    );

    await user.click(screen.getByRole("button", { name: /account/i }));
    expect(await screen.findByRole("button", { name: /sign out/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /light/i })).toBeInTheDocument();
  });
});
