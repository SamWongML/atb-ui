import { beforeEach, describe, expect, it } from "vitest";
import { runSchema } from "@/features/runs/schema";
import { runsStore } from "@/server/services/runs";
import type { Context } from "../context";
import { appRouter } from "./_app";

// Seam: the runs BFF router via a server-side caller (CONTEXT.md §Testing seams). Runs are
// read-only execution history: assert known-good seed literals, that a failed run carries a
// root cause, that a malformed frame rejects at the Zod boundary, and that reads are gated
// behind a session. Store reset per test.

const authed: Context = {
  session: { user: { id: "u_1", name: "You", email: "you@atb.dev" }, exp: 9_999_999_999 },
};
const caller = () => appRouter.createCaller(authed);

beforeEach(() => {
  runsStore.reset();
});

describe("runs router", () => {
  it("lists the seed runs, newest first, for an authenticated caller", async () => {
    const runs = await caller().runs.list();
    expect(runs).toHaveLength(7);
    expect(runs[0]?.source).toBe("pr-review autopilot");
    expect(runs[0]?.status).toBe("running");
  });

  it("gets one run by id", async () => {
    const run = await caller().runs.get({ id: "run_03" });
    expect(run.source).toBe("idempotency-review");
    expect(run.status).toBe("passed");
    expect(run.model).toBe("claude-opus-4-8");
  });

  it("carries a root cause on a failed run and none on a passed one", async () => {
    const failed = await caller().runs.get({ id: "run_02" });
    expect(failed.status).toBe("failed");
    expect(failed.rootCause).toMatch(/zod/i);

    const passed = await caller().runs.get({ id: "run_03" });
    expect(passed.rootCause).toBeNull();
  });

  it("throws NOT_FOUND for a missing run id", async () => {
    await expect(caller().runs.get({ id: "ghost" })).rejects.toThrow(/not found/i);
  });

  it("rejects a malformed run frame at the Zod boundary", () => {
    expect(() => runSchema.parse({ id: "run_x", source: "x", status: "exploded" })).toThrow();
  });

  it("rejects an unauthenticated caller", async () => {
    const anon = appRouter.createCaller({ session: null });
    await expect(anon.runs.list()).rejects.toThrow();
  });
});
