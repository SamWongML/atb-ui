import { beforeEach, describe, expect, it } from "vitest";
import { skillsStore } from "@/server/services/skills";
import type { Context } from "../context";
import { appRouter } from "./_app";

// Seam: the skills BFF router via a server-side caller. Assert known-good seed literals,
// that writes validate at the Zod boundary and are stamped with the caller as author, and
// that procedures are gated behind a session. Store reset per test.

const authed: Context = {
  session: { user: { id: "u_1", name: "You", email: "you@atb.dev" }, exp: 9_999_999_999 },
};
const caller = () => appRouter.createCaller(authed);

const validInput = {
  name: "Lint Fixer",
  category: "analysis" as const,
  version: "v1.0",
  description: "Applies the shared lint ruleset and fixes drift.",
  summary: "Runs the linter and auto-fixes what it safely can.",
};

beforeEach(() => {
  skillsStore.reset();
});

describe("skills router", () => {
  it("lists the seed skills for an authenticated caller", async () => {
    const skills = await caller().skills.list();
    expect(skills).toHaveLength(6);
    expect(skills[0]?.name).toBe("Test Runner");
    expect(skills[0]?.status).toBe("active");
  });

  it("gets one skill by id with its version history", async () => {
    const skill = await caller().skills.get({ id: "changelog" });
    expect(skill.status).toBe("draft");
    expect(skill.version).toBe("v1.2");
    expect(skill.versionHistory[0]?.version).toBe("v1.2");
  });

  it("throws NOT_FOUND for a missing skill id", async () => {
    await expect(caller().skills.get({ id: "ghost" })).rejects.toThrow(/not found/i);
  });

  it("creates a draft skill stamped with the caller as author", async () => {
    const before = await caller().skills.list();
    const created = await caller().skills.create(validInput);

    expect(created.name).toBe("Lint Fixer");
    expect(created.status).toBe("draft");
    expect(created.author).toBe("You");

    const after = await caller().skills.list();
    expect(after).toHaveLength(before.length + 1);
    expect((await caller().skills.get({ id: created.id })).summary).toContain("auto-fixes");
  });

  it("rejects invalid create input at the Zod boundary (empty name)", async () => {
    await expect(caller().skills.create({ ...validInput, name: "" })).rejects.toThrow();
  });

  it("updates an existing skill's editable fields", async () => {
    const updated = await caller().skills.update({
      id: "repo-map",
      data: { ...validInput, name: "Repo Map", version: "v1.1" },
    });
    expect(updated.version).toBe("v1.1");
  });

  it("appends a version-history entry on a version bump, keeping headline and history in sync", async () => {
    // repo-map seeds a single-entry history at v1.0; bumping the version must not desync them.
    const updated = await caller().skills.update({
      id: "repo-map",
      data: { ...validInput, name: "Repo Map", version: "v1.1" },
    });
    expect(updated.version).toBe("v1.1");
    expect(updated.versionHistory[0]?.version).toBe("v1.1");
    expect(updated.versionHistory).toHaveLength(2);
  });

  it("leaves version history untouched when the version is unchanged", async () => {
    // repo-map is seeded at v1.0; editing copy without a version bump must not add a history row.
    const updated = await caller().skills.update({
      id: "repo-map",
      data: { ...validInput, name: "Repo Map", version: "v1.0", description: "Tweaked copy." },
    });
    expect(updated.description).toBe("Tweaked copy.");
    expect(updated.versionHistory).toHaveLength(1);
  });

  it("rejects an unauthenticated caller", async () => {
    const anon = appRouter.createCaller({ session: null });
    await expect(anon.skills.list()).rejects.toThrow();
  });
});
