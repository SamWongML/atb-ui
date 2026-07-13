"use client";

import { Bot, Plus, SearchX } from "lucide-react";
import Link from "next/link";
import { Card, CardFooter } from "@/components/card";
import { CardGrid } from "@/components/card-grid";
import { EmptyState } from "@/components/empty-state";
import { type ListDisplayState, useListDisplay } from "@/components/list-display";
import { Surface } from "@/components/surface";
import { useListQuery } from "@/lib/use-list-query";
import { cn } from "@/lib/utils";
import { AGENTS_DISPLAY_CONFIG, AGENTS_LIST_QUERY } from "../list-config";
import { AGENT_STATUS_META, avatarTint, PERMISSION_META } from "../presentation";
import { AGENT_STATUSES, type Agent, type AgentPermissions, type AgentStatus } from "../schema";

// The agents roster body (README.md §Agents, ADR 0002): the identity cards, driven by the
// centralized useListQuery/useListDisplay state (persisted per-scope via the cookie so the view
// survives a refresh) and a grid/list that honours the Display popover's layout, density and
// visible-property choices. The rail (search · filter · sort · New) is server-rendered separately
// into the shell @header slot; both halves read the shared config in ../list-config.
// Data arrives as a prop from the RSC.

export function AgentsList({ agents }: { agents: readonly Agent[] }) {
  const query = useListQuery({ items: agents, ...AGENTS_LIST_QUERY });
  const display = useListDisplay(AGENTS_DISPLAY_CONFIG);

  return (
    <Surface fullWidth={display.fullWidth} className="gap-3.5">
      <p className="flex items-center gap-1.5 px-0.5 font-mono text-[11px] text-text-4">
        <span className="text-text-3">{query.visible.length}</span> of {agents.length} agents
        <span aria-hidden>·</span> sorted by {query.activeSortLabel.toLowerCase()}
        <span className="text-text-3">{query.dir === "asc" ? "↑" : "↓"}</span>
      </p>
      {display.layout === "grid" ? (
        <AgentGrid agents={query.visible} total={agents.length} display={display} />
      ) : (
        <AgentRosterList agents={query.visible} total={agents.length} display={display} />
      )}
    </Surface>
  );
}

/* ------------------------------------- grid --------------------------------------- */

function AgentGrid({
  agents,
  total,
  display,
}: {
  agents: readonly Agent[];
  total: number;
  display: ListDisplayState;
}) {
  if (total === 0) return <AgentsEmpty variant="none" />;
  if (agents.length === 0) return <AgentsEmpty variant="filtered" />;
  const trimmed = display.density === "compact" || Object.values(display.visible).some((on) => !on);
  const cardClass = trimmed ? "h-auto min-h-[132px]" : undefined;
  return (
    <CardGrid>
      {agents.map((agent) => (
        <AgentCard key={agent.id} agent={agent} display={display} cardClass={cardClass} />
      ))}
      <Card asChild variant="dashed" className={cardClass}>
        <Link href="/agents/new">
          <Plus className="size-5" aria-hidden />
          <span className="text-[12.5px] font-medium">Define a new agent</span>
        </Link>
      </Card>
    </CardGrid>
  );
}

function AgentCard({
  agent,
  display,
  cardClass,
}: {
  agent: Agent;
  display: ListDisplayState;
  cardClass?: string;
}) {
  const show = (key: string) => display.visible[key] ?? true;
  const compact = display.density === "compact";
  return (
    <Card asChild className={cardClass}>
      <Link href={`/agents/${agent.id}`}>
        <div className="mb-3 flex items-start gap-3">
          <AgentAvatar agent={agent} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-[14.5px] font-semibold tracking-[-0.01em] text-text">
              {agent.name}
            </p>
            <p className="mt-0.5 truncate font-mono text-[11px] text-text-3">
              {agent.role} · {agent.model}
            </p>
          </div>
          <StatusTag status={agent.status} />
        </div>
        {show("description") && (
          <p
            className={cn(
              "mb-3 text-[12.5px] leading-relaxed text-text-2",
              compact ? "line-clamp-2" : "line-clamp-3",
            )}
          >
            {agent.description}
          </p>
        )}
        {show("capabilities") && (
          <div className="mb-3">
            <CapabilityChips agent={agent} max={compact ? 3 : 4} />
          </div>
        )}
        {(show("usage") || show("permissions")) && (
          <CardFooter>
            <span className="text-text-3">
              {show("usage") ? (
                <>
                  {agent.usage.tasks} · <span className="text-green">{agent.usage.merged}</span>
                </>
              ) : (
                <span aria-hidden />
              )}
            </span>
            {show("permissions") && <PermissionPips permissions={agent.permissions} />}
          </CardFooter>
        )}
      </Link>
    </Card>
  );
}

/* ------------------------------------- list --------------------------------------- */

function AgentRosterList({
  agents,
  total,
  display,
}: {
  agents: readonly Agent[];
  total: number;
  display: ListDisplayState;
}) {
  if (total === 0) return <AgentsEmpty variant="none" />;
  if (agents.length === 0) return <AgentsEmpty variant="filtered" />;

  const groups = display.grouped
    ? AGENT_STATUSES.map((status) => ({
        status,
        agents: agents.filter((agent) => agent.status === status),
      })).filter((group) => group.agents.length > 0)
    : [{ status: null as AgentStatus | null, agents: [...agents] }];

  return (
    <div className="overflow-hidden rounded-xl border border-hair bg-panel">
      {groups.map((group, index) => (
        <div key={group.status ?? "all"}>
          {group.status && (
            <div
              className={cn(
                "flex items-center gap-2 bg-panel-2 px-3.5 py-1.5",
                index > 0 && "border-t border-hair",
              )}
            >
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  AGENT_STATUS_META[group.status].dotClass,
                  group.status === "working" && "motion-safe:animate-pulse",
                )}
                aria-hidden
              />
              <span className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-text-2">
                {AGENT_STATUS_META[group.status].label}
              </span>
              <span className="font-mono text-[10.5px] tabular-nums text-text-4">
                {group.agents.length}
              </span>
            </div>
          )}
          {group.agents.map((agent) => (
            <AgentRow key={agent.id} agent={agent} display={display} />
          ))}
        </div>
      ))}
      <Link
        href="/agents/new"
        className="flex items-center gap-2.5 border-t border-hair px-3.5 py-2.5 text-[12.5px] font-medium text-text-3 transition-colors hover:bg-[var(--nav-hover)] hover:text-text-2"
      >
        <Plus className="size-4" aria-hidden />
        Define a new agent
      </Link>
    </div>
  );
}

function AgentRow({ agent, display }: { agent: Agent; display: ListDisplayState }) {
  const show = (key: string) => display.visible[key] ?? true;
  const compact = display.density === "compact";
  return (
    <Link
      href={`/agents/${agent.id}`}
      className={cn(
        "flex items-center gap-3 border-t border-hair px-3.5 transition-colors first:border-t-0 hover:bg-[var(--nav-hover)]",
        compact ? "h-10" : "h-[52px]",
      )}
    >
      <AgentAvatar agent={agent} size={compact ? "sm" : "md"} />
      <span className="w-[230px] min-w-0 shrink-0">
        <span className="flex items-baseline gap-2">
          <span className="truncate text-[13.5px] font-medium text-text">{agent.name}</span>
          <span className="truncate font-mono text-[10.5px] text-text-4">{agent.role}</span>
        </span>
      </span>
      {!display.grouped && <StatusTag status={agent.status} />}
      <span className="min-w-0 flex-1">
        {show("capabilities") && <CapabilityChips agent={agent} max={3} noWrap />}
      </span>
      {show("usage") && (
        <>
          <span className="w-[72px] shrink-0 text-right font-mono text-[11px] tabular-nums text-text-3">
            {agent.usage.tasks.split(" ")[0]} tasks
          </span>
          <span className="w-[86px] shrink-0 text-right font-mono text-[11px] tabular-nums text-green">
            {agent.usage.merged.split(" ")[0]} merged
          </span>
          <span className="w-[56px] shrink-0 text-right font-mono text-[11px] tabular-nums text-text-3">
            {agent.usage.cost}
          </span>
        </>
      )}
      <span className="w-[40px] shrink-0 text-right font-mono text-[10px] text-text-4">
        {agent.model.split(" ")[0]}
      </span>
      {show("permissions") && <PermissionPips permissions={agent.permissions} />}
    </Link>
  );
}

/* ----------------------------------- fragments ------------------------------------ */

function AgentAvatar({ agent, size = "md" }: { agent: Agent; size?: "sm" | "md" }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-[9px] font-mono font-semibold",
        size === "md" ? "size-[34px] text-[12px]" : "size-6 rounded-md text-[9.5px]",
        avatarTint(agent.id),
      )}
    >
      {agent.avatar}
    </span>
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

function PermissionPips({ permissions }: { permissions: AgentPermissions }) {
  return (
    <span className="inline-flex shrink-0 items-center gap-1">
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

function CapabilityChips({ agent, max, noWrap }: { agent: Agent; max: number; noWrap?: boolean }) {
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
    <span className={cn("flex items-center gap-1.5", noWrap ? "overflow-hidden" : "flex-wrap")}>
      {shown.map((item) => (
        <span
          key={`${item.kind}:${item.label}`}
          className={cn(
            "shrink-0 rounded-md px-1.5 py-0.5 font-mono text-[10.5px]",
            item.kind === "skill" ? "bg-green-bg text-green" : "bg-violet-bg text-violet",
          )}
        >
          {item.label}
        </span>
      ))}
      {overflow > 0 && (
        <span className="shrink-0 font-mono text-[10.5px] text-text-4">+{overflow}</span>
      )}
    </span>
  );
}

function AgentsEmpty({ variant }: { variant: "none" | "filtered" }) {
  if (variant === "filtered") {
    return (
      <EmptyState
        icon={SearchX}
        title="No agents match this view"
        description="Try clearing the search or switching the status filter."
      />
    );
  }
  return (
    <EmptyState
      icon={Bot}
      title="No agents yet"
      description="Agents are the roles you delegate work to. Create your first one to start orchestrating."
      action={
        <Link
          href="/agents/new"
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-primary-soft-bd bg-primary-soft px-3 text-[12.5px] font-medium text-primary transition-colors hover:bg-primary-bg"
        >
          <Plus className="size-3.5" aria-hidden />
          New agent
        </Link>
      }
    />
  );
}
