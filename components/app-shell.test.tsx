import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useCommandMenu } from "@/features/command-menu/store";
import type { Session } from "@/features/sessions/schema";
import { AppShell } from "./app-shell";

// next/navigation is the framework boundary the shell reads its route from; mock it
// (like fetch) so the composed shell can be exercised through its ARIA surface. The
// route is mutable so tests can place the shell on a detail page.
const nav = vi.hoisted(() => ({ pathname: "/sessions" }));
vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: vi.fn(), prefetch: vi.fn(), replace: vi.fn() }),
}));

const SESSIONS: Session[] = [
  {
    id: "sess_01",
    title: "Refactor auth module",
    status: "needs_you",
    steps: { completed: 3, total: 5 },
    updatedAt: "2026-07-07T10:12:00.000Z",
  },
  {
    id: "sess_02",
    title: "Migrate Postgres schema",
    status: "active",
    steps: { completed: 1, total: 4 },
    updatedAt: "2026-07-07T10:20:00.000Z",
  },
];

beforeEach(() => {
  nav.pathname = "/sessions";
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

  it("opens the command palette from the sidebar search button", async () => {
    const user = userEvent.setup();
    render(<AppShell>content</AppShell>);
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /search — open the command menu/i }));
    expect(await screen.findByRole("combobox")).toBeInTheDocument();
  });

  it("shows the live session count on the sidebar from the passed sessions", () => {
    render(<AppShell sessions={SESSIONS}>content</AppShell>);
    expect(screen.getByRole("link", { name: /sessions/i })).toHaveTextContent("2");
  });

  it("wires the breadcrumb entity switcher on a session-detail route", async () => {
    nav.pathname = "/sessions/sess_01";
    const user = userEvent.setup();
    render(<AppShell sessions={SESSIONS}>content</AppShell>);

    // The open session is the current crumb, exposed as a switcher of its siblings.
    await user.click(screen.getByRole("button", { name: /refactor auth module/i }));
    expect(
      await screen.findByRole("menuitem", { name: /migrate postgres schema/i }),
    ).toHaveAttribute("href", "/sessions/sess_02");
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
