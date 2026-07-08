import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import type { SessionDetail } from "@/features/sessions/realtime";
import { queryKeys } from "@/lib/query/keys";
import { reconcile } from "./reconcile";
import { handleSseMessage, parseFrame } from "./sse";

// Seam: the SSE reader's parse+dispatch boundary (ARCHITECTURE.md §Real-time step 3).
// A valid data payload becomes a typed event; a malformed one is a caught error routed
// to onError — never a silent bad dispatch. The transport (fetch-event-source) is thin
// glue over this and is exercised by the app, not unit-mocked.

const tokenFrame = (text: string, messageId = "m1") =>
  JSON.stringify({ type: "token", sessionId: "sess_01", messageId, agent: "Builder", text });

describe("parseFrame", () => {
  it("parses a valid frame into a typed event", () => {
    const event = parseFrame(
      JSON.stringify({ type: "status", sessionId: "sess_01", status: "review" }),
    );
    expect(event).toMatchObject({ type: "status", status: "review" });
  });

  it("throws on an unknown frame type", () => {
    expect(() => parseFrame('{"type":"explode","sessionId":"sess_01"}')).toThrow();
  });

  it("throws on non-JSON", () => {
    expect(() => parseFrame("not json")).toThrow();
  });
});

describe("handleSseMessage", () => {
  it("dispatches a valid frame to onEvent", () => {
    const onEvent = vi.fn();
    const onError = vi.fn();
    handleSseMessage(tokenFrame("hi"), { onEvent, onError });
    expect(onEvent).toHaveBeenCalledOnce();
    expect(onError).not.toHaveBeenCalled();
  });

  it("routes a malformed frame to onError, never onEvent", () => {
    const onEvent = vi.fn();
    const onError = vi.fn();
    handleSseMessage("{bad", { onEvent, onError });
    expect(onError).toHaveBeenCalledOnce();
    expect(onEvent).not.toHaveBeenCalled();
  });

  it("streams tokens end-to-end into the live view via reconcile", () => {
    const client = new QueryClient();
    const onEvent = (event: Parameters<typeof reconcile>[1]) => reconcile(client, event);
    for (const chunk of ["He", "llo", " world"]) {
      handleSseMessage(tokenFrame(chunk), { onEvent });
    }
    const detail = client.getQueryData<SessionDetail>(queryKeys.session("sess_01"));
    expect(detail?.transcript[0]?.text).toBe("Hello world");
  });
});
