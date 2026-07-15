import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Agent } from "../../schema";
import { TintAvatar } from "./fragments";
import { agentPulse } from "./prototype-data";

// PROTOTYPE — throwaway. Variant A "Mission control": the live-ops treatment. Research basis:
// agent-dashboard patterns (proactive status) say a fleet card must answer "what is it doing
// RIGHT NOW" before anything else, with a short activity trace for trust — so the live signal
// is the hero, identity is compressed to one row, and rollups sink to the footer. Working
// agents carry a clay ring + LIVE tag; idle agents recede.

export const MISSION_CONTROL_NAME = "Mission control";

export function VariantMissionControl({ agents }: { agents: readonly Agent[] }) {
  return (
    <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(330px,1fr))]">
      {agents.map((agent) => (
        <MissionCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

function MissionCard({ agent }: { agent: Agent }) {
  const pulse = agentPulse(agent);
  const working = agent.status === "working";
  return (
    <Link
      href={`/agents/${agent.id}`}
      className={cn(
        "group flex flex-col gap-3 rounded-xl border bg-panel p-4 transition-all hover:bg-panel-2 hover:shadow-(--shadow)",
        working ? "border-primary-soft-bd" : "border-hair hover:border-border-2",
      )}
    >
      <div className="flex items-center gap-3">
        <TintAvatar agent={agent} className="size-9 rounded-[10px] text-[12px]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-semibold tracking-[-0.01em] text-text">
            {agent.name}
          </p>
          <p className="truncate font-mono text-[10.5px] text-text-3">
            {agent.role} · {agent.model}
          </p>
        </div>
        {working ? (
          <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-clay-bg px-2 py-0.5 font-mono text-[9.5px] font-semibold uppercase tracking-[0.1em] text-clay">
            <span className="size-1.5 rounded-full bg-clay motion-safe:animate-pulse" aria-hidden />
            live
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center rounded-full border border-chip-bd bg-chip px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-4">
            idle
          </span>
        )}
      </div>

      <div className="rounded-lg border border-hair bg-inset px-3 py-2.5">
        {working ? (
          <p className="truncate font-mono text-[11.5px] text-text-2">
            <span className="text-clay">▸</span> {pulse.currentTask}
          </p>
        ) : (
          <p className="truncate font-mono text-[11.5px] text-text-4">
            idle — last active {pulse.lastActive}
          </p>
        )}
        <div className="mt-1.5 flex flex-col gap-0.5">
          {pulse.feed.slice(0, 2).map((line) => (
            <p key={line} className="truncate font-mono text-[10.5px] leading-[1.6] text-text-4">
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <MiniMetric label="queue" value={String(pulse.queued)} />
        <MiniMetric label="ctx" value={`${pulse.contextPct}%`} />
        <MiniMetric label="today" value={pulse.costToday} />
        <span className="ml-auto font-mono text-[10px] text-text-4">up {pulse.uptime}</span>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-hair pt-2.5 font-mono text-[11px]">
        <span className="text-text-3">
          {agent.usage.tasks} · <span className="text-green">{agent.usage.merged}</span>
        </span>
        <span className="text-text-4 transition-colors group-hover:text-text-2">open →</span>
      </div>
    </Link>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1.5">
      <span className="font-mono text-[9px] uppercase tracking-[0.12em] text-text-4">{label}</span>
      <span className="font-mono text-[11.5px] tabular-nums text-text-2">{value}</span>
    </span>
  );
}
