import { beforeEach, describe, expect, it } from "vitest";
import { mcpStore } from "@/server/services/mcp";
import type { Context } from "../context";
import { appRouter } from "./_app";

// Seam: the MCP servers BFF router via a server-side caller. Assert known-good seed
// literals (including the degraded health state), that writes validate at the Zod
// boundary, and that procedures are gated behind a session. Store reset per test.

const authed: Context = {
  session: { user: { id: "u_1", name: "You", email: "you@atb.dev" }, exp: 9_999_999_999 },
};
const caller = () => appRouter.createCaller(authed);

const validInput = {
  name: "grafana",
  transport: "http" as const,
  auth: "API key",
  description: "Dashboards and alert queries for the review agents.",
};

beforeEach(() => {
  mcpStore.reset();
});

describe("mcp router", () => {
  it("lists the seed servers for an authenticated caller", async () => {
    const servers = await caller().mcp.list();
    expect(servers).toHaveLength(6);
    expect(servers[0]?.name).toBe("github");
    expect(servers[0]?.status).toBe("healthy");
  });

  it("gets one server by id, including its degraded health", async () => {
    const slack = await caller().mcp.get({ id: "slack" });
    expect(slack.status).toBe("degraded");
    expect(slack.latency).toBe("640ms");
    expect(slack.tools).toContain("post_message");
    expect(slack.usedBy).toContain("Orchestrator");
  });

  it("throws NOT_FOUND for a missing server id", async () => {
    await expect(caller().mcp.get({ id: "ghost" })).rejects.toThrow(/not found/i);
  });

  it("reports a toolCount that matches the actual tool roster for every server", async () => {
    const servers = await caller().mcp.list();
    for (const server of servers) {
      expect(server.toolCount).toBe(server.tools.length);
    }
    // github and linear are the two the seed authored inconsistently.
    expect((await caller().mcp.get({ id: "github" })).toolCount).toBe(8);
    expect((await caller().mcp.get({ id: "linear" })).toolCount).toBe(6);
  });

  it("creates a server that defaults to healthy and is retrievable", async () => {
    const before = await caller().mcp.list();
    const created = await caller().mcp.create(validInput);

    expect(created.name).toBe("grafana");
    expect(created.status).toBe("healthy");

    const after = await caller().mcp.list();
    expect(after).toHaveLength(before.length + 1);
    expect((await caller().mcp.get({ id: created.id })).description).toContain("Dashboards");
  });

  it("rejects invalid create input at the Zod boundary (empty name)", async () => {
    await expect(caller().mcp.create({ ...validInput, name: "" })).rejects.toThrow();
  });

  it("updates an existing server's editable fields", async () => {
    const updated = await caller().mcp.update({
      id: "linear",
      data: { ...validInput, name: "linear", description: "Updated." },
    });
    expect(updated.description).toBe("Updated.");
  });

  it("rejects an unauthenticated caller", async () => {
    const anon = appRouter.createCaller({ session: null });
    await expect(anon.mcp.list()).rejects.toThrow();
  });
});
