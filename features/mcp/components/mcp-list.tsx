"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Surface } from "@/components/surface";
import { useListQuery } from "@/lib/use-list-query";
import { cn } from "@/lib/utils";
import { MCP_LIST_QUERY } from "../list-config";
import { MCP_STATUS_META } from "../presentation";
import type { McpServer } from "../schema";

// The MCP servers list body (README.md §MCP servers, ADR 0002): a grid of connected tool
// servers, each card surfacing its health state inline (degraded flagged in amber,
// pulsing). The rail (search · health tabs · sort · Connect) is server-rendered into the
// shell @header slot; state is the shared useListQuery. Data is a prop from the RSC.

export function McpList({ servers }: { servers: readonly McpServer[] }) {
  const query = useListQuery({ items: servers, ...MCP_LIST_QUERY });

  return (
    <Surface className="gap-4">
      {servers.length === 0 ? (
        <EmptyState title="No MCP servers connected yet." />
      ) : query.visible.length === 0 ? (
        <EmptyState title="No MCP servers match this view." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {query.visible.map((server) => (
            <ServerCard key={server.id} server={server} />
          ))}
        </div>
      )}
    </Surface>
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
