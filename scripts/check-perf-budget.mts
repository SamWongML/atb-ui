import { readFileSync } from "node:fs";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import {
  type Budget,
  type BuildManifest,
  checkBudgets,
  sharedFirstLoadBytes,
} from "../lib/perf/budget.ts";

// CI gate for the ARCHITECTURE.md "initial route JS < 200KB" budget (ROADMAP Phase 5).
// Thin glue: reads Next's build manifest, measures the shared first-load JS (the chunks
// every route ships before any route-specific code), and defers the pass/fail decision
// to the tested pure core in lib/perf/budget.ts. Run after `pnpm build`.

const NEXT_DIR = join(import.meta.dirname, "..", ".next");
const KB = 1024;

const budgets: Budget[] = [{ name: "shared-first-load", maxBytes: 200 * KB }];

const manifest = JSON.parse(
  readFileSync(join(NEXT_DIR, "build-manifest.json"), "utf8"),
) as BuildManifest;

const gzipSizeOf = (file: string) => gzipSync(readFileSync(join(NEXT_DIR, file))).length;

const bytes = sharedFirstLoadBytes(manifest, gzipSizeOf);
const violations = checkBudgets([{ name: "shared-first-load", bytes }], budgets);

const kb = (n: number) => `${(n / KB).toFixed(1)}KB`;

if (violations.length > 0) {
  for (const v of violations) {
    console.error(
      `✗ ${v.name}: ${kb(v.bytes)} exceeds ${kb(v.maxBytes)} budget by ${kb(v.overBy)}`,
    );
  }
  process.exit(1);
}

console.info(`✓ shared-first-load: ${kb(bytes)} within ${kb(200 * KB)} budget`);
