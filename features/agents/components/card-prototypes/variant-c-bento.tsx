import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Agent } from "../../schema";
import { ACCESS_TEXT, SESSION_STATE_META, Sparkline, TintAvatar } from "./fragments";
import { agentPulse, repoShort } from "./prototype-data";

// PROTOTYPE — throwaway. Variant C "Bento cells": the modular treatment. Research basis: the
// bento-grid pattern (strict labeled cells inside one container — "a dashboard of nuggets" you
// can scan in one sweep) applied INSIDE the card: identity, sessions, model, access, stack and
// signal each get a hairline-grouted cell with a tiny caps label, so every fact has a fixed
// address and the eye can jump straight to it. The SESSIONS cell carries the concurrent
// fan-out — one row per repo the agent is deployed into right now.

export const BENTO_NAME = "Bento cells";

export function VariantBento({ agents }: { agents: readonly Agent[] }) {
  return (
    <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(350px,1fr))]">
      {agents.map((agent) => (
        <BentoCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

function BentoCard({ agent }: { agent: Agent }) {
  const pulse = agentPulse(agent);
  const working = agent.status === "working";
  const stack = [
    ...agent.skills.map((label) => ({ kind: "skill" as const, label })),
    ...agent.mcps.map((label) => ({ kind: "mcp" as const, label })),
  ];
  const shown = stack.slice(0, 3);
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="group grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-hair bg-hair transition-all hover:border-border-2 hover:shadow-(--shadow)"
    >
      <div className="col-span-2 flex items-center gap-3 bg-panel p-3.5 transition-colors group-hover:bg-panel-2">
        <TintAvatar agent={agent} className="size-8 rounded-lg text-[11px]" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold tracking-[-0.01em] text-text">
            {agent.name}
          </p>
          <p className="truncate font-mono text-[10.5px] text-text-3">{agent.role}</p>
        </div>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.1em]",
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
          {working ? `${pulse.sessions.length} live` : "idle"}
        </span>
      </div>

      <Cell label={working ? `sessions · ${pulse.sessions.length}` : "sessions"} span>
        {working ? (
          <div className="flex flex-col gap-1">
            {pulse.sessions.slice(0, 3).map((session) => {
              const meta = SESSION_STATE_META[session.state];
              return (
                <p key={session.key} className="flex items-center gap-2 font-mono text-[10.5px]">
                  <span
                    className={cn("size-1.5 shrink-0 rounded-full", meta.dotClass)}
                    aria-hidden
                  />
                  <span className="w-[52px] shrink-0 truncate text-text-3">
                    {repoShort(session.repo)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-text-2">{session.task}</span>
                  <span className="shrink-0 text-[9px] text-text-4">{session.elapsed}</span>
                </p>
              );
            })}
          </div>
        ) : (
          <p className="font-mono text-[11px] text-text-4">none · last active {pulse.lastActive}</p>
        )}
      </Cell>

      <Cell label="model">
        <p className="truncate text-[12px] text-text-2">{agent.model}</p>
        <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-inset">
          <div className="h-full rounded-full bg-blue" style={{ width: `${pulse.contextPct}%` }} />
        </div>
        <p className="mt-1 font-mono text-[9.5px] text-text-4">ctx avg {pulse.contextPct}%</p>
      </Cell>

      <Cell label="access">
        <div className="flex flex-col gap-1">
          {(
            [
              ["edit", agent.permissions.edit],
              ["bash", agent.permissions.bash],
              ["net", agent.permissions.network],
            ] as const
          ).map(([key, value]) => (
            <p key={key} className="flex items-center justify-between font-mono text-[10px]">
              <span className="text-text-3">{key}</span>
              <span className={ACCESS_TEXT[value]}>{value}</span>
            </p>
          ))}
        </div>
      </Cell>

      <Cell label="stack">
        <div className="flex flex-wrap items-center gap-1">
          {shown.length === 0 && <span className="font-mono text-[10px] text-text-4">none</span>}
          {shown.map((item) => (
            <span
              key={`${item.kind}:${item.label}`}
              className={cn(
                "rounded px-1.5 py-0.5 font-mono text-[9.5px]",
                item.kind === "skill" ? "bg-green-bg text-green" : "bg-violet-bg text-violet",
              )}
            >
              {item.label}
            </span>
          ))}
          {stack.length > shown.length && (
            <span className="font-mono text-[9.5px] text-text-4">
              +{stack.length - shown.length}
            </span>
          )}
        </div>
      </Cell>

      <Cell label="signal">
        <Sparkline values={pulse.activity} className="h-6 w-full text-text-3" />
        <p className="mt-1 font-mono text-[9.5px] tabular-nums text-text-4">
          {pulse.tasksCount} runs · {pulse.successRate}%
        </p>
      </Cell>

      <div className="col-span-2 flex items-center justify-between bg-panel-2 px-3.5 py-2 font-mono text-[10.5px]">
        <span className="text-text-3">
          {agent.usage.tasks} · <span className="text-green">{agent.usage.merged}</span> ·{" "}
          {agent.usage.cost}
        </span>
        <span className="text-text-4">{agent.usage.avgTime} avg</span>
      </div>
    </Link>
  );
}

function Cell({ label, span, children }: { label: string; span?: boolean; children: ReactNode }) {
  return (
    <div
      className={cn("bg-panel p-3 transition-colors group-hover:bg-panel-2", span && "col-span-2")}
    >
      <p className="font-mono text-[9px] uppercase tracking-[0.16em] text-text-4">{label}</p>
      <div className="mt-1.5">{children}</div>
    </div>
  );
}
