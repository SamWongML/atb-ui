import { Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { MCP_STATUS_META } from "../presentation";
import type { McpServer } from "../schema";

// The MCP servers list (README.md §MCP servers): a grid of connected tool servers, each
// card surfacing its health state inline (degraded flagged in amber, pulsing). Fed by the
// RSC page through tRPC; a header action opens the connect form.

export function McpList({ servers }: { servers: readonly McpServer[] }) {
  const degraded = servers.filter((s) => s.status === "degraded").length;
  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-text">MCP servers</h1>
          <p className="text-[13px] text-text-3">
            {servers.length} connected · {degraded} degraded
          </p>
        </div>
        <Link
          href="/mcp/new"
          className="inline-flex items-center gap-1.5 rounded-md border border-primary-soft-bd bg-primary-soft px-3 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary-bg"
        >
          <Plus className="size-4" /> Connect server
        </Link>
      </header>

      {servers.length === 0 ? (
        <p className="rounded-xl border border-hair bg-panel px-4 py-10 text-center text-[13px] text-text-3">
          No MCP servers connected yet.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {servers.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      )}
    </div>
  );
}

function ServerCard({ server }: { server: McpServer }) {
  const health = MCP_STATUS_META[server.status];
  return (
    <Link
      href={`/mcp/${server.id}`}
      className="flex flex-col gap-3 rounded-xl border border-hair bg-panel p-4 transition-colors hover:border-border-2 hover:bg-panel-2"
    >
      <div className="flex items-center gap-2">
        <span
          role="img"
          aria-label={health.label}
          className={cn(
            "size-2 shrink-0 rounded-full",
            health.dotClass,
            health.pulse && "motion-safe:animate-pulse",
          )}
        />
        <span className="min-w-0 flex-1 truncate font-mono text-[13px] font-medium text-text">
          {server.name}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
            health.badgeClass,
          )}
        >
          {health.label}
        </span>
      </div>
      <p className="line-clamp-2 text-[12.5px] leading-relaxed text-text-2">{server.description}</p>
      <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.1em] text-text-4">
        <span>{server.transport}</span>
        <span>{server.toolCount} tools</span>
        <span>{server.latency}</span>
      </div>
    </Link>
  );
}
