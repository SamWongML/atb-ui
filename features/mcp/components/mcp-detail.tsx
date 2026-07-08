import { Pencil } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { MCP_STATUS_META } from "../presentation";
import type { McpServer } from "../schema";

// The MCP server detail view (README.md §MCP servers): health + latency, transport, auth,
// the exposed tools, the required secret names (values stay at the BFF), and the agents
// that consume it. Read-only; Edit routes to the form. Props from the RSC page.

export function McpDetail({ server }: { server: McpServer }) {
  const health = MCP_STATUS_META[server.status];
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <header className="flex items-start gap-3">
        <span
          role="img"
          aria-label={health.label}
          className={cn(
            "mt-2 size-2.5 shrink-0 rounded-full",
            health.dotClass,
            health.pulse && "motion-safe:animate-pulse",
          )}
        />
        <div className="min-w-0 flex-1">
          <h1 className="font-mono text-2xl font-medium tracking-tight text-text">{server.name}</h1>
          <p className="text-[13px] text-text-3">
            {server.transport} · {server.auth}
          </p>
        </div>
        <Link
          href={`/mcp/${server.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-2 text-[13px] font-medium text-text transition-colors hover:border-border-2 hover:bg-[var(--nav-hover)]"
        >
          <Pencil className="size-3.5" /> Edit
        </Link>
      </header>

      <p className="text-[13.5px] leading-relaxed text-text-2">{server.description}</p>

      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Health">
          <span
            className={cn(
              "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
              health.badgeClass,
            )}
          >
            {health.label}
          </span>
        </Stat>
        <Stat label="Latency">{server.latency}</Stat>
        <Stat label="Tools">{String(server.toolCount)}</Stat>
        <Stat label="Transport">{server.transport}</Stat>
      </dl>

      <ChipSection label="Tools" items={server.tools} empty="No tools exposed" />
      <ChipSection label="Secrets" items={server.secrets} empty="No secrets required" />
      <ChipSection label="Used by" items={server.usedBy} empty="Not used by any agent" />
    </div>
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

function Stat({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-hair bg-panel px-3 py-2.5">
      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-4">{label}</dt>
      <dd className="mt-1 text-[13px] font-medium text-text">{children}</dd>
    </div>
  );
}
