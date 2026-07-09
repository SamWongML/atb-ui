import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { axe } from "vitest-axe";
import * as axeMatchers from "vitest-axe/matchers";
import { CommandPalette } from "./command-palette";

// vitest-axe@0.1.0 ships an empty extend-expect side-effect module, so register the
// matcher explicitly rather than relying on the (no-op) "vitest-axe/extend-expect" import.
expect.extend(axeMatchers);

declare module "vitest" {
  interface Assertion {
    toHaveNoViolations(): void;
  }
  interface AsymmetricMatchersContaining {
    toHaveNoViolations(): void;
  }
}

// Accessibility coverage (ROADMAP Phase 5; ARCHITECTURE.md §"Cross-cutting budgets" —
// "focus management in dialogs & ⌘K · full keyboard paths"). The ⌘K palette is the
// most keyboard-critical overlay, so we assert axe finds no violations in its open state.

describe("CommandPalette accessibility", () => {
  it("has no axe violations when open", async () => {
    const { container } = render(
      <CommandPalette
        open
        onOpenChange={vi.fn()}
        onNavigate={vi.fn()}
        actions={[{ id: "new-session", label: "New session", hint: "⌘N", run: vi.fn() }]}
      />,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
