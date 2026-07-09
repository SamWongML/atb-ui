import { describe, expect, it } from "vitest";
import { analyticsSchema } from "@/features/analytics/schema";
import type { Context } from "../context";
import { appRouter } from "./_app";

// Seam: the analytics BFF router via a server-side caller (CONTEXT.md §Testing seams). A
// read-only rolled-up snapshot: assert known-good seed literals, that a malformed frame
// rejects at the Zod boundary, and that the read is gated behind a session.

const authed: Context = {
  session: { user: { id: "u_1", name: "You", email: "you@atb.dev" }, exp: 9_999_999_999 },
};
const caller = () => appRouter.createCaller(authed);

describe("analytics router", () => {
  it("returns the rolled-up spend and model mix for an authenticated caller", async () => {
    const summary = await caller().analytics.summary();
    expect(summary.totalCost).toBe(253.2);
    expect(summary.totalRuns).toBe(434);
    expect(summary.costSeries).toHaveLength(7);
    expect(summary.modelMix[0]?.model).toBe("claude-opus-4-8");
  });

  it("rejects a malformed analytics frame at the Zod boundary", () => {
    expect(() => analyticsSchema.parse({ totalCost: "lots", totalRuns: 1 })).toThrow();
  });

  it("rejects an unauthenticated caller", async () => {
    const anon = appRouter.createCaller({ session: null });
    await expect(anon.analytics.summary()).rejects.toThrow();
  });
});
