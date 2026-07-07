import { beforeEach, describe, expect, it } from "vitest";
import { getCurrentTheme, resolveInitialTheme, setTheme, toggleTheme } from "./theme";

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("theme", () => {
  it("defaults to dark when nothing is stored", () => {
    expect(resolveInitialTheme()).toBe("dark");
  });

  it("applies the chosen theme to the document root", () => {
    setTheme("light");
    expect(document.documentElement.getAttribute("data-theme")).toBe("light");
  });

  it("persists the choice so it is restored on the next load", () => {
    setTheme("light");
    // Simulate a fresh load: the applied attribute is gone but storage remains.
    document.documentElement.removeAttribute("data-theme");
    expect(resolveInitialTheme()).toBe("light");
  });

  it("toggles between dark and light", () => {
    setTheme("dark");
    expect(toggleTheme()).toBe("light");
    expect(getCurrentTheme()).toBe("light");
    expect(toggleTheme()).toBe("dark");
    expect(getCurrentTheme()).toBe("dark");
  });
});
