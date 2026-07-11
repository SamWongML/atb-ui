"use client";

import { Plus } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, CardFooter } from "@/components/card";
import { CardGrid } from "@/components/card-grid";
import { ListHeader } from "@/components/list-header";
import { Surface } from "@/components/surface";
import { leadingNumber, type SortDir, type SortField, sortItems } from "@/lib/list-query";
import { cn } from "@/lib/utils";
import { AGENT_STATUS_META, avatarTint, PERMISSION_META } from "../presentation";
import { AGENT_STATUSES, type Agent, type AgentPermissions, type AgentStatus } from "../schema";

// The agents roster (README.md §Agents): a grid of cards surfacing each agent's identity,
// capabilities (skills/MCPs), permission posture and 30-day usage. The shared <ListHeader>
// (command bar) drives search + status filter + sort; data arrives as a prop from the RSC.

const SORT_FIELDS: SortField<Agent>[] = [
  { key: "name", label: "Name", value: (agent) => agent.name.toLowerCase() },
  { key: "status", label: "Status", value: (agent) => AGENT_STATUSES.indexOf(agent.status) },
  { key: "tasks", label: "Tasks", value: (agent) => leadingNumber(agent.usage.tasks) },
  { key: "merged", label: "Merged rate", value: (agent) => leadingNumber(agent.usage.merged) },
  { key: "cost", label: "Cost", value: (agent) => leadingNumber(agent.usage.cost) },
];

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  ...AGENT_STATUSES.map((status) => ({ value: status, label: AGENT_STATUS_META[status].label })),
];

export function AgentsList({ agents }: { agents: readonly Agent[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("status");
  const [dir, setDir] = useState<SortDir>("asc");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = agents.filter((agent) => {
      if (status !== "all" && agent.status !== status) return false;
      if (!q) return true;
      return (
        agent.name.toLowerCase().includes(q) ||
        agent.role.toLowerCase().includes(q) ||
        agent.description.toLowerCase().includes(q) ||
        agent.skills.some((skill) => skill.toLowerCase().includes(q)) ||
        agent.mcps.some((mcp) => mcp.toLowerCase().includes(q))
      );
    });
    return sortItems(filtered, SORT_FIELDS, sortKey, dir);
  }, [agents, query, status, sortKey, dir]);

  return (
    <Surface className="gap-5">
      <ListHeader
        title="Agents"
        subtitle="Your reusable team — each equipped with skills, tools and permissions."
        count={agents.length}
        newButton={{ href: "/agents/new", label: "New agent" }}
        search={{ value: query, onChange: setQuery, placeholder: "Search agents, roles, skills…" }}
        filter={{
          options: STATUS_FILTERS,
          value: status,
          onChange: setStatus,
          ariaLabel: "Filter by status",
        }}
        sort={{
          fields: SORT_FIELDS,
          value: sortKey,
          onChange: setSortKey,
          dir,
          onToggleDir: () => setDir((current) => (current === "asc" ? "desc" : "asc")),
        }}
      />

      {agents.length === 0 ? (
        <EmptyState message="No agents yet. Create one to get started." />
      ) : visible.length === 0 ? (
        <EmptyState message="No agents match this view." />
      ) : (
        <CardGrid>
          {visible.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
          <Card asChild variant="dashed">
            <Link href="/agents/new">
              <Plus className="size-5" aria-hidden />
              <span className="text-[12.5px] font-medium">Define a new agent</span>
            </Link>
          </Card>
        </CardGrid>
      )}
    </Surface>
  );
}

function AgentCard({ agent }: { agent: Agent }) {
  return (
    <Card asChild>
      <Link href={`/agents/${agent.id}`}>
        <div className="mb-3 flex items-start gap-3">
          <span
            aria-hidden
            className={cn(
              "grid size-[34px] shrink-0 place-items-center rounded-[9px] font-mono text-[12px] font-semibold",
              avatarTint(agent.id),
            )}
          >
            {agent.avatar}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14.5px] font-semibold text-text">{agent.name}</p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-text-3">
              {agent.role} · {agent.model}
            </p>
          </div>
          <StatusTag status={agent.status} />
        </div>
        <p className="mb-3 line-clamp-3 text-[12.5px] leading-relaxed text-text-2">
          {agent.description}
        </p>
        <div className="mb-3">
          <CapabilityChips agent={agent} max={4} />
        </div>
        <CardFooter>
          <span className="text-text-3">
            {agent.usage.tasks} · <span className="text-green">{agent.usage.merged}</span>
          </span>
          <PermissionPips permissions={agent.permissions} />
        </CardFooter>
      </Link>
    </Card>
  );
}

function StatusTag({ status }: { status: AgentStatus }) {
  const meta = AGENT_STATUS_META[status];
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 font-mono text-[10.5px] uppercase tracking-[0.08em]",
        status === "working" ? "text-clay" : "text-text-3",
      )}
    >
      <span
        className={cn(
          "size-1.5 rounded-full",
          meta.dotClass,
          status === "working" && "motion-safe:animate-pulse",
        )}
      />
      {meta.label}
    </span>
  );
}

const PERMISSION_ORDER = [
  ["edit", "E"],
  ["bash", "B"],
  ["network", "N"],
] as const;

// The permission matrix as three compact pips (edit / bash / network), tinted
// allow=green · ask=amber · deny=red (CONTEXT.md) — authorisation at a glance.
function PermissionPips({ permissions }: { permissions: AgentPermissions }) {
  return (
    <span className="inline-flex items-center gap-1">
      {PERMISSION_ORDER.map(([key, letter]) => {
        const meta = PERMISSION_META[permissions[key]];
        return (
          <span
            key={key}
            title={`${key}: ${meta.label}`}
            className={cn(
              "grid size-[18px] place-items-center rounded font-mono text-[9.5px] font-semibold uppercase",
              meta.badgeClass,
            )}
          >
            {letter}
          </span>
        );
      })}
    </span>
  );
}

// Skills (green) + MCP servers (violet) as chips, capped with a +N overflow. Wraps to at
// most two rows (`max` bounds the count); the fixed `--card-h` is sized to fit that second
// row, so wrapping never overflows the card (see Card).
function CapabilityChips({ agent, max }: { agent: Agent; max: number }) {
  const items = [
    ...agent.skills.map((label) => ({ kind: "skill" as const, label })),
    ...agent.mcps.map((label) => ({ kind: "mcp" as const, label })),
  ];
  if (items.length === 0) {
    return <span className="font-mono text-[11px] text-text-4">no capabilities</span>;
  }
  const shown = items.slice(0, max);
  const overflow = items.length - shown.length;
  return (
    <span className="flex flex-wrap items-center gap-1.5">
      {shown.map((item) => (
        <span
          key={`${item.kind}:${item.label}`}
          className={cn(
            "rounded-md px-1.5 py-0.5 font-mono text-[10.5px]",
            item.kind === "skill" ? "bg-green-bg text-green" : "bg-violet-bg text-violet",
          )}
        >
          {item.label}
        </span>
      ))}
      {overflow > 0 && <span className="font-mono text-[10.5px] text-text-4">+{overflow}</span>}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="rounded-xl border border-hair bg-panel px-4 py-12 text-center text-[13px] text-text-3">
      {message}
    </p>
  );
}
