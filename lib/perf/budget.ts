// Performance-budget enforcement (ROADMAP Phase 5 — "performance-budget enforcement
// in CI"; ARCHITECTURE.md §"Cross-cutting budgets": initial route JS < 200KB). Pure
// core so it's exercised at the seam; the build-manifest I/O lives in the thin
// scripts/check-perf-budget.mjs glue that feeds these fns real numbers.

/** The subset of Next's `.next/build-manifest.json` that determines shared first-load JS. */
export type BuildManifest = { polyfillFiles: string[]; rootMainFiles: string[] };

export type Budget = { name: string; maxBytes: number };
export type Measurement = { name: string; bytes: number };
export type Violation = { name: string; bytes: number; maxBytes: number; overBy: number };

/**
 * Total gzipped bytes of the JS every route loads before any route-specific code:
 * the polyfills plus the shared root chunks. Each chunk is counted once. `gzipSizeOf`
 * returns the transfer (gzipped) size of a chunk path — the number Next reports as
 * "First Load JS".
 */
export function sharedFirstLoadBytes(
  manifest: BuildManifest,
  gzipSizeOf: (file: string) => number,
): number {
  const chunks = new Set([...manifest.polyfillFiles, ...manifest.rootMainFiles]);
  let bytes = 0;
  for (const chunk of chunks) bytes += gzipSizeOf(chunk);
  return bytes;
}

/**
 * Compare measured bundle sizes against their budgets. Returns one violation per
 * budget whose measured size exceeds `maxBytes` (empty = all within budget).
 */
export function checkBudgets(measurements: Measurement[], budgets: Budget[]): Violation[] {
  const bytesByName = new Map(measurements.map((m) => [m.name, m.bytes]));

  const violations: Violation[] = [];
  for (const budget of budgets) {
    const bytes = bytesByName.get(budget.name);
    if (bytes === undefined) {
      throw new Error(`No measurement for budgeted bundle "${budget.name}"`);
    }
    if (bytes > budget.maxBytes) {
      violations.push({
        name: budget.name,
        bytes,
        maxBytes: budget.maxBytes,
        overBy: bytes - budget.maxBytes,
      });
    }
  }
  return violations;
}
