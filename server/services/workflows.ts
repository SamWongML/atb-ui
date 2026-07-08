import type { Workflow, WorkflowConnection, WorkflowNode } from "@/features/workflows/schema";
import { createStore } from "./store";

// Build a linear pipeline — one node per agent, wired in sequence — from a mono list. The seed
// pipelines are linear; the schema (nodes + connections) can express branching when needed.
function linearPipeline(agents: string[]): {
  nodes: WorkflowNode[];
  connections: WorkflowConnection[];
} {
  const nodes = agents.map((agent, i) => ({ id: `n${i + 1}`, agent }));
  const connections = nodes.flatMap((node, i) => {
    const next = nodes[i + 1];
    return next ? [{ from: node.id, to: next.id }] : [];
  });
  return { nodes, connections };
}

// The BFF's workflows data source — an in-memory seed (verbatim from the design mockup)
// behind the shared CRUD store. When the orchestration engine comes online this becomes a
// downstream client and the router above is unchanged.
function seedWorkflows(): Workflow[] {
  return [
    {
      id: "idem-review",
      name: "idempotency-review",
      description:
        "Plan → implement → review a scoped change, then open a PR when the suite is green.",
      trigger: "manual",
      triggerDetail: "or on PR → meridian/api",
      status: "active",
      steps: 3,
      runs: "142",
      success: "98%",
      cost: "$61.20",
      avgTime: "3m 12s",
      lastRun: "2m ago",
      ...linearPipeline(["PL", "BD", "SR"]),
    },
    {
      id: "nightly-dep",
      name: "nightly dep-upgrade",
      description:
        "Survey outdated deps, bump the safe ones, run the suite, and withhold the PR on any regression.",
      trigger: "schedule",
      triggerDetail: "0 3 * * · daily 03:00",
      status: "active",
      steps: 5,
      runs: "30",
      success: "90%",
      cost: "$31.00",
      avgTime: "5m 40s",
      lastRun: "03:46 today",
      ...linearPipeline(["RC", "BD", "TR"]),
    },
    {
      id: "pr-review",
      name: "pr-review autopilot",
      description:
        "Adversarially review every opened PR, run the impacted tests, and post a verdict as a check.",
      trigger: "pr",
      triggerDetail: "on PR opened · meridian/*",
      status: "active",
      steps: 3,
      runs: "388",
      success: "94%",
      cost: "$96.00",
      avgTime: "1m 02s",
      lastRun: "26m ago",
      ...linearPipeline(["SR", "TR", "SY"]),
    },
    {
      id: "lint-sweep",
      name: "lint-sweep",
      description:
        "Enforce the shared lint ruleset repo-wide and open a fix PR per package that drifts.",
      trigger: "schedule",
      triggerDetail: "0 6 * * 1 · weekly Mon",
      status: "paused",
      steps: 4,
      runs: "12",
      success: "100%",
      cost: "$8.40",
      avgTime: "2m 20s",
      lastRun: "1 week ago",
      ...linearPipeline(["BD", "TR"]),
    },
    {
      id: "release-notes",
      name: "release-notes",
      description: "Draft human-facing release notes from the PRs merged since the last tag.",
      trigger: "manual",
      triggerDetail: "triggered on tag push",
      status: "active",
      steps: 2,
      runs: "24",
      success: "100%",
      cost: "$2.60",
      avgTime: "1m 12s",
      lastRun: "yesterday",
      ...linearPipeline(["DW", "SR"]),
    },
    {
      id: "coverage",
      name: "coverage-backfill",
      description:
        "Find modules under the coverage threshold and generate test scaffolds for a human to accept.",
      trigger: "schedule",
      triggerDetail: "0 2 * * 6 · weekly Sat",
      status: "draft",
      steps: 3,
      runs: "—",
      success: "—",
      cost: "—",
      avgTime: "—",
      lastRun: "never",
      ...linearPipeline(["BD", "TR"]),
    },
  ];
}

export const workflowsStore = createStore(seedWorkflows);
