import { beforeEach, describe, expect, it } from "vitest";
import { agentsStore } from "@/server/services/agents";
import type { Context } from "../context";
import { appRouter } from "./_app";

// Seam: the agents BFF router, exercised through a server-side caller (no HTTP) — the
// contract the typed client is generated from. Assert known-good seed literals, that
// writes validate at the Zod boundary, and that every procedure is gated behind a session.
// The store is reset per test so mutations don't leak across cases.

const authed: Context = {
  session: { user: { id: "u_1", name: "You", email: "you@atb.dev" }, exp: 9_999_999_999 },
};
const caller = () => appRouter.createCaller(authed);

const validInput = {
  name: "Refactor Bot",
  role: "Builder",
  model: "Sonnet 4.5" as const,
  description: "Applies scoped refactors inside an isolated worktree.",
  systemPrompt: "You are a careful refactoring agent. Keep diffs minimal.",
  permissions: { edit: "allow" as const, bash: "ask" as const, network: "deny" as const },
  skills: [] as string[],
  mcps: [] as string[],
};

beforeEach(() => {
  agentsStore.reset();
});

describe("agents router", () => {
  it("lists the seed agents for an authenticated caller", async () => {
    const agents = await caller().agents.list();
    expect(agents).toHaveLength(7);
    expect(agents[0]?.name).toBe("Orchestrator");
    expect(agents[0]?.model).toBe("Opus 4.8");
  });

  it("gets one agent by id with its permissions and system prompt", async () => {
    const agent = await caller().agents.get({ id: "recon" });
    expect(agent.name).toBe("Recon");
    expect(agent.role).toBe("Explorer");
    expect(agent.permissions).toEqual({ edit: "deny", bash: "ask", network: "deny" });
    expect(agent.systemPrompt).toContain("read-only explorer");
  });

  it("throws NOT_FOUND for a missing agent id", async () => {
    await expect(caller().agents.get({ id: "ghost" })).rejects.toThrow(/not found/i);
  });

  it("creates an agent from valid input and makes it retrievable", async () => {
    const before = await caller().agents.list();
    const created = await caller().agents.create(validInput);

    expect(created.name).toBe("Refactor Bot");
    expect(created.status).toBe("idle");
    // Avatar initials are derived from the name.
    expect(created.avatar).toBe("RB");

    const after = await caller().agents.list();
    expect(after).toHaveLength(before.length + 1);
    expect((await caller().agents.get({ id: created.id })).name).toBe("Refactor Bot");
  });

  it("rejects invalid create input at the Zod boundary (empty name)", async () => {
    await expect(caller().agents.create({ ...validInput, name: "" })).rejects.toThrow();
  });

  it("updates an existing agent's editable fields", async () => {
    const updated = await caller().agents.update({
      id: "docs",
      data: { ...validInput, name: "Docs Writer", role: "Scribe" },
    });
    expect(updated.role).toBe("Scribe");
    expect((await caller().agents.get({ id: "docs" })).role).toBe("Scribe");
  });

  it("attaches the skills and MCP servers from the form input on create", async () => {
    const created = await caller().agents.create({
      ...validInput,
      skills: ["code-review", "tdd"],
      mcps: ["github"],
    });
    expect(created.skills).toEqual(["code-review", "tdd"]);
    expect(created.mcps).toEqual(["github"]);
    expect((await caller().agents.get({ id: created.id })).skills).toEqual(["code-review", "tdd"]);
  });

  it("updates an agent's attached skills and MCP servers", async () => {
    const updated = await caller().agents.update({
      id: "docs",
      data: { ...validInput, name: "Docs Writer", skills: ["research"], mcps: ["linear"] },
    });
    expect(updated.skills).toEqual(["research"]);
    expect(updated.mcps).toEqual(["linear"]);
  });

  it("throws NOT_FOUND when updating a missing agent", async () => {
    await expect(caller().agents.update({ id: "ghost", data: validInput })).rejects.toThrow(
      /not found/i,
    );
  });

  it("rejects an unauthenticated caller", async () => {
    const anon = appRouter.createCaller({ session: null });
    await expect(anon.agents.list()).rejects.toThrow();
  });
});
