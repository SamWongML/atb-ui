import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Agent } from "../../schema";
import { Sparkline, TintAvatar, TrendBadge } from "./fragments";
import { agentPulse } from "./prototype-data";

// PROTOTYPE — throwaway. Variant B "Scorecard": the observability treatment. Research basis:
// KPI-card anatomy (label → headline value → delta badge → word-sized sparkline) and Tufte's
// "a current number is useless without history" — plus the metric vocabulary agent-observability
// tools converge on (runs, success rate, tokens, cost, latency). Identity is compressed to a
// single line; the numbers are the card.

export const SCORECARD_NAME = "Scorecard";

export function VariantScorecard({ agents }: { agents: readonly Agent[] }) {
  return (
    <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(290px,1fr))]">
      {agents.map((agent) => (
        <ScoreCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

function ScoreCard({ agent }: { agent: Agent }) {
  const pulse = agentPulse(agent);
  const working = agent.status === "working";
  const stats = [
    ["tasks", String(pulse.tasksCount)],
    ["tokens", agent.usage.tokens],
    ["cost", agent.usage.cost],
    ["avg run", agent.usage.avgTime],
  ] as const;
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="group flex flex-col gap-3.5 rounded-xl border border-hair bg-panel p-4 transition-all hover:border-border-2 hover:bg-panel-2 hover:shadow-(--shadow)"
    >
      <div className="flex items-center gap-2">
        <TintAvatar agent={agent} className="size-6 rounded-md text-[9.5px]" />
        <p className="min-w-0 flex-1 truncate text-[13px] font-medium text-text">{agent.name}</p>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.08em]",
            working ? "text-clay" : "text-text-4",
          )}
        >
          <span
            className={cn(
              "size-1.5 rounded-full",
              working ? "bg-clay motion-safe:animate-pulse" : "bg-text-4",
            )}
            aria-hidden
          />
          {agent.status}
        </span>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[9.5px] uppercase tracking-[0.14em] text-text-4">
            merge rate · 30d
          </p>
          <p className="mt-1 flex items-baseline gap-2">
            <span className="text-[27px] font-semibold leading-none tracking-[-0.02em] tabular-nums text-text">
              {pulse.successRate}%
            </span>
            <TrendBadge delta={pulse.deltaPct} />
          </p>
        </div>
        <Sparkline
          values={pulse.activity}
          className={cn("h-8 w-[88px] shrink-0", pulse.deltaPct >= 0 ? "text-green" : "text-red")}
        />
      </div>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-hair bg-hair">
        {stats.map(([label, value]) => (
          <div key={label} className="bg-panel-2 px-2.5 py-2">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-4">{label}</p>
            <p className="mt-0.5 truncate font-mono text-[12px] tabular-nums text-text-2">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-hair pt-2.5 font-mono text-[10.5px]">
        <span className="rounded border border-chip-bd bg-chip px-1.5 py-0.5 text-text-3">
          {agent.model}
        </span>
        <span className="text-text-4">active {pulse.lastActive}</span>
      </div>
    </Link>
  );
}
