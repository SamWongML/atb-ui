import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NuqsTestingAdapter, type OnUrlUpdateFunction } from "nuqs/adapters/testing";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { reconcile } from "@/lib/realtime/reconcile";
import type { SessionCanvas as SessionCanvasData } from "../canvas";
import { SessionCanvas } from "./session-canvas";

// Seam: the canvas's public output (CONTEXT.md §Components). Four tabs — Plan / Run /
// Diff / Trace — each revealing its view. The canvas is rendered from the Query cache
// (seeded by the RSC snapshot, updated by reconcile), never a static prop — so a streamed
// frame updates it live. Asserted through roles/text, never structure.

const canvas: SessionCanvasData = {
  sessionId: "sess_01",
  plan: [
    { id: "p1", text: "Read the auth module", state: "done" },
    { id: "p2", text: "Refactor login()", state: "active" },
  ],
  run: [
    { id: "r1", at: "2026-07-07T10:00:00.000Z", level: "info", text: "pnpm test auth" },
    { id: "r2", at: "2026-07-07T10:00:02.000Z", level: "error", text: "1 test failing" },
  ],
  diff: `diff --git a/src/auth.ts b/src/auth.ts
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -1 +1 @@
-export function login() {}
+export async function login() {}
`,
  trace: [
    { id: "t1", name: "read auth.ts", durationMs: 42, status: "ok" },
    { id: "t2", name: "run auth tests", durationMs: 2140, status: "error" },
  ],
};

function renderCanvas(options: { searchParams?: string; onUrlUpdate?: OnUrlUpdateFunction } = {}) {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <NuqsTestingAdapter searchParams={options.searchParams} onUrlUpdate={options.onUrlUpdate}>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </NuqsTestingAdapter>
  );
  render(<SessionCanvas sessionId="sess_01" initialCanvas={canvas} />, { wrapper });
  return client;
}

const codeLine = (text: string) =>
  screen.getByText((_c, el) => el?.tagName === "CODE" && el.textContent === text);

describe("SessionCanvas", () => {
  it("offers the four canvas tabs", () => {
    renderCanvas();
    for (const name of ["Plan", "Run", "Diff", "Trace"]) {
      expect(screen.getByRole("tab", { name })).toBeInTheDocument();
    }
  });

  it("shows the plan by default", () => {
    renderCanvas();
    expect(screen.getByRole("tab", { name: "Plan" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Refactor login()")).toBeInTheDocument();
  });

  it("switches to the run log", async () => {
    const user = userEvent.setup();
    renderCanvas();

    await user.click(screen.getByRole("tab", { name: "Run" }));
    expect(screen.getByText("1 test failing")).toBeInTheDocument();
    expect(screen.queryByText("Refactor login()")).not.toBeInTheDocument();
  });

  it("switches to the Shiki diff", async () => {
    const user = userEvent.setup();
    renderCanvas();

    await user.click(screen.getByRole("tab", { name: "Diff" }));
    expect(codeLine("export async function login() {}")).toBeInTheDocument();
  });

  it("switches to the trace with span durations and failure state", async () => {
    const user = userEvent.setup();
    renderCanvas();

    await user.click(screen.getByRole("tab", { name: "Trace" }));
    expect(screen.getByText("run auth tests")).toBeInTheDocument();
    expect(screen.getByText("2.1s")).toBeInTheDocument();
    expect(screen.getByText("42ms")).toBeInTheDocument();
    expect(screen.getByText(/failed/i)).toBeInTheDocument();
  });

  it("reads the active tab from the URL", () => {
    renderCanvas({ searchParams: "?tab=trace" });
    expect(screen.getByRole("tab", { name: "Trace" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("run auth tests")).toBeInTheDocument();
  });

  it("writes the selected tab to the URL", async () => {
    const user = userEvent.setup();
    const onUrlUpdate = vi.fn();
    renderCanvas({ onUrlUpdate });

    await user.click(screen.getByRole("tab", { name: "Diff" }));
    expect(onUrlUpdate).toHaveBeenCalled();
    expect(onUrlUpdate.mock.calls.at(-1)?.[0].queryString).toContain("tab=diff");
  });

  it("updates live when a run-log frame is reconciled into the cache", async () => {
    const client = renderCanvas({ searchParams: "?tab=run" });
    expect(screen.queryByText("diff applied")).not.toBeInTheDocument();

    reconcile(client, {
      type: "run_log",
      sessionId: "sess_01",
      line: { id: "r3", at: "2026-07-07T10:11:02.000Z", level: "info", text: "diff applied" },
    });

    expect(await screen.findByText("diff applied")).toBeInTheDocument();
  });
});
