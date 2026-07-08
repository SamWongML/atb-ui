import { describe, expect, it } from "vitest";
import type { Context } from "../context";
import { appRouter } from "./_app";

// Seam: the BFF router, exercised through a server-side caller (no HTTP). This is the
// contract the typed client is generated from; assert known-good seed literals and
// that the procedure is gated behind a session.

const authed: Context = {
  session: { user: { id: "u_1", name: "You", email: "you@atb.dev" }, exp: 9_999_999_999 },
};

describe("sessions router", () => {
  it("lists the seed sessions for an authenticated caller", async () => {
    const sessions = await appRouter.createCaller(authed).sessions.list();
    expect(sessions).toHaveLength(3);
    expect(sessions[0]?.title).toBe("Refactor auth module");
    expect(sessions[0]?.status).toBe("needs_you");
    expect(sessions[0]?.steps).toEqual({ completed: 3, total: 5 });
  });

  it("rejects an unauthenticated caller", async () => {
    const anon = appRouter.createCaller({ session: null });
    await expect(anon.sessions.list()).rejects.toThrow();
  });

  it("returns a session's canvas (plan/run/diff/trace) for an authenticated caller", async () => {
    const canvas = await appRouter.createCaller(authed).sessions.canvas({ sessionId: "sess_01" });
    expect(canvas.sessionId).toBe("sess_01");
    expect(canvas.plan.length).toBeGreaterThan(0);
    expect(canvas.diff).toContain("diff --git");
    expect(canvas.trace.every((span) => span.durationMs >= 0)).toBe(true);
  });

  it("rejects a canvas request for an unknown session", async () => {
    await expect(
      appRouter.createCaller(authed).sessions.canvas({ sessionId: "nope" }),
    ).rejects.toThrow(/not found/i);
  });

  it("gates the canvas behind a session", async () => {
    const anon = appRouter.createCaller({ session: null });
    await expect(anon.sessions.canvas({ sessionId: "sess_01" })).rejects.toThrow();
  });
});
