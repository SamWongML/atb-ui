import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { SessionCanvas } from "@/features/sessions/canvas";
import type { RealtimeEvent, SessionDetail } from "@/features/sessions/realtime";
import { queryKeys } from "@/lib/query/keys";
import { reconcile } from "@/lib/realtime/reconcile";
import { mockTokenStream, streamMockSession } from "./producer";

// Seam: the Phase 1 exit demo — a mock session's frames, streamed through reconcile()
// into the live-updating view. The producer stands in for the agent engine.

describe("mockTokenStream", () => {
  it("reconciles into a complete transcript message and a settled status", () => {
    const client = new QueryClient();
    for (const event of mockTokenStream("sess_01")) {
      reconcile(client, event);
    }

    const detail = client.getQueryData<SessionDetail>(queryKeys.session("sess_01"));
    expect(detail?.transcript).toHaveLength(1);
    expect(detail?.transcript[0]?.text.length).toBeGreaterThan(0);
    expect(detail?.transcript[0]?.pending).toBe(false); // ended
    expect(detail?.status).toBe("review"); // settled after the run
  });
});

describe("streamMockSession", () => {
  // Pacing (unchanged from the token-only version): setTimeout never fires early, so N
  // frames spaced by `interval` cannot fully drain in less than (N-1) intervals of real
  // time — a hard lower bound that fails the moment pacing is removed.
  it("spaces frames over time instead of emitting them in one burst", async () => {
    const interval = 10;
    const start = Date.now();

    const frames: RealtimeEvent[] = [];
    for await (const frame of streamMockSession("sess_01", interval)) {
      frames.push(frame);
    }
    const elapsed = Date.now() - start;

    expect(frames[0]).toMatchObject({ type: "token", text: "Analyzing" });
    expect(elapsed).toBeGreaterThanOrEqual((frames.length - 1) * interval - 5);
  });

  it("drives the canvas: the run log grows, the plan advances, a trace span lands", async () => {
    const client = new QueryClient();
    for await (const frame of streamMockSession("sess_01", 0)) {
      reconcile(client, frame);
    }

    const canvas = client.getQueryData<SessionCanvas>(queryKeys.sessionCanvas("sess_01"));
    expect(canvas?.run.length).toBeGreaterThan(0);
    expect(canvas?.trace.length).toBeGreaterThan(0);
    // The plan progressed — at least one step reached "done".
    expect(canvas?.plan.some((step) => step.state === "done")).toBe(true);
  });
});
