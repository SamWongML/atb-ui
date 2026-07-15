import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { Agent } from "../../schema";
import { ACCESS_TEXT, SESSION_STATE_META } from "./fragments";
import { agentPulse, repoShort } from "./prototype-data";

// PROTOTYPE — throwaway. Variant D "Dossier": the capability-profile treatment. Research
// basis: the model-card / persona-card lineage — an agent card as a LEGIBLE record of what
// this worker is and is permitted to do, which is what builds operator trust. Editorial
// typography (serif name + prose mandate, à la the app's Newsreader accent), a ruled
// manifest with access spelled out in words, and almost no color. Concurrent deployment
// reads as a "deployed" manifest row — repo@worktree per live session, state-dotted —
// because a personnel file lists postings, it doesn't dramatise them.

export const DOSSIER_NAME = "Dossier";

export function VariantDossier({ agents }: { agents: readonly Agent[] }) {
  return (
    <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(370px,1fr))]">
      {agents.map((agent) => (
        <DossierCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

function DossierCard({ agent }: { agent: Agent }) {
  const pulse = agentPulse(agent);
  const working = agent.status === "working";
  return (
    <Link
      href={`/agents/${agent.id}`}
      className="group flex flex-col rounded-xl border border-hair bg-panel p-5 transition-all hover:border-border-2 hover:bg-panel-2 hover:shadow-(--shadow)"
    >
      <div className="flex items-baseline justify-between font-mono text-[9.5px] uppercase tracking-[0.16em] text-text-4">
        <span className="truncate">agent file · {agent.id}</span>
        <span className={cn("shrink-0", working && "text-clay")}>
          {working ? `● ${pulse.sessions.length} live` : "○ idle"}
        </span>
      </div>

      <p className="mt-3 truncate font-serif text-[22px] font-medium leading-tight tracking-[-0.01em] text-text">
        {agent.name}
      </p>
      <p className="mt-1 truncate font-mono text-[10px] uppercase tracking-[0.14em] text-text-3">
        {agent.role} — runs {agent.model}
      </p>

      <p className="mt-3 line-clamp-3 font-serif text-[14px] leading-relaxed text-text-2">
        {agent.description}
      </p>

      <div className="mt-4 flex flex-col">
        <ManifestRow term="deployed">
          {pulse.sessions.length > 0 ? (
            pulse.sessions.map((session, index) => (
              <span key={session.key}>
                {index > 0 && <span className="text-text-4"> · </span>}
                <span className={SESSION_STATE_META[session.state].textClass}>●</span>{" "}
                {repoShort(session.repo)}
                <span className="text-text-4">@{session.branch}</span>
              </span>
            ))
          ) : (
            <span className="text-text-4">nowhere — last active {pulse.lastActive}</span>
          )}
        </ManifestRow>
        <ManifestRow term="skills">
          {agent.skills.length > 0 ? agent.skills.join(", ") : "—"}
        </ManifestRow>
        <ManifestRow term="servers">
          {agent.mcps.length > 0 ? agent.mcps.join(", ") : "—"}
        </ManifestRow>
        <ManifestRow term="access">
          edit <AccessWord value={agent.permissions.edit} /> · bash{" "}
          <AccessWord value={agent.permissions.bash} /> · network{" "}
          <AccessWord value={agent.permissions.network} />
        </ManifestRow>
      </div>

      <p className="mt-auto border-t border-hair pt-3 font-mono text-[10.5px] text-text-4">
        {agent.usage.tasks} · {agent.usage.merged} · on duty {pulse.uptime}
      </p>
    </Link>
  );
}

function AccessWord({ value }: { value: Agent["permissions"]["edit"] }) {
  return <span className={cn("font-medium", ACCESS_TEXT[value])}>{value}</span>;
}

function ManifestRow({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[76px_1fr] gap-3 border-t border-hair py-2">
      <span className="font-mono text-[9.5px] uppercase leading-[2] tracking-[0.14em] text-text-4">
        {term}
      </span>
      <span className="min-w-0 truncate font-mono text-[11px] leading-[1.9] text-text-2">
        {children}
      </span>
    </div>
  );
}
