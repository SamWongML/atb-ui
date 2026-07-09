import { formatUsd, withShare } from "@/features/analytics/presentation";
import type { OverviewSummary } from "@/features/overview/schema";
import { analyticsSnapshot } from "./analytics";
import { mcpStore } from "./mcp";
import { runsStore } from "./runs";
import { listSessions } from "./sessions";

// The BFF's overview composition — the home ties the other surfaces together (README.md
// §Overview), so unlike the single-domain services it reads several stores and projects them
// into one self-contained summary: live counts (active sessions, degraded servers), the
// 7-day rollup (analytics), and the most recent runs as the activity feed + failure list. It
// reuses the analytics formatters so the home's numbers read identically to that surface.

const ACTIVITY_LIMIT = 5;

export function overviewSummary(): OverviewSummary {
  const analytics = analyticsSnapshot();
  const runs = runsStore.list();
  const activeSessions = listSessions().filter((session) => session.status === "active").length;
  const degraded = mcpStore.list().filter((server) => server.status === "degraded").length;

  return {
    stats: [
      { label: "Active sessions", value: String(activeSessions) },
      { label: "Runs · 7d", value: analytics.totalRuns.toLocaleString("en-US") },
      { label: "Spend · 7d", value: formatUsd(analytics.totalCost) },
      { label: "Degraded servers", value: String(degraded) },
    ],
    activity: runs.slice(0, ACTIVITY_LIMIT).map((run) => ({
      id: run.id,
      title: run.source,
      status: run.status,
      meta: `${run.model} · ${run.startedAt}`,
      href: `/runs/${run.id}`,
    })),
    failures: runs
      .filter((run) => run.status === "failed")
      .map((run) => ({
        id: run.id,
        title: run.source,
        rootCause: run.rootCause ?? "",
        href: `/runs/${run.id}`,
      })),
    modelMix: withShare(analytics.modelMix).map((model) => ({
      model: model.model,
      share: model.share,
    })),
  };
}
