import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { Session } from "../schema";
import { SessionsList } from "./sessions-list";

// Seam: the grouped sessions list rendered from server data (CONTEXT.md §Components) —
// asserted through roles/text, never structure. The RSC page passes `sessions`; the
// client component buckets them into status groups and filters by the active tab.

function session(id: string, title: string, status: Session["status"]): Session {
  return { id, title, status, steps: { completed: 1, total: 3 }, updatedAt: "" };
}

const sessions: Session[] = [
  session("sess_01", "Refactor auth module", "needs_you"),
  session("sess_02", "Migrate Postgres schema", "active"),
  session("sess_03", "Add Recharts dashboard", "review"),
  session("sess_04", "Ship the analytics home", "needs_you"),
];

function renderList(options: { searchParams?: string; onUrlUpdate?: OnUrlUpdateFunction } = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={options.searchParams} onUrlUpdate={options.onUrlUpdate}>
      {children}
    </NuqsTestingAdapter>
  );
  render(<SessionsList sessions={sessions} />, { wrapper });
}

describe("SessionsList", () => {
  it("links each session row to its detail route", () => {
    renderList();
    expect(screen.getByRole("link", { name: /refactor auth module/i })).toHaveAttribute(
      "href",
      "/sessions/sess_01",
    );
  });

  it("groups rows under an ordered status heading with a count", () => {
    renderList();
    const needsYou = screen.getByRole("heading", { name: /needs you/i });
    // The two needs_you sessions are counted in the group header.
    expect(needsYou).toHaveTextContent("2");
  });

  it("narrows the list to a status when its filter tab is selected", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByRole("tab", { name: /^active/i }));

    expect(screen.getByRole("link", { name: /migrate postgres schema/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /refactor auth module/i })).not.toBeInTheDocument();
  });

  it("marks the active filter tab as selected", async () => {
    const user = userEvent.setup();
    renderList();

    const allTab = screen.getByRole("tab", { name: /^all/i });
    expect(allTab).toHaveAttribute("aria-selected", "true");

    await user.click(screen.getByRole("tab", { name: /review/i }));
    expect(screen.getByRole("tab", { name: /review/i })).toHaveAttribute("aria-selected", "true");
    expect(allTab).toHaveAttribute("aria-selected", "false");
  });

  it("shows an empty state when a filter matches no sessions", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByRole("tab", { name: /done/i }));
    expect(screen.getByText(/no sessions/i)).toBeInTheDocument();
  });

  it("shows each row's step progress", () => {
    renderList();
    const row = screen.getByRole("link", { name: /refactor auth module/i });
    expect(within(row).getByText(/1\/3/)).toBeInTheDocument();
  });

  it("reads the active filter from the URL", () => {
    renderList({ searchParams: "?filter=active" });
    expect(screen.getByRole("tab", { name: /^active/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("link", { name: /migrate postgres schema/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /refactor auth module/i })).not.toBeInTheDocument();
  });

  it("writes the selected filter to the URL", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = vi.fn();
    renderList({ onUrlUpdate });

    await user.click(screen.getByRole("tab", { name: /review/i }));
    expect(onUrlUpdate).toHaveBeenCalled();
    expect(onUrlUpdate.mock.calls.at(-1)?.[0].queryString).toContain("filter=review");
  });
});
