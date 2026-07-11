import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Card, CardFooter } from "./card";

// Seam: Card/CardFooter's public contract is the tokenised card shell they render — the
// `--card-min-h` floor, the `flex flex-col` column, and the footer's `mt-auto` pin that
// keeps grid-stretched rows uniform without clipping. jsdom can't compute Tailwind layout,
// so assert the exact utility classes; these are the whole observable behaviour.

describe("Card", () => {
  it("renders the tokenised solid shell by default", () => {
    render(<Card>solid card</Card>);
    const card = screen.getByText("solid card");
    for (const utility of [
      "flex",
      "flex-col",
      "h-(--card-h)",
      "rounded-xl",
      "p-4",
      "border-hair",
      "bg-panel",
    ]) {
      expect(card.classList.contains(utility)).toBe(true);
    }
  });

  it("renders the dashed placeholder variant", () => {
    render(<Card variant="dashed">placeholder</Card>);
    const card = screen.getByText("placeholder");
    expect(card.classList.contains("border-dashed")).toBe(true);
    expect(card.classList.contains("items-center")).toBe(true);
    expect(card.classList.contains("bg-panel")).toBe(false);
  });

  it("slots its shell onto the child element with asChild", () => {
    render(
      <Card asChild>
        <a href="/agents/1">link card</a>
      </Card>,
    );
    const link = screen.getByText("link card");
    expect(link.tagName).toBe("A");
    expect(link.classList.contains("h-(--card-h)")).toBe(true);
  });

  it("merges caller classes onto the shell", () => {
    render(<Card className="col-span-2">wide</Card>);
    expect(screen.getByText("wide").classList.contains("col-span-2")).toBe(true);
  });
});

describe("CardFooter", () => {
  it("pins the trailing row to the bottom of the card column", () => {
    render(<CardFooter>meta</CardFooter>);
    const footer = screen.getByText("meta");
    for (const utility of ["mt-auto", "border-t", "border-hair", "pt-3"]) {
      expect(footer.classList.contains(utility)).toBe(true);
    }
  });
});
