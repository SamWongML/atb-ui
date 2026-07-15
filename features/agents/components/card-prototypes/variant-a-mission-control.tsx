import Link from "next/link";
import { cn } from "@/lib/utils";
import type { Agent } from "../../schema";
import { SESSION_STATE_META, TintAvatar } from "./fragments";
import { agentPulse, repoShort } from "./prototype-data";

// PROTOTYPE — throwaway. Variant A "Mission control": the live-ops treatment. Research basis:
// agent-dashboard patterns (proactive status) say a fleet card must answer "what is it doing
// RIGHT NOW" before anything else — and an agent is a role fanned out into concurrent
// sessions across repos, so the hero is the SESSION STACK: one row per live session
// (state dot · repo · task · elapsed), attention states first. Identity is compressed to one
// row; rollups sink to the footer. Working agents carry a clay ring + live count; idle recede.

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

const STATE_PRIORITY = { needs_you: 0, review: 1, active: 2 } as const;

function MissionCard({ agent }: { agent: Agent }) {
  const pulse = agentPulse(agent);
  const working = agent.status === "working";
  // Triage order: sessions that are blocked on the operator surface first.
  const sessions = [...pulse.sessions].sort(
    (a, b) => STATE_PRIORITY[a.state] - STATE_PRIORITY[b.state],
  );
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
            {pulse.sessions.length} live
          </span>
        ) : (
          <span className="inline-flex shrink-0 items-center rounded-full border border-chip-bd bg-chip px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.1em] text-text-4">
            idle
          </span>
        )}
      </div>

      <div className="rounded-lg border border-hair bg-inset px-3 py-2.5">
        {working ? (
          <div className="flex flex-col gap-1.5">
            {sessions.map((session) => {
              const meta = SESSION_STATE_META[session.state];
              return (
                <p key={session.key} className="flex items-center gap-2 font-mono text-[11px]">
                  <span
                    className={cn(
                      "size-1.5 shrink-0 rounded-full",
                      meta.dotClass,
                      session.state === "active" && "motion-safe:animate-pulse",
                    )}
                    aria-hidden
                  />
                  <span className="shrink-0 text-text-3">{repoShort(session.repo)}</span>
                  <span
                    className={cn(
                      "min-w-0 truncate",
                      session.state === "needs_you" ? "text-amber" : "text-text-2",
                    )}
                  >
                    {session.task}
                  </span>
                  <span className="ml-auto shrink-0 text-[9.5px] text-text-4">
                    {session.elapsed}
                  </span>
                </p>
              );
            })}
          </div>
        ) : (
          <>
            <p className="truncate font-mono text-[11.5px] text-text-4">
              no live sessions — last active {pulse.lastActive}
            </p>
            <p className="mt-1.5 truncate font-mono text-[10.5px] leading-[1.6] text-text-4">
              {pulse.feed[0]}
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <MiniMetric label="queue" value={String(pulse.queued)} />
        <MiniMetric
          label="repos"
          value={String(new Set(pulse.sessions.map((session) => session.repo)).size)}
        />
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
