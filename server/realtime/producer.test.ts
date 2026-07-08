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
  it("yields the same frames as the burst, one at a time (paced streaming)", async () => {
    const streamed: RealtimeEvent[] = [];
    for await (const frame of streamMockTokens("sess_01", 0)) {
      streamed.push(frame);
    }
    expect(streamed).toEqual(mockTokenStream("sess_01"));
  });
});
