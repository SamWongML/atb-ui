import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { SessionCanvas as SessionCanvasData } from "../canvas";
import { SessionCanvas } from "./session-canvas";

// Seam: the canvas's public output (CONTEXT.md §Components). Four tabs — Plan / Run /
// Diff / Trace — each revealing its view. Asserted through roles/text, never structure.

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

const codeLine = (text: string) =>
  screen.getByText((_c, el) => el?.tagName === "CODE" && el.textContent === text);

describe("SessionCanvas", () => {
  it("offers the four canvas tabs", () => {
    render(<SessionCanvas canvas={canvas} />);
    for (const name of ["Plan", "Run", "Diff", "Trace"]) {
      expect(screen.getByRole("tab", { name })).toBeInTheDocument();
    }
  });

  it("shows the plan by default", () => {
    render(<SessionCanvas canvas={canvas} />);
    expect(screen.getByRole("tab", { name: "Plan" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Refactor login()")).toBeInTheDocument();
  });

  it("switches to the run log", async () => {
    const user = userEvent.setup();
    render(<SessionCanvas canvas={canvas} />);

    await user.click(screen.getByRole("tab", { name: "Run" }));
    expect(screen.getByText("1 test failing")).toBeInTheDocument();
    expect(screen.queryByText("Refactor login()")).not.toBeInTheDocument();
  });

  it("switches to the Shiki diff", async () => {
    const user = userEvent.setup();
    render(<SessionCanvas canvas={canvas} />);

    await user.click(screen.getByRole("tab", { name: "Diff" }));
    expect(codeLine("export async function login() {}")).toBeInTheDocument();
  });

  it("switches to the trace with span durations and failure state", async () => {
    const user = userEvent.setup();
    render(<SessionCanvas canvas={canvas} />);

    await user.click(screen.getByRole("tab", { name: "Trace" }));
    expect(screen.getByText("run auth tests")).toBeInTheDocument();
    expect(screen.getByText("2.1s")).toBeInTheDocument();
    expect(screen.getByText("42ms")).toBeInTheDocument();
    expect(screen.getByText(/failed/i)).toBeInTheDocument();
  });
});
