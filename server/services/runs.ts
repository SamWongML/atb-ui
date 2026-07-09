import type { Run } from "@/features/runs/schema";
import { createStore } from "./store";

// The BFF's runs data source — an in-memory seed (verbatim from the design mockup), newest
// first, behind the shared read store. Runs are execution history: mostly terminal
// (passed/failed), a couple still running. Failed runs carry a root cause (CONTEXT.md).
// When the orchestration engine comes online this becomes a downstream client and the
// router above it is unchanged.
function seedRuns(): Run[] {
  return [
    {
      id: "run_01",
      source: "pr-review autopilot",
      status: "running",
      model: "claude-opus-4-8",
      startedAt: "just now",
      duration: "—",
      cost: "$0.18",
      steps: { completed: 2, total: 4 },
      rootCause: null,
    },
    {
      id: "run_02",
      source: "nightly dep-upgrade",
      status: "failed",
      model: "claude-sonnet-5",
      startedAt: "12m ago",
      duration: "5m 40s",
      cost: "$0.31",
      steps: { completed: 4, total: 5 },
      rootCause:
        "Type error in packages/api after bumping zod to 4.4 — three call sites broke and the suite never went green.",
    },
    {
      id: "run_03",
      source: "idempotency-review",
      status: "passed",
      model: "claude-opus-4-8",
      startedAt: "26m ago",
      duration: "3m 12s",
      cost: "$0.61",
      steps: { completed: 3, total: 3 },
      rootCause: null,
    },
    {
      id: "run_04",
      source: "coverage-backfill",
      status: "failed",
      model: "claude-haiku-4-5",
      startedAt: "1h ago",
      duration: "48s",
      cost: "$0.04",
      steps: { completed: 1, total: 3 },
      rootCause:
        "Test generation exceeded the step budget before reaching the under-covered module.",
    },
    {
      id: "run_05",
      source: "release-notes",
      status: "passed",
      model: "claude-sonnet-5",
      startedAt: "2h ago",
      duration: "1m 12s",
      cost: "$0.09",
      steps: { completed: 2, total: 2 },
      rootCause: null,
    },
    {
      id: "run_06",
      source: "lint-sweep",
      status: "passed",
      model: "claude-haiku-4-5",
      startedAt: "3h ago",
      duration: "2m 20s",
      cost: "$0.08",
      steps: { completed: 4, total: 4 },
      rootCause: null,
    },
    {
      id: "run_07",
      source: "canary-deploy",
      status: "passed",
      model: "claude-opus-4-8",
      startedAt: "5h ago",
      duration: "6m 02s",
      cost: "$0.88",
      steps: { completed: 4, total: 4 },
      rootCause: null,
    },
  ];
}

export const runsStore = createStore(seedRuns);
