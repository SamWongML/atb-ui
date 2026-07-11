import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Scrollbar system contract (companion to tokens.contract.test.ts). The app ships one
 * centralized, tokenized native scrollbar: a styled WebKit bar whose visible thumb is
 * inset inside a wider grab-area ("padded thumb") and fattens on hover by shrinking that
 * inset — never by widening the bar — plus `scrollbar-gutter: stable` on scroll surfaces so
 * the bar's appear/disappear never reflows content. jsdom can't render scrollbars, so — like
 * the token contract — these guard the CSS/token declarations as text so they can't regress.
 */

const repoRoot = process.cwd();
const read = (rel: string) => readFileSync(join(repoRoot, rel), "utf8");
const stripComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const tokensCss = read("styles/tokens.css");
const globalsCss = stripComments(read("styles/globals.css"));

describe("scrollbar system contract", () => {
  // One bar, driven entirely by tokens, so it re-themes with the app and has a single knob.
  it("defines theme-aware --scrollbar-* tokens with no hardcoded colour", () => {
    const root = stripComments(tokensCss.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? "");
    const decl = (name: string) => root.match(new RegExp(`${name}\\s*:\\s*([^;]+);`))?.[1]?.trim();
    expect(decl("--scrollbar-size")).toBe("14px");
    // Thumb colours reference neutrals (var(--…)), so light/dark flip automatically.
    for (const token of [
      "--scrollbar-thumb",
      "--scrollbar-thumb-hover",
      "--scrollbar-thumb-active",
    ]) {
      expect(decl(token)).toMatch(/^var\(--[\w-]+\)$/);
    }
  });

  // The visible thumb sits inside a wider grab-area and fattens on hover by shrinking the
  // inset — never by widening the bar — so a hovered scrollbar can't reflow content.
  it("binds a global ::-webkit-scrollbar theme from the tokens (padded thumb + hover shrink)", () => {
    expect(globalsCss).toMatch(/::-webkit-scrollbar\s*\{[^}]*width:\s*var\(--scrollbar-size\)/);
    expect(globalsCss).toMatch(
      /::-webkit-scrollbar-thumb\s*\{[^}]*background-color:\s*var\(--scrollbar-thumb\)/,
    );
    expect(globalsCss).toMatch(/border:\s*var\(--scrollbar-thumb-inset\)\s+solid\s+transparent/);
    expect(globalsCss).toMatch(/background-clip:\s*padding-box/);
    expect(globalsCss).toMatch(/border-width:\s*var\(--scrollbar-thumb-inset-hover\)/);
  });

  // App scroll surfaces reserve the track so the bar's appear/disappear never shifts layout.
  it("provides .scroll-surface that reserves the gutter (scrollbar-gutter: stable)", () => {
    expect(globalsCss).toMatch(/\.scroll-surface\s*\{[^}]*scrollbar-gutter:\s*stable/);
  });

  it("reserves the gutter on the shell main pane and internal content scrollers", () => {
    const surfaces = [
      "components/app-shell.tsx",
      "features/sessions/components/sessions-list.tsx",
      "features/sessions/components/session-canvas.tsx",
    ];
    for (const file of surfaces) expect(read(file)).toMatch(/scroll-surface/);
  });

  // Minimal + no compat layer: a single WebKit path. The standard scrollbar-width/color
  // properties are intentionally absent (in Chromium they would disable the pseudo-elements).
  it("keeps a single WebKit path — no scrollbar-width/color fallback", () => {
    expect(globalsCss).not.toMatch(/scrollbar-width/);
    expect(globalsCss).not.toMatch(/scrollbar-color/);
  });
});
