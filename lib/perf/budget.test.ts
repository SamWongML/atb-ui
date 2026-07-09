import { describe, expect, it } from "vitest";
import { checkBudgets, sharedFirstLoadBytes } from "./budget";

describe("checkBudgets", () => {
  it("flags a bundle over its budget, reporting how far over", () => {
    const violations = checkBudgets(
      [{ name: "shared-first-load", bytes: 210_000 }],
      [{ name: "shared-first-load", maxBytes: 200_000 }],
    );

    expect(violations).toEqual([
      { name: "shared-first-load", bytes: 210_000, maxBytes: 200_000, overBy: 10_000 },
    ]);
  });

  it("passes a bundle within its budget", () => {
    expect(
      checkBudgets(
        [{ name: "shared-first-load", bytes: 168_000 }],
        [{ name: "shared-first-load", maxBytes: 200_000 }],
      ),
    ).toEqual([]);
  });

  it("throws when a budgeted bundle is missing (renamed or dropped), never silently passing", () => {
    expect(() => checkBudgets([], [{ name: "shared-first-load", maxBytes: 200_000 }])).toThrow(
      /shared-first-load/,
    );
  });
});

describe("sharedFirstLoadBytes", () => {
  const sizerFor =
    (sizes: Map<string, number>) =>
    (file: string): number => {
      const bytes = sizes.get(file);
      if (bytes === undefined) throw new Error(`no size for ${file}`);
      return bytes;
    };

  it("sums the gzipped size of every polyfill and root chunk a route loads first", () => {
    const manifest = {
      polyfillFiles: ["static/chunks/polyfill.js"],
      rootMainFiles: ["static/chunks/a.js", "static/chunks/b.js"],
    };
    const sizer = sizerFor(
      new Map([
        ["static/chunks/polyfill.js", 30_000],
        ["static/chunks/a.js", 80_000],
        ["static/chunks/b.js", 58_000],
      ]),
    );

    expect(sharedFirstLoadBytes(manifest, sizer)).toBe(168_000);
  });

  it("counts a chunk once even when it appears in both lists", () => {
    const manifest = {
      polyfillFiles: ["static/chunks/shared.js"],
      rootMainFiles: ["static/chunks/shared.js", "static/chunks/a.js"],
    };
    const sizer = sizerFor(
      new Map([
        ["static/chunks/shared.js", 30_000],
        ["static/chunks/a.js", 80_000],
      ]),
    );

    expect(sharedFirstLoadBytes(manifest, sizer)).toBe(110_000);
  });
});
