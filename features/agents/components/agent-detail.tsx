import { Pencil } from "lucide-react";
import Link from "next/link";
import { Surface } from "@/components/surface";
import { cn } from "@/lib/utils";
import { AGENT_STATUS_META, avatarTint, PERMISSION_META } from "../presentation";
import type { Agent, AgentPermissions } from "../schema";

// The agent detail view (README.md §Agents): identity + status, the three permission
// chips (edit/bash/network), attached skills & MCPs, the usage rollup, and the full
// system prompt. Read-only; the Edit action routes to the form. Props from the RSC page.

const PERMISSION_ORDER: ReadonlyArray<keyof AgentPermissions> = ["edit", "bash", "network"];

export function AgentDetail({ agent }: { agent: Agent }) {
  const status = AGENT_STATUS_META[agent.status];
  return (
    <Surface className="gap-6">
      <header className="flex items-start gap-4">
        <span
          className={cn(
            "grid size-12 shrink-0 place-items-center rounded-xl font-mono text-[15px] font-semibold",
            avatarTint(agent.id),
          )}
        >
          {agent.avatar}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="font-serif text-2xl font-medium tracking-tight text-text">
              {agent.name}
            </h1>
            <span
              role="img"
              className={cn("size-2 rounded-full", status.dotClass)}
              aria-label={status.label}
            />
          </div>
          <p className="text-[13px] text-text-3">
            {agent.role} · {agent.model}
          </p>
        </div>
        <Link
          href={`/agents/${agent.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-2 text-[13px] font-medium text-text transition-colors hover:border-border-2 hover:bg-[var(--nav-hover)]"
        >
          <Pencil className="size-3.5" /> Edit
        </Link>
      </header>

      <p className="text-[13.5px] leading-relaxed text-text-2">{agent.description}</p>

      <section className="space-y-2.5">
        <SectionLabel>Permissions</SectionLabel>
        <div className="flex flex-wrap gap-2">
          {PERMISSION_ORDER.map((key) => {
            const meta = PERMISSION_META[agent.permissions[key]];
            return (
              <fieldset
                key={key}
                aria-label={`${key} permission`}
                className="flex items-center gap-2 rounded-lg border border-hair bg-panel px-3 py-2"
              >
                <span className="font-mono text-[11px] capitalize text-text-3">{key}</span>
                <span
                  className={cn(
                    "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
                    meta.badgeClass,
                  )}
                >
                  {meta.label}
                </span>
              </fieldset>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 sm:grid-cols-2">
        <ChipSection label="Skills" items={agent.skills} empty="No skills attached" />
        <ChipSection label="MCP servers" items={agent.mcps} empty="No MCP servers attached" />
      </div>

      <section className="space-y-2.5">
        <SectionLabel>Usage</SectionLabel>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Tasks" value={agent.usage.tasks} />
          <Stat label="Merged" value={agent.usage.merged} />
          <Stat label="Tokens" value={agent.usage.tokens} />
          <Stat label="Cost" value={agent.usage.cost} />
          <Stat label="Avg time" value={agent.usage.avgTime} />
        </dl>
      </section>

      <section className="space-y-2.5">
        <SectionLabel>System prompt</SectionLabel>
        <p className="whitespace-pre-wrap rounded-xl border border-hair bg-inset p-4 font-mono text-[12px] leading-relaxed text-text-2">
          {agent.systemPrompt}
        </p>
      </section>
    </Surface>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-4">{children}</h2>
  );
}

function ChipSection({
  label,
  items,
  empty,
}: {
  label: string;
  items: readonly string[];
  empty: string;
}) {
  return (
    <section className="space-y-2.5">
      <SectionLabel>{label}</SectionLabel>
      {items.length === 0 ? (
        <p className="text-[12.5px] text-text-3">{empty}</p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {items.map((item) => (
            <span
              key={item}
              className="rounded-full bg-chip px-2.5 py-1 font-mono text-[11px] text-text-2"
            >
              {item}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-hair bg-panel px-3 py-2.5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-4">{label}</dt>
      <dd className="mt-0.5 text-[13px] font-medium text-text">{value}</dd>
    </div>
  );
}
