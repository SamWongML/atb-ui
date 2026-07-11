import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Design-system contract tests. The seam under test is the *token vocabulary*
 * that the shadcn CLI and component authors consume (the `@theme inline` bindings
 * in globals.css and the semantic tokens in tokens.css), plus the "never hardcode
 * hex" rule from CONTEXT.md. These are not runtime-behaviour tests — jsdom can't
 * run Tailwind — they guard the standards the code review flagged so they can't
 * silently regress.
 */

// Vitest runs with cwd at the repo root (see vitest.config.ts / the run banner).
const repoRoot = process.cwd();
const readRepo = (rel: string) => readFileSync(join(repoRoot, rel), "utf8");

const tokensCss = readRepo("styles/tokens.css");
const globalsCss = readRepo("styles/globals.css");

/** The declarations inside `@theme inline { … }`, comments stripped, as a map. */
function themeInlineDecls(): Map<string, string> {
  const block = globalsCss.match(/@theme inline\s*\{([\s\S]*?)\}/)?.[1] ?? "";
  return declMap(block);
}

/** The first `:root { … }` block of tokens.css — the default (dark) token set. */
function darkRootBlock(): string {
  return tokensCss.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? "";
}

function declMap(cssBlock: string): Map<string, string> {
  const noComments = cssBlock.replace(/\/\*[\s\S]*?\*\//g, "");
  const map = new Map<string, string>();
  for (const match of noComments.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) {
    const [, name, value] = match;
    if (name && value) map.set(name, value.trim());
  }
  return map;
}

function tsxFilesUnder(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(join(repoRoot, dir), { withFileTypes: true })) {
    const rel = `${dir}/${entry.name}`;
    if (entry.isDirectory()) out.push(...tsxFilesUnder(rel));
    else if (entry.name.endsWith(".tsx")) out.push(rel);
  }
  return out;
}

describe("design-system token contract", () => {
  // Finding #1 — shadcn/ui role vocabulary must be bound, so `npx shadcn add`
  // output renders in the ATB look without hand-editing every generated file.
  it("binds the full shadcn/ui role vocabulary in @theme inline", () => {
    const decls = themeInlineDecls();
    const SHADCN_ROLES = [
      "background",
      "foreground",
      "card",
      "card-foreground",
      "popover",
      "popover-foreground",
      "primary",
      "primary-foreground",
      "secondary",
      "secondary-foreground",
      "muted",
      "muted-foreground",
      "accent",
      "accent-foreground",
      "destructive",
      "destructive-foreground",
      "border",
      "input",
      "ring",
    ];
    const missing = SHADCN_ROLES.filter((role) => !decls.has(`--color-${role}`));
    expect(missing).toEqual([]);
  });

  // Finding #2 — the bare `accent` utility is shadcn's neutral hover/selected
  // surface, NOT the brand. The clay brand lives under `primary`.
  it("maps `accent` to a neutral surface and `primary` to the brand", () => {
    const decls = themeInlineDecls();
    expect(decls.get("--color-primary")).toBe("var(--accent)");
    expect(decls.get("--color-accent")).toBe("var(--nav-hover)");
    expect(decls.get("--color-accent-foreground")).toBe("var(--text)");
  });

  it("never uses the bare `accent` utility for brand fills in components", () => {
    // After the remap, `bg-accent` / `text-accent` are neutral — brand fills must
    // use `primary`. (Bare only: `bg-accent-soft`, `bg-accent-2` are not matched.)
    const bareAccent = /\b(?:bg|text|border|ring)-accent(?![\w-])/;
    const offenders = [...tsxFilesUnder("components"), ...tsxFilesUnder("app")].filter((f) =>
      bareAccent.test(readRepo(f)),
    );
    expect(offenders).toEqual([]);
  });

  // Finding #3 — the surface/elevation tokens carry an inline gloss so an agent
  // can tell `inset` from `panel-2` from `raise` without leaving the file.
  it("documents every surface/elevation token", () => {
    const lines = darkRootBlock().split("\n");
    const SURFACE = [
      "--bg",
      "--panel",
      "--panel-2",
      "--inset",
      "--raise",
      "--border",
      "--border-2",
      "--hair",
    ];
    const undocumented = SURFACE.filter((token) => {
      const line = lines.find((l) => l.trim().startsWith(`${token}:`)) ?? "";
      return !line.includes("/*");
    });
    expect(undocumented).toEqual([]);
  });

  // Finding #4 — the accent tint is defined once in the dark set; selection /
  // soft-accent reference it rather than repeating the literal (drift-proof).
  it("defines the dark accent tint once, not triplicated", () => {
    const dark = darkRootBlock();
    const count = (re: RegExp) => dark.match(re)?.length ?? 0;
    expect(count(/var\(--accent\) 15%/g)).toBe(1);
    expect(count(/var\(--accent\) 42%/g)).toBe(1);
  });

  // Finding #5 — CONTEXT.md: "Never hardcode hex." No hardcoded colours in JSX.
  it("uses no hardcoded colours in components or app", () => {
    const hardcoded = /#[0-9a-fA-F]{3,8}\b|(?:bg|text)-(?:white|black)\b/;
    const offenders = [...tsxFilesUnder("components"), ...tsxFilesUnder("app")].filter((f) =>
      hardcoded.test(readRepo(f)),
    );
    expect(offenders).toEqual([]);
  });

  // Finding #6 — no speculative tokens carried ahead of a consumer.
  it("carries no unused speculative tokens", () => {
    const decls = declMap(tokensCss);
    const SPECULATIVE = [
      "--title-font",
      "--back-fg",
      "--back-fg-hover",
      "--back-gap",
      "--back-size",
    ];
    const present = SPECULATIVE.filter((token) => decls.has(token));
    expect(present).toEqual([]);
  });
});

/**
 * Surface layout contract. The design's main pane (design/ATB Agent Platform.dc.html)
 * centers every scrolling surface in one column: max-width 1360px — 820px for
 * chat/reading/form columns — with 26px 30px 70px padding. One token set drives every
 * screen via <Surface> (components/surface.tsx); ad-hoc width caps are how pages
 * drifted to half-width columns.
 */
describe("surface layout contract", () => {
  it("defines the surface layout tokens with the design's dimensions", () => {
    const decls = declMap(tokensCss);
    expect(decls.get("--surface-max-w")).toBe("1360px");
    expect(decls.get("--surface-narrow-max-w")).toBe("820px");
    expect(decls.get("--surface-pad-x")).toBe("30px");
    expect(decls.get("--surface-pad-t")).toBe("26px");
    expect(decls.get("--surface-pad-b")).toBe("70px");
  });

  it("binds the surface tokens into Tailwind's container and spacing namespaces", () => {
    const decls = themeInlineDecls();
    expect(decls.get("--container-surface")).toBe("var(--surface-max-w)");
    expect(decls.get("--container-surface-narrow")).toBe("var(--surface-narrow-max-w)");
    expect(decls.get("--spacing-surface-x")).toBe("var(--surface-pad-x)");
    expect(decls.get("--spacing-surface-t")).toBe("var(--surface-pad-t)");
    expect(decls.get("--spacing-surface-b")).toBe("var(--surface-pad-b)");
  });

  it("caps main-pane columns with surface tokens, never the fixed width scale", () => {
    // components/ui primitives (dialogs) and the standalone (auth) card own their
    // widths; everything else renders inside a <Surface>.
    const scaleCap = /\bmax-w-(?:xs|sm|md|lg|xl|[2-7]xl)\b/;
    const offenders = [
      ...tsxFilesUnder("features"),
      ...tsxFilesUnder("components"),
      ...tsxFilesUnder("app"),
    ].filter(
      (file) =>
        !file.startsWith("components/ui/") &&
        !file.startsWith("app/(auth)/") &&
        !file.endsWith(".test.tsx") &&
        scaleCap.test(readRepo(file)),
    );
    expect(offenders).toEqual([]);
  });
});
