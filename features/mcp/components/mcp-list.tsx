"use client";

import Link from "next/link";
import { ListRail } from "@/components/list-rail";
import { PageHeader } from "@/components/page-chrome";
import { Surface } from "@/components/surface";
import { leadingNumber, type SortField } from "@/lib/list-query";
import { useListQuery } from "@/lib/use-list-query";
import { cn } from "@/lib/utils";
import { MCP_STATUS_META } from "../presentation";
import { MCP_STATUSES, type McpServer } from "../schema";

// The MCP servers list (README.md §MCP servers, ADR 0001): a grid of connected tool
// servers, each card surfacing its health state inline (degraded flagged in amber,
// pulsing). Chrome is the shared <ListRail> (search · health tabs · sort · Connect) in
// the shell header; state is the shared useListQuery. Data is a prop from the RSC.

const SORT_FIELDS: SortField<McpServer>[] = [
  { key: "name", label: "Name", value: (server) => server.name.toLowerCase() },
  { key: "status", label: "Health", value: (server) => MCP_STATUSES.indexOf(server.status) },
  { key: "tools", label: "Tools", value: (server) => server.toolCount },
  { key: "latency", label: "Latency", value: (server) => leadingNumber(server.latency) },
];

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  ...MCP_STATUSES.map((status) => ({ value: status, label: MCP_STATUS_META[status].label })),
];

export function McpList({ servers }: { servers: readonly McpServer[] }) {
  const query = useListQuery({
    items: servers,
    sortFields: SORT_FIELDS,
    statuses: MCP_STATUSES,
    statusOf: (server) => server.status,
    matches: (server, q) =>
      server.name.toLowerCase().includes(q) || server.description.toLowerCase().includes(q),
  });

  return (
    <>
      <PageHeader>
        <ListRail
          count={servers.length}
          filter={{
            options: STATUS_FILTERS,
            value: query.status,
            onChange: query.setStatus,
            counts: query.counts,
            ariaLabel: "Filter by health",
          }}
          sort={{
            fields: SORT_FIELDS,
            value: query.sortKey,
            onChange: query.setSortKey,
            dir: query.dir,
            onToggleDir: query.toggleDir,
          }}
          search={{ value: query.query, onChange: query.setQuery, placeholder: "Search servers…" }}
          newButton={{ href: "/mcp/new", label: "Connect server" }}
        />
      </PageHeader>

      <Surface className="gap-4">
        {servers.length === 0 ? (
          <EmptyState message="No MCP servers connected yet." />
        ) : query.visible.length === 0 ? (
          <EmptyState message="No MCP servers match this view." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {query.visible.map((server) => (
              <ServerCard key={server.id} server={server} />
            ))}
          </div>
        )}
      </Surface>
    </>
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

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-hair bg-panel px-4 py-10 text-center text-[13px] text-text-3">
      {message}
    </p>
  );
}
