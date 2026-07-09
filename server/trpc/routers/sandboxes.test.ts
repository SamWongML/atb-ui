import { beforeEach, describe, expect, it } from "vitest";
import { sandboxSchema } from "@/features/sandboxes/schema";
import { sandboxesStore } from "@/server/services/sandboxes";
import type { Context } from "../context";
import { appRouter } from "./_app";

// Seam: the sandboxes BFF router via a server-side caller (CONTEXT.md §Testing seams).
// Read-only compute environments: assert known-good seed literals, that a malformed frame
// rejects at the Zod boundary, and that reads are gated behind a session. Store reset per test.

const authed: Context = {
  session: { user: { id: "u_1", name: "You", email: "you@atb.dev" }, exp: 9_999_999_999 },
};
const caller = () => appRouter.createCaller(authed);

beforeEach(() => {
  sandboxesStore.reset();
});

describe("sandboxes router", () => {
  it("lists the seed sandboxes for an authenticated caller", async () => {
    const sandboxes = await caller().sandboxes.list();
    expect(sandboxes).toHaveLength(5);
    expect(sandboxes[0]?.name).toBe("meridian-api-sbx");
    expect(sandboxes[0]?.status).toBe("running");
  });

  it("gets one sandbox by id, with its compute and occupants", async () => {
    const sandbox = await caller().sandboxes.get({ id: "web-e2e-sbx" });
    expect(sandbox.status).toBe("idle");
    expect(sandbox.resources).toBe("2 vCPU · 4 GB");
    expect(sandbox.usedBy).toEqual(["TR"]);
  });

  it("models a stopped sandbox with no occupants", async () => {
    const sandbox = await caller().sandboxes.get({ id: "infra-plan-sbx" });
    expect(sandbox.status).toBe("stopped");
    expect(sandbox.usedBy).toEqual([]);
  });

  it("throws NOT_FOUND for a missing sandbox id", async () => {
    await expect(caller().sandboxes.get({ id: "ghost" })).rejects.toThrow(/not found/i);
  });

  it("rejects a malformed sandbox frame at the Zod boundary", () => {
    expect(() => sandboxSchema.parse({ id: "x", name: "x", status: "melted" })).toThrow();
  });

  it("rejects an unauthenticated caller", async () => {
    const anon = appRouter.createCaller({ session: null });
    await expect(anon.sandboxes.list()).rejects.toThrow();
  });
});
