import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Surface } from "./surface";

// Seam: Surface's public contract is the token-utility column it renders children
// into (design §main: centered 1360px cap — 820px narrow — padding 26px 30px 70px).
// jsdom can't compute Tailwind layout, so assert the exact utility classes; these are
// the component's whole observable behaviour, not incidental structure.

describe("Surface", () => {
  it("renders children inside the wide centered column with the design padding", () => {
    render(<Surface>hello surface</Surface>);
    const column = screen.getByText("hello surface");
    for (const utility of [
      "mx-auto",
      "w-full",
      "max-w-surface",
      "px-surface-x",
      "pt-surface-t",
      "pb-surface-b",
    ]) {
      expect(column.classList.contains(utility)).toBe(true);
    }
  });

  it("caps chat/reading/form columns at the narrow token", () => {
    render(<Surface narrow>narrow column</Surface>);
    const column = screen.getByText("narrow column");
    expect(column.classList.contains("max-w-surface-narrow")).toBe(true);
    expect(column.classList.contains("max-w-surface")).toBe(false);
  });

  it("bounds fill surfaces to the pane height for internally scrolling content", () => {
    render(<Surface fill>fill column</Surface>);
    const column = screen.getByText("fill column");
    expect(column.classList.contains("h-full")).toBe(true);
    expect(column.classList.contains("pb-surface-t")).toBe(true);
    expect(column.classList.contains("pb-surface-b")).toBe(false);
  });

  it("merges caller layout classes onto the column", () => {
    render(<Surface className="gap-5">with gap</Surface>);
    expect(screen.getByText("with gap").classList.contains("gap-5")).toBe(true);
  });
});
