import { describe, expect, it } from "vitest";
import { formatUsd } from "./format";

// Seam: shared money formatting (lib/format.ts). Framework-free; the analytics dashboard and
// the BFF overview format identically through it. Expected values are worked examples.
describe("formatUsd", () => {
  it("formats with two decimals and thousands separators", () => {
    expect(formatUsd(253.2)).toBe("$253.20");
    expect(formatUsd(2.5)).toBe("$2.50");
    expect(formatUsd(1234.5)).toBe("$1,234.50");
    expect(formatUsd(0)).toBe("$0.00");
  });
});
