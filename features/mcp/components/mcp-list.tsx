"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ListHeader } from "@/components/list-header";
import { Surface } from "@/components/surface";
import { leadingNumber, type SortDir, type SortField, sortItems } from "@/lib/list-query";
import { cn } from "@/lib/utils";
import { MCP_STATUS_META } from "../presentation";
import { MCP_STATUSES, type McpServer } from "../schema";

// The MCP servers list (README.md §MCP servers): a grid of connected tool servers, each card
// surfacing its health state inline (degraded flagged in amber, pulsing). The shared
// <ListHeader> drives search + health filter + sort; data arrives as a prop from the RSC.

const SORT_FIELDS: SortField<McpServer>[] = [
  { key: "name", label: "Name", value: (server) => server.name.toLowerCase() },
  { key: "status", label: "Health", value: (server) => MCP_STATUSES.indexOf(server.status) },
  { key: "tools", label: "Tools", value: (server) => server.toolCount },
  { key: "latency", label: "Latency", value: (server) => leadingNumber(server.latency) },
];

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  ...MCP_STATUSES.map((status) => ({ value: status, label: MCP_STATUS_META[status].label })),
];

export function McpList({ servers }: { servers: readonly McpServer[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("status");
  const [dir, setDir] = useState<SortDir>("asc");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = servers.filter((server) => {
      if (status !== "all" && server.status !== status) return false;
      if (!q) return true;
      return server.name.toLowerCase().includes(q) || server.description.toLowerCase().includes(q);
    });
    return sortItems(filtered, SORT_FIELDS, sortKey, dir);
  }, [servers, query, status, sortKey, dir]);

  return (
    <Surface className="gap-5">
      <ListHeader
        title="MCP servers"
        subtitle="Connected tool servers, health-checked continuously."
        count={servers.length}
        newButton={{ href: "/mcp/new", label: "Connect server" }}
        search={{ value: query, onChange: setQuery, placeholder: "Search servers…" }}
        filter={{
          options: STATUS_FILTERS,
          value: status,
          onChange: setStatus,
          ariaLabel: "Filter by health",
        }}
        sort={{
          fields: SORT_FIELDS,
          value: sortKey,
          onChange: setSortKey,
          dir,
          onToggleDir: () => setDir((current) => (current === "asc" ? "desc" : "asc")),
        }}
      />

      {servers.length === 0 ? (
        <EmptyState message="No MCP servers connected yet." />
      ) : visible.length === 0 ? (
        <EmptyState message="No MCP servers match this view." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((server) => (
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

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-hair bg-panel px-4 py-10 text-center text-[13px] text-text-3">
      {message}
    </p>
  );
}
