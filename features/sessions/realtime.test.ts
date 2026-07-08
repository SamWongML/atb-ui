import { describe, expect, it } from "vitest";
import { realtimeEventSchema, sessionDetailSchema } from "./realtime";

// Seam: the stream-frame boundary (ARCHITECTURE.md §Real-time — "each frame becomes a
// typed event or a caught error"). Valid frames parse to typed events; anything
// malformed rejects here, never leaking a silent `undefined` into reconcile().

describe("realtimeEventSchema", () => {
  it("parses a token frame", () => {
    const event = realtimeEventSchema.parse({
      type: "token",
      sessionId: "sess_01",
      messageId: "msg_1",
      agent: "Builder",
      text: "hel",
    });
    expect(event.type).toBe("token");
  });

  it("parses a status frame with a valid lifecycle status", () => {
    const event = realtimeEventSchema.parse({
      type: "status",
      sessionId: "sess_01",
      status: "review",
    });
    expect(event).toMatchObject({ type: "status", status: "review" });
  });

  it("parses a control echo frame", () => {
    const event = realtimeEventSchema.parse({
      type: "control",
      sessionId: "sess_01",
      action: "approve",
      status: "active",
    });
    expect(event).toMatchObject({ type: "control", action: "approve" });
  });

  it("rejects an unknown frame type", () => {
    expect(() => realtimeEventSchema.parse({ type: "explode", sessionId: "sess_01" })).toThrow();
  });

  it("rejects a status frame with an invalid status", () => {
    expect(() =>
      realtimeEventSchema.parse({ type: "status", sessionId: "sess_01", status: "napping" }),
    ).toThrow();
  });

  it("rejects a token frame missing its text", () => {
    expect(() =>
      realtimeEventSchema.parse({
        type: "token",
        sessionId: "sess_01",
        messageId: "msg_1",
        agent: "Builder",
      }),
    ).toThrow();
  });
});

describe("sessionDetailSchema", () => {
  it("parses a session detail with a transcript", () => {
    const detail = sessionDetailSchema.parse({
      id: "sess_01",
      title: "Refactor auth module",
      status: "active",
      steps: { completed: 1, total: 5 },
      transcript: [{ id: "msg_1", agent: "Builder", text: "working", pending: true }],
      updatedAt: "2026-07-07T10:12:00.000Z",
    });
    expect(detail.transcript).toHaveLength(1);
  });
});
