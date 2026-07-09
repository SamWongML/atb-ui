import { describe, expect, it } from "vitest";
import { withShare } from "./share";

// Seam: shared share-of-total math (lib/share.ts). Weights each item by a caller-supplied
// selector and attaches its rounded percentage; the analytics model mix and the BFF overview
// both compute mix shares through it. Worked examples; the zero-total case is the fallback.
describe("withShare", () => {
  it("attaches each item's rounded percentage of the summed weight", () => {
    const items = [{ runs: 30 }, { runs: 10 }, { runs: 10 }];
    expect(withShare(items, (item) => item.runs).map((item) => item.share)).toEqual([60, 20, 20]);
  });

  it("preserves the original fields alongside the share", () => {
    expect(withShare([{ model: "a", runs: 1 }], (item) => item.runs)[0]).toEqual({
      model: "a",
      runs: 1,
      share: 100,
    });
  });

  it("reports zero share for a zero total rather than NaN", () => {
    expect(withShare([{ runs: 0 }], (item) => item.runs).map((item) => item.share)).toEqual([0]);
  });
});
