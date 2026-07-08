import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { avatarTint } from "./presentation";

// Seam: avatarTint (features/agents/presentation.ts) — the public fn that gives each agent a
// stable identity tint. Its contract: every utility class it returns must be backed by a
// color token actually bound in styles/globals.css (@theme inline). A tint referencing an
// unbound token (e.g. the neutral shadcn `accent` surface, which has no `-bg` binding)
// renders as a dead utility — the trap CLAUDE.md warns about. Independent truth: globals.css.

const themeInline =
  readFileSync(join(process.cwd(), "styles/globals.css"), "utf8")
    .match(/@theme inline\s*\{([\s\S]*?)\}/)?.[1]
    ?.replace(/\/\*[\s\S]*?\*\//g, "") ?? "";
const boundColors = new Set([...themeInline.matchAll(/--color-([\w-]+)\s*:/g)].map((m) => m[1]));

/** The color tokens a tint string references (the `bg-<x>` / `text-<x>` families). */
function colorTokens(tint: string): string[] {
  return tint
    .split(/\s+/)
    .map((cls) => cls.match(/^(?:bg|text|border|ring)-(.+)$/)?.[1])
    .filter((token): token is string => Boolean(token));
}

describe("avatarTint", () => {
  it("returns only classes backed by a color token bound in @theme inline", () => {
    // Hash a spread of seeds so every bucket of the tint palette is exercised.
    const tints = new Set(Array.from({ length: 100 }, (_, i) => avatarTint(`agent-${i}`)));
    const unbound = [...tints].flatMap(colorTokens).filter((token) => !boundColors.has(token));
    expect(unbound).toEqual([]);
  });

  it("is deterministic for a given seed", () => {
    expect(avatarTint("orchestrator")).toBe(avatarTint("orchestrator"));
  });
});
