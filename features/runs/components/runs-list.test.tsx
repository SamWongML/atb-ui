import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { Run } from "../schema";
import { RunsList } from "./runs-list";

// Seam: the runs list rendered from server data (CONTEXT.md §Components) — flat execution
// history, narrowed by a status filter kept in the URL. Roles/text only.

function run(id: string, source: string, status: Run["status"]): Run {
  return {
    id,
    source,
    status,
    model: "claude-opus-4-8",
    startedAt: "12m ago",
    duration: "3m 12s",
    cost: "$0.61",
    steps: { completed: 1, total: 3 },
    rootCause: status === "failed" ? "the suite never went green" : null,
  };
}

const runs: Run[] = [
  run("run_01", "pr-review autopilot", "running"),
  run("run_02", "nightly dep-upgrade", "failed"),
  run("run_03", "idempotency-review", "passed"),
];

function renderList(options: { searchParams?: string; onUrlUpdate?: OnUrlUpdateFunction } = {}) {
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter
      hasMemory
      searchParams={options.searchParams}
      onUrlUpdate={options.onUrlUpdate}
    >
      {children}
    </NuqsTestingAdapter>
  );
  render(<RunsList runs={runs} />, { wrapper });
}

describe("RunsList", () => {
  it("links each run to its detail route", () => {
    renderList();
    expect(screen.getByRole("link", { name: /pr-review autopilot/i })).toHaveAttribute(
      "href",
      "/runs/run_01",
    );
  });

  it("shows each run's status and model", () => {
    renderList();
    const row = screen.getByRole("link", { name: /nightly dep-upgrade/i });
    expect(within(row).getByText(/failed/i)).toBeInTheDocument();
    expect(within(row).getByText(/claude-opus-4-8/i)).toBeInTheDocument();
  });

  it("narrows the list to a status when its filter tab is selected", async () => {
    const user = userEvent.setup();
    renderList();

    await user.click(screen.getByRole("tab", { name: /^failed/i }));

    expect(screen.getByRole("link", { name: /nightly dep-upgrade/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /pr-review autopilot/i })).not.toBeInTheDocument();
  });

  it("reads the active filter from the URL", () => {
    renderList({ searchParams: "?filter=passed" });
    expect(screen.getByRole("tab", { name: /^passed/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("link", { name: /idempotency-review/i })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /pr-review autopilot/i })).not.toBeInTheDocument();
  });

  it("writes the selected filter to the URL", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = vi.fn();
    renderList({ onUrlUpdate });

    await user.click(screen.getByRole("tab", { name: /^running/i }));
    expect(onUrlUpdate.mock.calls.at(-1)?.[0].queryString).toContain("filter=running");
  });

  it("shows an empty state when a filter matches no runs", async () => {
    const user = userEvent.setup();
    render(<RunsList runs={[run("run_01", "pr-review autopilot", "running")]} />, {
      wrapper: ({ children }: { children: ReactNode }) => (
        <NuqsTestingAdapter hasMemory>{children}</NuqsTestingAdapter>
      ),
    });

    await user.click(screen.getByRole("tab", { name: /^failed/i }));
    expect(screen.getByText(/no runs/i)).toBeInTheDocument();
  });
});
