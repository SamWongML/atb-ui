import Link from "next/link";
import { cn } from "@/lib/utils";
import { avatarTint } from "../../presentation";
import type { Agent } from "../../schema";
import { AccessPips, SESSION_STATE_META, TintAvatar } from "./fragments";
import { agentPulse, repoShort } from "./prototype-data";

// PROTOTYPE — throwaway. Variant F "Hover reveal": the progressive-disclosure treatment.
// Research basis: keep the resting card glanceable — identity, tint glow, and the session
// fan-out compressed to one state-colored dot per live session — and slide a detail layer
// up on hover/focus: the session list (repo · task) while deployed, the mandate while idle,
// plus numbers and quick actions. A persistent "hover for detail" hint keeps the disclosure
// discoverable, and focus-within mirrors hover for keyboard users.

export const REVEAL_NAME = "Hover reveal";

export function VariantReveal({ agents }: { agents: readonly Agent[] }) {
  return (
    <div className="grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(240px,1fr))]">
      {agents.map((agent) => (
        <RevealCard key={agent.id} agent={agent} />
      ))}
    </div>
  );
}

function RevealCard({ agent }: { agent: Agent }) {
  const pulse = agentPulse(agent);
  const working = agent.status === "working";
  const stack = [
    ...agent.skills.map((label) => ({ kind: "skill" as const, label })),
    ...agent.mcps.map((label) => ({ kind: "mcp" as const, label })),
  ].slice(0, 3);
  return (
    <div className="group relative h-[240px] overflow-hidden rounded-xl border border-hair bg-panel transition-all hover:border-border-2 hover:shadow-(--shadow)">
      <Link
        href={`/agents/${agent.id}`}
        className="relative flex h-full w-full flex-col items-center justify-center gap-3 px-4 pb-10 text-center transition-transform duration-300 ease-out group-focus-within:-translate-y-10 group-hover:-translate-y-10 motion-reduce:transition-none"
      >
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute top-8 left-1/2 size-28 -translate-x-1/2 rounded-full opacity-60 blur-3xl transition-opacity duration-300 group-hover:opacity-100",
            avatarTint(agent.id),
          )}
        />
        <TintAvatar agent={agent} className="relative size-14 rounded-2xl text-[17px]" />
        <span className="relative flex w-full min-w-0 flex-col items-center gap-1">
          <span className="w-full truncate text-[14.5px] font-semibold tracking-[-0.01em] text-text">
            {agent.name}
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-text-3">
            {agent.role}
          </span>
          <span className="mt-1 inline-flex items-center gap-1.5 font-mono text-[10.5px] text-text-4">
            {working ? (
              <>
                <span className="inline-flex items-center gap-1" aria-hidden>
                  {pulse.sessions.map((session) => (
                    <span
                      key={session.key}
                      className={cn(
                        "size-1.5 rounded-full",
                        SESSION_STATE_META[session.state].dotClass,
                        session.state === "active" && "motion-safe:animate-pulse",
                      )}
                    />
                  ))}
                </span>
                {pulse.sessions.length} live session{pulse.sessions.length === 1 ? "" : "s"}
              </>
            ) : (
              <>
                <span className="size-1.5 rounded-full bg-text-4" aria-hidden />
                idle · {pulse.lastActive}
              </>
            )}
          </span>
        </span>
      </Link>

      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-2 text-center font-mono text-[9px] uppercase tracking-[0.18em] text-text-4 transition-opacity duration-200 group-focus-within:opacity-0 group-hover:opacity-0"
      >
        hover for detail
      </span>

      <div className="absolute inset-x-0 bottom-0 translate-y-full border-t border-hair bg-panel-2 p-3 transition-transform duration-300 ease-out group-focus-within:translate-y-0 group-hover:translate-y-0 motion-reduce:transition-none">
        {working ? (
          <div className="flex flex-col gap-1">
            {pulse.sessions.slice(0, 2).map((session) => {
              const meta = SESSION_STATE_META[session.state];
              return (
                <p key={session.key} className="flex items-center gap-1.5 font-mono text-[10.5px]">
                  <span className={cn("size-1 shrink-0 rounded-full", meta.dotClass)} aria-hidden />
                  <span className="shrink-0 text-text-3">{repoShort(session.repo)}</span>
                  <span className="min-w-0 truncate text-text-2">{session.task}</span>
                </p>
              );
            })}
            {pulse.sessions.length > 2 && (
              <p className="font-mono text-[9.5px] text-text-4">
                +{pulse.sessions.length - 2} more session
                {pulse.sessions.length - 2 === 1 ? "" : "s"}
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="line-clamp-2 text-[11.5px] leading-snug text-text-2">
              {agent.description}
            </p>
            <div className="mt-2 flex items-center gap-1.5 overflow-hidden">
              {stack.map((item) => (
                <span
                  key={`${item.kind}:${item.label}`}
                  className={cn(
                    "shrink-0 rounded px-1.5 py-0.5 font-mono text-[9.5px]",
                    item.kind === "skill" ? "bg-green-bg text-green" : "bg-violet-bg text-violet",
                  )}
                >
                  {item.label}
                </span>
              ))}
            </div>
          </>
        )}
        <div className="mt-2 flex items-center justify-between font-mono text-[10.5px] text-text-3">
          <span>
            {agent.usage.tasks} · <span className="text-green">{agent.usage.merged}</span>
          </span>
          <span>{agent.usage.cost}</span>
        </div>
        <div className="mt-2.5 flex items-center gap-1.5">
          <Link
            href={`/agents/${agent.id}`}
            className="inline-flex h-7 items-center rounded-md border border-primary-soft-bd bg-primary-soft px-2.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary-bg"
          >
            Open
          </Link>
          <Link
            href={`/agents/${agent.id}/edit`}
            className="inline-flex h-7 items-center rounded-md border border-chip-bd bg-chip px-2.5 text-[11px] font-medium text-text-2 transition-colors hover:border-border-2"
          >
            Edit
          </Link>
          <span className="ml-auto">
            <AccessPips permissions={agent.permissions} />
          </span>
        </div>
      </div>
    </div>
  );
}
