import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { RealtimeEvent, SessionDetail } from "@/features/sessions/realtime";
import { queryKeys } from "@/lib/query/keys";
import { reconcile } from "@/lib/realtime/reconcile";
import { mockTokenStream, streamMockTokens } from "./producer";

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

describe("streamMockTokens", () => {
  // The behavior the burst version lacked: frames are spaced out over time rather than
  // emitted all at once. setTimeout never fires early, so N frames spaced by `interval`
  // cannot fully drain in less than (N-1) intervals of real time — a hard lower bound
  // that fails the moment pacing is removed, without a flaky upper bound.
  it("spaces frames over time instead of emitting them in one burst", async () => {
    const interval = 10;
    const start = Date.now();

    const frames: RealtimeEvent[] = [];
    for await (const frame of streamMockTokens("sess_01", interval)) {
      frames.push(frame);
    }
    const elapsed = Date.now() - start;

    expect(frames).toHaveLength(10); // 7 token chunks + message_end + step + status
    expect(frames[0]).toMatchObject({ type: "token", text: "Analyzing" });
    expect(frames.at(-1)).toMatchObject({ type: "status", status: "review" });
    expect(elapsed).toBeGreaterThanOrEqual(9 * interval - 5);
  });
});
