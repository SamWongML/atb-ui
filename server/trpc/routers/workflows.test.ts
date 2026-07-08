import { beforeEach, describe, expect, it } from "vitest";
import { workflowsStore } from "@/server/services/workflows";
import type { Context } from "../context";
import { appRouter } from "./_app";

// Seam: the workflows BFF router via a server-side caller. Assert known-good seed literals,
// that writes validate at the Zod boundary, and that procedures are gated behind a session.
// Store reset per test.

const authed: Context = {
  session: { user: { id: "u_1", name: "You", email: "you@atb.dev" }, exp: 9_999_999_999 },
};
const caller = () => appRouter.createCaller(authed);

const validInput = {
  name: "canary-deploy",
  description: "Ship behind a flag, watch metrics, roll back on regression.",
  trigger: "manual" as const,
  triggerDetail: "triggered on release",
  steps: 4,
};

beforeEach(() => {
  workflowsStore.reset();
});

describe("workflows router", () => {
  it("lists the seed workflows for an authenticated caller", async () => {
    const workflows = await caller().workflows.list();
    expect(workflows).toHaveLength(6);
    expect(workflows[0]?.name).toBe("idempotency-review");
    expect(workflows[0]?.trigger).toBe("manual");
    expect(workflows[0]?.status).toBe("active");
  });

  it("gets one workflow by id", async () => {
    const wf = await caller().workflows.get({ id: "lint-sweep" });
    expect(wf.status).toBe("paused");
    expect(wf.steps).toBe(4);
  });

  it("throws NOT_FOUND for a missing workflow id", async () => {
    await expect(caller().workflows.get({ id: "ghost" })).rejects.toThrow(/not found/i);
  });

  it("models a workflow as pipeline nodes and connections", async () => {
    const wf = await caller().workflows.get({ id: "idem-review" });
    expect(wf.nodes.map((node) => node.agent)).toEqual(["PL", "BD", "SR"]);
    expect(wf.connections).toEqual([
      { from: "n1", to: "n2" },
      { from: "n2", to: "n3" },
    ]);
  });

  it("creates a draft workflow and makes it retrievable", async () => {
    const before = await caller().workflows.list();
    const created = await caller().workflows.create(validInput);

    expect(created.name).toBe("canary-deploy");
    expect(created.status).toBe("draft");
    expect(created.steps).toBe(4);
    expect(created.nodes).toEqual([]);
    expect(created.connections).toEqual([]);

    const after = await caller().workflows.list();
    expect(after).toHaveLength(before.length + 1);
    expect((await caller().workflows.get({ id: created.id })).description).toContain("roll back");
  });

  it("rejects invalid create input at the Zod boundary (zero steps)", async () => {
    await expect(caller().workflows.create({ ...validInput, steps: 0 })).rejects.toThrow();
  });

  it("updates an existing workflow's editable fields", async () => {
    const updated = await caller().workflows.update({
      id: "release-notes",
      data: { ...validInput, name: "release-notes", steps: 3 },
    });
    expect(updated.steps).toBe(3);
  });

  it("rejects an unauthenticated caller", async () => {
    const anon = appRouter.createCaller({ session: null });
    await expect(anon.workflows.list()).rejects.toThrow();
  });
});
