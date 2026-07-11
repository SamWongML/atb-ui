"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ListHeader } from "@/components/list-header";
import { Surface } from "@/components/surface";
import { leadingNumber, type SortDir, type SortField, sortItems } from "@/lib/list-query";
import { cn } from "@/lib/utils";
import { SKILL_CATEGORY_META, SKILL_STATUS_META } from "../presentation";
import { SKILL_STATUSES, type Skill } from "../schema";

// The skills list (README.md §Skills): a grid of versioned capability packages, each card
// showing its category, version and lifecycle status. The shared <ListHeader> drives search
// + status filter + sort; data arrives as a prop from the RSC.

const SORT_FIELDS: SortField<Skill>[] = [
  { key: "name", label: "Name", value: (skill) => skill.name.toLowerCase() },
  { key: "status", label: "Status", value: (skill) => SKILL_STATUSES.indexOf(skill.status) },
  { key: "category", label: "Category", value: (skill) => skill.category },
  { key: "invocations", label: "Runs", value: (skill) => leadingNumber(skill.invocations) },
];

const STATUS_FILTERS: { value: string; label: string }[] = [
  { value: "all", label: "All" },
  ...SKILL_STATUSES.map((status) => ({ value: status, label: SKILL_STATUS_META[status].label })),
];

export function SkillsList({ skills }: { skills: readonly Skill[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState("status");
  const [dir, setDir] = useState<SortDir>("asc");

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = skills.filter((skill) => {
      if (status !== "all" && skill.status !== status) return false;
      if (!q) return true;
      return (
        skill.name.toLowerCase().includes(q) ||
        skill.description.toLowerCase().includes(q) ||
        skill.summary.toLowerCase().includes(q)
      );
    });
    return sortItems(filtered, SORT_FIELDS, sortKey, dir);
  }, [skills, query, status, sortKey, dir]);

  return (
    <Surface className="gap-5">
      <ListHeader
        title="Skills"
        subtitle="Reusable capability packages, versioned."
        count={skills.length}
        newButton={{ href: "/skills/new", label: "New skill" }}
        search={{ value: query, onChange: setQuery, placeholder: "Search skills…" }}
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

      {skills.length === 0 ? (
        <EmptyState message="No skills yet. Create one to get started." />
      ) : visible.length === 0 ? (
        <EmptyState message="No skills match this view." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </Surface>
  );
}

function SkillCard({ skill }: { skill: Skill }) {
  const status = SKILL_STATUS_META[skill.status];
  const category = SKILL_CATEGORY_META[skill.category];
  return (
    <Link
      href={`/skills/${skill.id}`}
      className="flex flex-col gap-3 rounded-xl border border-hair bg-panel p-4 transition-colors hover:border-border-2 hover:bg-panel-2"
    >
      <div className="flex items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-[13.5px] font-medium text-text">
          {skill.name}
        </span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
            status.badgeClass,
          )}
        >
          {status.label}
        </span>
      </div>
      <p className="line-clamp-2 text-[12.5px] leading-relaxed text-text-2">{skill.description}</p>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]",
            category.badgeClass,
          )}
        >
          {skill.category}
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-text-4">
          {skill.version}
        </span>
        <span className="ml-auto font-mono text-[10px] text-text-4">{skill.invocations} runs</span>
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
