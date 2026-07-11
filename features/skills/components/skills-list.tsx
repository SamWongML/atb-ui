"use client";

import Link from "next/link";
import { ListRail } from "@/components/list-rail";
import { PageHeader } from "@/components/page-chrome";
import { Surface } from "@/components/surface";
import { leadingNumber, type SortField } from "@/lib/list-query";
import { useListQuery } from "@/lib/use-list-query";
import { cn } from "@/lib/utils";
import { SKILL_CATEGORY_META, SKILL_STATUS_META } from "../presentation";
import { SKILL_STATUSES, type Skill } from "../schema";

// The skills list (README.md §Skills, ADR 0001): a grid of versioned capability
// packages, each card showing its category, version and lifecycle status. Chrome is the
// shared <ListRail> (search · status tabs · sort · New) in the shell header; state is
// the shared useListQuery. Data arrives as a prop from the RSC.

const SORT_FIELDS: SortField<Skill>[] = [
  { key: "name", label: "Name", value: (skill) => skill.name.toLowerCase() },
  { key: "status", label: "Status", value: (skill) => SKILL_STATUSES.indexOf(skill.status) },
  { key: "category", label: "Category", value: (skill) => skill.category },
  { key: "invocations", label: "Runs", value: (skill) => leadingNumber(skill.invocations) },
];

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  ...SKILL_STATUSES.map((status) => ({ value: status, label: SKILL_STATUS_META[status].label })),
];

export function SkillsList({ skills }: { skills: readonly Skill[] }) {
  const query = useListQuery({
    items: skills,
    sortFields: SORT_FIELDS,
    statuses: SKILL_STATUSES,
    statusOf: (skill) => skill.status,
    matches: (skill, q) =>
      skill.name.toLowerCase().includes(q) ||
      skill.description.toLowerCase().includes(q) ||
      skill.summary.toLowerCase().includes(q),
  });

  return (
    <>
      <PageHeader>
        <ListRail
          count={skills.length}
          filter={{
            options: STATUS_FILTERS,
            value: query.status,
            onChange: query.setStatus,
            counts: query.counts,
            ariaLabel: "Filter by status",
          }}
          sort={{
            fields: SORT_FIELDS,
            value: query.sortKey,
            onChange: query.setSortKey,
            dir: query.dir,
            onToggleDir: query.toggleDir,
          }}
          search={{ value: query.query, onChange: query.setQuery, placeholder: "Search skills…" }}
          newButton={{ href: "/skills/new", label: "New skill" }}
        />
      </PageHeader>

      <Surface className="gap-4">
        {skills.length === 0 ? (
          <EmptyState message="No skills yet. Create one to get started." />
        ) : query.visible.length === 0 ? (
          <EmptyState message="No skills match this view." />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {query.visible.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </Surface>
    </>
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
