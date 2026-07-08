import { beforeEach, describe, expect, it } from "vitest";
import { createStore } from "./store";

// Seam: the in-memory collection the BFF services build on until real downstreams exist.
// Phase 3's build surfaces (agents, mcp, skills, workflows, squads) are all read + a
// little write against a seed; this is the shared CRUD store behind each service.
// Tested directly as a pure unit — list/get/create/update/reset behavior.

type Widget = { id: string; name: string };

function seed(): Widget[] {
  return [
    { id: "a", name: "Alpha" },
    { id: "b", name: "Beta" },
  ];
}

describe("createStore", () => {
  let store: ReturnType<typeof createStore<Widget>>;

  beforeEach(() => {
    store = createStore(seed);
  });

  it("lists the seed items", () => {
    expect(store.list().map((w) => w.id)).toEqual(["a", "b"]);
  });

  it("gets one item by id, or undefined when missing", () => {
    expect(store.get("b")?.name).toBe("Beta");
    expect(store.get("nope")).toBeUndefined();
  });

  it("appends a created item and makes it retrievable", () => {
    const created = store.create({ id: "c", name: "Gamma" });
    expect(created.name).toBe("Gamma");
    expect(store.list()).toHaveLength(3);
    expect(store.get("c")?.name).toBe("Gamma");
  });

  it("merges a patch into an existing item and returns the updated shape", () => {
    const updated = store.update("a", { name: "Alpha 2" });
    expect(updated?.name).toBe("Alpha 2");
    expect(store.get("a")?.name).toBe("Alpha 2");
  });

  it("returns undefined when updating a missing id, leaving the store unchanged", () => {
    expect(store.update("nope", { name: "x" })).toBeUndefined();
    expect(store.list()).toHaveLength(2);
  });

  it("does not mutate the seed source across fresh stores", () => {
    store.create({ id: "c", name: "Gamma" });
    // A second store built from the same seed factory starts clean.
    expect(createStore(seed).list()).toHaveLength(2);
  });

  it("restores the original seed on reset", () => {
    store.create({ id: "c", name: "Gamma" });
    store.update("a", { name: "changed" });
    store.reset();
    expect(store.list().map((w) => w.name)).toEqual(["Alpha", "Beta"]);
  });
});
