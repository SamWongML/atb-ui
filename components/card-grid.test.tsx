import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CardGrid } from "./card-grid";

// Seam: CardGrid's public contract is the tokenised auto-fill grid it renders children
// into (columns floor at `--card-col-min`, then flex to 1fr). jsdom can't compute grid
// layout, so assert the exact utility classes.

describe("CardGrid", () => {
  it("renders children in the auto-fill token grid", () => {
    render(<CardGrid>grid body</CardGrid>);
    const grid = screen.getByText("grid body");
    for (const utility of [
      "grid",
      "gap-3.5",
      "[grid-template-columns:repeat(auto-fill,minmax(var(--card-col-min),1fr))]",
    ]) {
      expect(grid.classList.contains(utility)).toBe(true);
    }
  });

  it("merges caller classes onto the grid", () => {
    render(<CardGrid className="mt-2">with margin</CardGrid>);
    expect(screen.getByText("with margin").classList.contains("mt-2")).toBe(true);
  });
});
