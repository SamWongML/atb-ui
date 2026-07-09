import { beforeEach, describe, expect, it } from "vitest";
import { overviewSummarySchema } from "@/features/overview/schema";
import { mcpStore } from "@/server/services/mcp";
import { runsStore } from "@/server/services/runs";
import type { Context } from "../context";
import { appRouter } from "./_app";

// Seam: the overview BFF router via a server-side caller (CONTEXT.md §Testing seams). The
// home composes across stores, so assert the seed-derived rollup: live counts, the 7-day
// numbers, the activity feed, and the failure list. Stores it reads are reset per test.

const authed: Context = {
  session: { user: { id: "u_1", name: "You", email: "you@atb.dev" }, exp: 9_999_999_999 },
};
const caller = () => appRouter.createCaller(authed);

function statValue(stats: { label: string; value: string }[], label: string): string | undefined {
  return stats.find((stat) => stat.label === label)?.value;
}

beforeEach(() => {
  runsStore.reset();
  mcpStore.reset();
});

describe("overview router", () => {
  it("rolls up live counts and the 7-day spend into headline stats", async () => {
    const summary = await caller().overview.summary();
    expect(statValue(summary.stats, "Active sessions")).toBe("1");
    expect(statValue(summary.stats, "Runs · 7d")).toBe("434");
    expect(statValue(summary.stats, "Spend · 7d")).toBe("$253.20");
    expect(statValue(summary.stats, "Degraded servers")).toBe("1");
  });

  it("builds the activity feed from the most recent runs, linked to their detail", async () => {
    const summary = await caller().overview.summary();
    expect(summary.activity).toHaveLength(5);
    expect(summary.activity[0]).toMatchObject({
      title: "pr-review autopilot",
      status: "running",
      href: "/runs/run_01",
    });
  });

  it("surfaces the failed runs with their root cause", async () => {
    const summary = await caller().overview.summary();
    expect(summary.failures).toHaveLength(2);
    const dep = summary.failures.find((failure) => failure.id === "run_02");
    expect(dep?.rootCause).toMatch(/zod/i);
    expect(dep?.href).toBe("/runs/run_02");
  });

  it("reports the model mix as shares of runs", async () => {
    const summary = await caller().overview.summary();
    expect(summary.modelMix[0]).toEqual({ model: "claude-opus-4-8", share: 29 });
  });

  it("rejects a malformed overview frame at the Zod boundary", () => {
    expect(() => overviewSummarySchema.parse({ stats: "nope" })).toThrow();
  });

  it("rejects an unauthenticated caller", async () => {
    const anon = appRouter.createCaller({ session: null });
    await expect(anon.overview.summary()).rejects.toThrow();
  });
});
