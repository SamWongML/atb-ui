import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { ThemeToggle } from "./theme-toggle";

// Seam (CONTEXT.md §Theme): observe `data-theme` on the root and localStorage — the
// public effects of lib/theme.ts — never the component's internal state.

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeToggle", () => {
  it("marks the active theme as checked (dark by default)", async () => {
    render(<ThemeToggle />);
    // Effects settle the control to the resolved theme.
    expect(await screen.findByRole("radio", { name: /dark/i })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("switches to light and persists the choice", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("radio", { name: /light/i }));

    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
    expect(window.localStorage.getItem("atb-theme")).toBe("light");
    expect(screen.getByRole("radio", { name: /light/i })).toHaveAttribute("aria-checked", "true");
  });

  it("switches back to dark", async () => {
    const user = userEvent.setup();
    render(<ThemeToggle />);
    await user.click(screen.getByRole("radio", { name: /light/i }));
    await user.click(screen.getByRole("radio", { name: /dark/i }));

    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
    expect(window.localStorage.getItem("atb-theme")).toBe("dark");
  });
});
