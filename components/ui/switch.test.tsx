import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "./switch";

// Seam: the switch's public contract is its ARIA switch role — checked state and the
// controlled change callback — not its internal markup.

describe("Switch", () => {
  it("exposes the checked state through the switch role", () => {
    render(<Switch checked aria-label="Full width" onCheckedChange={() => {}} />);
    expect(screen.getByRole("switch", { name: "Full width" })).toBeChecked();
  });

  it("reports the flipped value on click", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch checked={false} aria-label="Full width" onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByRole("switch", { name: "Full width" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("ignores interaction while disabled", async () => {
    const onCheckedChange = vi.fn();
    render(<Switch checked disabled aria-label="Full width" onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByRole("switch", { name: "Full width" }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
