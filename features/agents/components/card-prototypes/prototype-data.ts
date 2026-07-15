import { leadingNumber } from "@/lib/list-query";
import type { Agent } from "../../schema";

// PROTOTYPE — throwaway (agent-card design gallery, see gallery.tsx). The card treatments
// under evaluation want richer runtime texture than the Agent schema carries today — the
// LIVE SESSIONS an agent is running (an agent is a role: one definition, fanned out into
// concurrent sessions across different repos), an activity trend, context pressure,
// cost-today — so this module fabricates plausible values SEEDED FROM THE AGENT ID:
// identical on server and client (no hydration drift) and stable across renders. Every
// number here is fiction; it ships nowhere and is deleted with the gallery.

/** Live lifecycle states a running session can be in (mirrors features/sessions). */
export type PulseSessionState = "active" | "needs_you" | "review";

/** One concurrent session of this agent — its repo, worktree/branch, and live task. */
export type PulseSession = {
  key: string;
  repo: string;
  branch: string;
  task: string;
  state: PulseSessionState;
  elapsed: string;
};

export type AgentPulse = {
  /**
   * The agent's live sessions, one per repo it is currently deployed into. Working
   * agents carry 1–3; idle agents carry none. Each variant orders them to taste.
   */
  sessions: readonly PulseSession[];
  /** What the agent is doing right now — single-line fallback when one line must do. */
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

// Hand-written concurrent sessions for the seed roster — same agent, several repos at
// once, with a mix of live states so every treatment shows the full vocabulary.
const SESSIONS: Record<string, readonly PulseSession[]> = {
  orchestrator: [
    {
      key: "or-1",
      repo: "meridian/console",
      branch: "main",
      task: "delegating phase 2/3 → builder · test-runner",
      state: "active",
      elapsed: "18m",
    },
    {
      key: "or-2",
      repo: "meridian/api",
      branch: "plan/rollout",
      task: "sequencing sdk-v2 rollout phases",
      state: "active",
      elapsed: "6m",
    },
    {
      key: "or-3",
      repo: "meridian/billing",
      branch: "plan/migration",
      task: "migration plan awaiting your sign-off",
      state: "needs_you",
      elapsed: "42m",
    },
  ],
  recon: [
    {
      key: "rc-1",
      repo: "meridian/billing",
      branch: "read-only",
      task: "mapping billing/v2 module graph — 34 files in",
      state: "active",
      elapsed: "11m",
    },
    {
      key: "rc-2",
      repo: "meridian/api",
      branch: "read-only",
      task: "indexing entrypoints + sdk usages",
      state: "active",
      elapsed: "3m",
    },
  ],
  builder: [
    {
      key: "bd-1",
      repo: "meridian/billing",
      branch: "wt/billing-4",
      task: "porting stripe client to sdk-v2",
      state: "active",
      elapsed: "1h 04m",
    },
    {
      key: "bd-2",
      repo: "meridian/api",
      branch: "wt/hooks-1",
      task: "bash approval needed: pnpm migrate",
      state: "needs_you",
      elapsed: "27m",
    },
    {
      key: "bd-3",
      repo: "meridian/console",
      branch: "wt/tokens-2",
      task: "chip retheme ready for review",
      state: "review",
      elapsed: "2h 10m",
    },
  ],
};

const REPO_POOL = [
  "meridian/console",
  "meridian/api",
  "meridian/billing",
  "meridian/docs",
  "meridian/infra",
] as const;
const ELAPSED_POOL = ["4m", "13m", "31m", "58m", "1h 22m"] as const;

const IDLE_AGES = ["9m ago", "26m ago", "1h ago", "2h ago", "5h ago", "yesterday"] as const;
const UPTIMES = ["6d", "12d", "19d", "27d", "41d"] as const;

/** "meridian/billing" → "billing" — cards mostly want the short repo name. */
export function repoShort(repo: string): string {
  return repo.split("/")[1] ?? repo;
}

/** Fallback sessions for agents created at runtime — 1–2 generic ones while working. */
function fabricateSessions(agent: Agent, random: () => number): PulseSession[] {
  if (agent.status !== "working") return [];
  const count = 1 + Math.floor(random() * 2);
  return Array.from({ length: count }, (_, i) => {
    const roll = random();
    return {
      key: `${agent.id}-${i}`,
      repo: REPO_POOL[Math.floor(random() * REPO_POOL.length)] ?? "meridian/console",
      branch: `wt/${agent.id.slice(0, 6)}-${i + 1}`,
      task: ROLE_TASKS[agent.role] ?? "awaiting first delegation",
      state: roll < 0.7 ? "active" : roll < 0.85 ? "review" : "needs_you",
      elapsed: ELAPSED_POOL[Math.floor(random() * ELAPSED_POOL.length)] ?? "12m",
    };
  });
}

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
  const sessions = working ? (SESSIONS[agent.id] ?? fabricateSessions(agent, random)) : [];
  return {
    sessions,
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
