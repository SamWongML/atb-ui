import Link from "next/link";
import type { ReactNode } from "react";
import type { Agent } from "../../schema";
import { ACCESS_TEXT, TintAvatar } from "./fragments";
import { agentPulse } from "./prototype-data";

// PROTOTYPE — throwaway. Variant E "Console": the terminal-readout treatment. Research basis:
// the monospace/terminal-inspired dev-tool aesthetic ("Vercel aesthetic": mono type, dot-grid
// texture, dense key-value alignment) — an agent rendered as the output of `atb agent inspect`,
// with an ASCII context meter, allow/ask/deny in ANSI-ish colors and a blinking cursor while
// it works. Technical energy, zero chrome.

export const CONSOLE_NAME = "Console";

export function VariantConsole({ agents }: { agents: readonly Agent[] }) {
  return (
    <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(370px,1fr))]">
      {agents.map((agent) => (
        <ConsoleCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

function contextMeter(pct: number): string {
  const filled = Math.min(8, Math.max(0, Math.round(pct / 12.5)));
  return "▓".repeat(filled) + "░".repeat(8 - filled);
}

function ConsoleCard({ agent }: { agent: Agent }) {
  const pulse = agentPulse(agent);
  const working = agent.status === "working";
  const stack = [...agent.skills, ...agent.mcps];
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="group flex flex-col gap-2.5 rounded-lg border border-border bg-inset p-3.5 font-mono transition-all [background-image:radial-gradient(var(--hair)_1px,transparent_1px)] [background-size:11px_11px] hover:border-border-2 hover:shadow-(--shadow)"
    >
      <p className="truncate text-[10.5px] text-text-4">
        $ atb agent inspect <span className="text-text-3">{agent.id}</span>
      </p>

      <div className="flex items-center gap-2.5">
        <TintAvatar agent={agent} className="size-7 rounded-sm text-[10px]" />
        <p className="min-w-0 flex-1 truncate text-[12.5px] font-semibold text-text">
          {agent.name} <span className="font-normal text-text-4">— {agent.role.toLowerCase()}</span>
        </p>
      </div>

      <div className="flex flex-col gap-1 text-[11px] leading-[1.55]">
        <KV k="status">
          {working ? (
            <span className="text-clay">
              ● working <span className="motion-safe:animate-pulse">▊</span>
            </span>
          ) : (
            <span className="text-text-3">○ idle</span>
          )}
        </KV>
        {working && (
          <KV k="task">
            <span className="text-text-2">{pulse.currentTask}</span>
          </KV>
        )}
        <KV k="model">
          <span className="text-text-2">{agent.model.toLowerCase().replace(" ", "-")}</span>{" "}
          <span className="text-text-4">
            · ctx {contextMeter(pulse.contextPct)} {pulse.contextPct}%
          </span>
        </KV>
        <KV k="access">
          <span className="text-text-4">edit:</span>
          <span className={ACCESS_TEXT[agent.permissions.edit]}>{agent.permissions.edit}</span>
          <span className="text-text-4"> bash:</span>
          <span className={ACCESS_TEXT[agent.permissions.bash]}>{agent.permissions.bash}</span>
          <span className="text-text-4"> net:</span>
          <span className={ACCESS_TEXT[agent.permissions.network]}>
            {agent.permissions.network}
          </span>
        </KV>
        <KV k="stack">
          <span className="text-text-3">{stack.length > 0 ? stack.join(", ") : "none"}</span>
        </KV>
        <KV k="runs">
          <span className="tabular-nums text-text-2">{pulse.tasksCount}</span>
          <span className="text-text-4"> · </span>
          <span className="text-green">{pulse.successRate}% merged</span>
          <span className="text-text-4"> · {agent.usage.cost}</span>
        </KV>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-2 text-[10px] text-text-4">
        <span>
          last {pulse.lastActive} · up {pulse.uptime}
        </span>
        <span className="transition-colors group-hover:text-text-2">↵ open</span>
      </div>
    </Link>
  );
}

function KV({ k, children }: { k: string; children: ReactNode }) {
  return (
    <p className="grid grid-cols-[58px_1fr] gap-2">
      <span className="text-text-4">{k}</span>
      <span className="min-w-0 truncate">{children}</span>
    </p>
  );
}
