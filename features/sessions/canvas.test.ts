import { describe, expect, it } from "vitest";
import { sessionCanvasSchema } from "./canvas";

// Seam: the Zod contract for the session canvas (Plan / Run / Diff / Trace). One schema,
// both sides — the BFF validates the downstream shape and the client hook is typed from
// it. A malformed frame must reject at this boundary, never leak an `undefined` to the UI
// (CLAUDE.md §Data & realtime).

const valid = {
  sessionId: "sess_01",
  plan: [
    { id: "p1", text: "Read the auth module", state: "done" },
    { id: "p2", text: "Refactor login()", state: "active" },
    { id: "p3", text: "Add tests", state: "pending" },
  ],
  run: [{ id: "r1", at: "2026-07-07T10:00:00.000Z", level: "info", text: "npm test" }],
  diff: "diff --git a/x b/x\n--- a/x\n+++ b/x\n@@ -1 +1 @@\n-old\n+new\n",
  trace: [{ id: "t1", name: "verify()", durationMs: 12, status: "ok" }],
};

describe("sessionCanvasSchema", () => {
  it("accepts a well-formed canvas", () => {
    expect(sessionCanvasSchema.parse(valid)).toMatchObject({ sessionId: "sess_01" });
  });

  it("rejects an unknown plan step state", () => {
    const bad = { ...valid, plan: [{ id: "p1", text: "x", state: "halfway" }] };
    expect(() => sessionCanvasSchema.parse(bad)).toThrow();
  });

  it("rejects a negative span duration", () => {
    const bad = { ...valid, trace: [{ id: "t1", name: "x", durationMs: -1, status: "ok" }] };
    expect(() => sessionCanvasSchema.parse(bad)).toThrow();
  });
});
