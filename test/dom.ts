import { screen } from "@testing-library/react";

// Shared RTL query helper. Finds the single <code> element whose full text equals `text`
// — robust to Shiki splitting the content into token spans, since textContent still
// concatenates to the original line (features/sessions diff/canvas tests).
export function codeLine(text: string): HTMLElement {
  return screen.getByText((_content, el) => el?.tagName === "CODE" && el.textContent === text);
}
