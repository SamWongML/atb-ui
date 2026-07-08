import { describe, expect, it } from "vitest";
import { pipelineOrder } from "./presentation";

// Seam: pipelineOrder (features/workflows/presentation.ts). A workflow is a pipeline of nodes
// + connections (CONTEXT.md); this linearizes it for display by following the connections,
// independent of the order the nodes happen to be stored in.
describe("pipelineOrder", () => {
  it("orders nodes by following the connections, not their array order", () => {
    const nodes = [
      { id: "b", agent: "BD" },
      { id: "c", agent: "SR" },
      { id: "a", agent: "PL" },
    ];
    const connections = [
      { from: "a", to: "b" },
      { from: "b", to: "c" },
    ];
    expect(pipelineOrder(nodes, connections).map((node) => node.agent)).toEqual(["PL", "BD", "SR"]);
  });

  it("returns an empty pipeline unchanged", () => {
    expect(pipelineOrder([], [])).toEqual([]);
  });
});
