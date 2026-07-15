import { leadingNumber } from "@/lib/list-query";
import type { Agent } from "../../schema";

// PROTOTYPE — throwaway (agent-card design gallery, see gallery.tsx). The card treatments
// under evaluation want richer runtime texture than the Agent schema carries today — the
// current task, an activity trend, context pressure, cost-today — so this module fabricates
// plausible values SEEDED FROM THE AGENT ID: identical on server and client (no hydration
// drift) and stable across renders. Every number here is fiction; it ships nowhere and is
// deleted with the gallery.

export type AgentPulse = {
  /** What the agent is doing right now — the "proactive status" line for working agents. */
  currentTask: string;
  /** Recent activity lines, newest first, terminal-flavoured. */
  feed: readonly string[];
  /** Humanised recency — "now" while working, "26m ago" style when idle. */
  lastActive: string;
  /** Tasks waiting on this agent. */
  queued: number;
  /** Context-window pressure, 0–100. */
  contextPct: number;
  /** 12-point normalised activity series (0–1) for sparklines and meters. */
  activity: readonly number[];
  /** Merge rate parsed from usage, plus a fabricated period-over-period delta. */
  successRate: number;
  deltaPct: number;
  tasksCount: number;
  costToday: string;
  uptime: string;
};

function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return hash || 1;
}

/** mulberry32 — tiny deterministic PRNG so the fabricated values are stable per agent. */
function rng(seed: number): () => number {
  let state = seed;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Hand-written "now" lines for the seed roster; created agents fall back to their role.
const TASKS: Record<string, string> = {
  orchestrator: "delegating phase 2/3 → builder · test-runner",
  recon: "mapping billing/v2 module graph — 34 files in",
  builder: "porting stripe client to sdk-v2 · wt/billing-4",
  security: "probing auth diff for injection paths",
  test: "bisecting flaky sessions.spec — run 3/5",
  synth: "drafting PR #482 summary from 3 verdicts",
  docs: "syncing CHANGELOG with shipped diffs",
};

const FEEDS: Record<string, readonly string[]> = {
  orchestrator: [
    "→ handed billing map to builder",
    "✓ phase 1 converged · 3/3 agree",
    "⋯ watching test-runner verdict",
  ],
  recon: [
    "✓ indexed server/billing · 112 modules",
    "→ emitted dep-map v3 to builder",
    "⋯ walking cross-module imports",
  ],
  builder: [
    "✎ billing/client.ts +214 −88",
    "✓ 12 call-sites migrated",
    "⋯ rewriting webhook handler",
  ],
  security: [
    "✓ diff #481 clean — no findings",
    "⚑ flagged secret in fixture (fixed)",
    "⋯ queue empty",
  ],
  test: ["✗ sessions.spec flaked · retrying", "✓ 214 passed · 1 flaky", "⋯ suite idle"],
  synth: [
    "✓ PR #479 summary approved",
    "→ merged 3 verdicts into report",
    "⋯ awaiting next handoff",
  ],
  docs: ["✎ CHANGELOG.md +18", "✓ readme sync for sdk-v2", "⋯ watching merge queue"],
};

const ROLE_TASKS: Record<string, string> = {
  Orchestrator: "planning the next delegation round",
  Explorer: "surveying the target package",
  Builder: "applying edits in an isolated worktree",
  Reviewer: "re-checking the latest diff",
  Synthesizer: "condensing verdicts into a report",
};

const IDLE_AGES = ["9m ago", "26m ago", "1h ago", "2h ago", "5h ago", "yesterday"] as const;
const UPTIMES = ["6d", "12d", "19d", "27d", "41d"] as const;

export function agentPulse(agent: Agent): AgentPulse {
  const seed = hashSeed(agent.id);
  const random = rng(seed);
  const working = agent.status === "working";

  const deltaRaw = random() * 5 - 1.8;
  const deltaPct = Math.round((Math.abs(deltaRaw) < 0.2 ? 0.4 : deltaRaw) * 10) / 10;

  const drift = deltaPct >= 0 ? 0.012 : -0.012;
  const activity: number[] = [];
  let value = 0.3 + random() * 0.3;
  for (let i = 0; i < 12; i += 1) {
    value = Math.min(0.96, Math.max(0.1, value + (random() - 0.5) * 0.22 + drift * i));
    activity.push(Math.round(value * 100) / 100);
  }

  const cost = leadingNumber(agent.usage.cost);
  return {
    currentTask: TASKS[agent.id] ?? ROLE_TASKS[agent.role] ?? "awaiting first delegation",
    feed: FEEDS[agent.id] ?? ["✓ configured and warmed up", "⋯ awaiting first delegation"],
    lastActive: working ? "now" : (IDLE_AGES[seed % IDLE_AGES.length] ?? "1h ago"),
    queued: working ? 1 + Math.floor(random() * 4) : Math.floor(random() * 2),
    contextPct: 16 + Math.floor(random() * 68),
    activity,
    successRate: leadingNumber(agent.usage.merged),
    deltaPct,
    tasksCount: leadingNumber(agent.usage.tasks),
    costToday: `$${(cost * (0.05 + random() * 0.09)).toFixed(2)}`,
    uptime: UPTIMES[seed % UPTIMES.length] ?? "14d",
  };
}
