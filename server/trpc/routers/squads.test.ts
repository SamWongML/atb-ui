import { beforeEach, describe, expect, it } from "vitest";
import { squadsStore } from "@/server/services/squads";
import type { Context } from "../context";
import { appRouter } from "./_app";

// Seam: the squads BFF router via a server-side caller. Assert known-good seed literals
// (including nested recent runs), that writes validate at the Zod boundary, and that
// procedures are gated behind a session. Store reset per test.

const authed: Context = {
  session: { user: { id: "u_1", name: "You", email: "you@atb.dev" }, exp: 9_999_999_999 },
};
const caller = () => appRouter.createCaller(authed);

const validInput = {
  name: "Search Migration Squad",
  mission: "Move search onto OpenSearch",
  repo: "meridian/data",
  lead: "OR",
  phase: "Plan",
  stepsTotal: 5,
  members: [] as string[],
};

beforeEach(() => {
  squadsStore.reset();
});

describe("squads router", () => {
  it("lists the seed squads for an authenticated caller", async () => {
    const squads = await caller().squads.list();
    expect(squads).toHaveLength(2);
    expect(squads[0]?.name).toBe("Auth Migration Squad");
    expect(squads[0]?.status).toBe("active");
    expect(squads[0]?.lead).toBe("OR");
  });

  it("gets one squad by id with its recent runs", async () => {
    const squad = await caller().squads.get({ id: "platform-maintenance" });
    expect(squad.status).toBe("idle");
    expect(squad.stepsTotal).toBe(4);
    expect(squad.recentRuns[0]?.status).toBe("failed");
  });

  it("throws NOT_FOUND for a missing squad id", async () => {
    await expect(caller().squads.get({ id: "ghost" })).rejects.toThrow(/not found/i);
  });

  it("creates an idle squad and makes it retrievable", async () => {
    const before = await caller().squads.list();
    const created = await caller().squads.create(validInput);

    expect(created.name).toBe("Search Migration Squad");
    expect(created.status).toBe("idle");
    expect(created.stepsDone).toBe(0);
    expect(created.stepsTotal).toBe(5);

    const after = await caller().squads.list();
    expect(after).toHaveLength(before.length + 1);
    expect((await caller().squads.get({ id: created.id })).mission).toContain("OpenSearch");
  });

  it("rejects invalid create input at the Zod boundary (empty name)", async () => {
    await expect(caller().squads.create({ ...validInput, name: "" })).rejects.toThrow();
  });

  it("updates an existing squad's editable fields", async () => {
    const updated = await caller().squads.update({
      id: "platform-maintenance",
      data: { ...validInput, name: "Platform Maintenance", phase: "Sweep" },
    });
    expect(updated.phase).toBe("Sweep");
  });

  it("rosters the members from the form input on create", async () => {
    const created = await caller().squads.create({ ...validInput, members: ["BD", "SR"] });
    expect(created.members).toEqual(["BD", "SR"]);
    expect((await caller().squads.get({ id: created.id })).members).toEqual(["BD", "SR"]);
  });

  it("updates a squad's member roster", async () => {
    const updated = await caller().squads.update({
      id: "platform-maintenance",
      data: { ...validInput, name: "Platform Maintenance", members: ["TR"] },
    });
    expect(updated.members).toEqual(["TR"]);
  });

  it("rejects an unauthenticated caller", async () => {
    const anon = appRouter.createCaller({ session: null });
    await expect(anon.squads.list()).rejects.toThrow();
  });
});
