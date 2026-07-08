import { Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AGENT_STATUS_META, avatarTint } from "../presentation";
import type { Agent } from "../schema";

// The agents roster (README.md §Agents): a static grid of agent cards fed by the RSC page
// through tRPC. Each card links to the agent's detail route; a header action opens the
// create form. A plain grid — this roster isn't a live list, so it needs no virtualization.

export function AgentsList({ agents }: { agents: readonly Agent[] }) {
  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-text">Agents</h1>
          <p className="text-[13px] text-text-3">
            Configured workers — model, permissions, and system prompt.
          </p>
        </div>
        <Link
          href="/agents/new"
          className="inline-flex items-center gap-1.5 rounded-md border border-primary-soft-bd bg-primary-soft px-3 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary-bg"
        >
          <Plus className="size-4" /> New agent
        </Link>
      </header>

      {agents.length === 0 ? (
        <p className="rounded-xl border border-hair bg-panel px-4 py-10 text-center text-[13px] text-text-3">
          No agents yet. Create one to get started.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {agents.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  const status = AGENT_STATUS_META[agent.status];
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="flex flex-col gap-3 rounded-xl border border-hair bg-panel p-4 transition-colors hover:border-border-2 hover:bg-panel-2"
    >
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg font-mono text-[12px] font-semibold",
            avatarTint(agent.id),
          )}
        >
          {agent.avatar}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-medium text-text">{agent.name}</p>
          <p className="truncate text-[12px] text-text-3">{agent.role}</p>
        </div>
        <span
          role="img"
          className={cn("size-2 shrink-0 rounded-full", status.dotClass)}
          aria-label={status.label}
        />
      </div>
      <p className="line-clamp-2 text-[12.5px] leading-relaxed text-text-2">{agent.description}</p>
      <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-4">
        {agent.model}
      </span>
    </Link>
  );
}
