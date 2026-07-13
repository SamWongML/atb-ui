"use client";

import Link from "next/link";
import { EmptyState } from "@/components/empty-state";
import { Surface } from "@/components/surface";
import { useListQuery } from "@/lib/use-list-query";
import { cn } from "@/lib/utils";
import { SKILLS_LIST_QUERY } from "../list-config";
import { SKILL_CATEGORY_META, SKILL_STATUS_META } from "../presentation";
import type { Skill } from "../schema";

// The skills list body (README.md §Skills, ADR 0002): a grid of versioned capability
// packages, each card showing its category, version and lifecycle status. The rail (search ·
// status tabs · sort · New) is server-rendered into the shell @header slot; state is the
// shared useListQuery. Data arrives as a prop from the RSC.

export function SkillsList({ skills }: { skills: readonly Skill[] }) {
  const query = useListQuery({ items: skills, ...SKILLS_LIST_QUERY });

  return (
    <Surface className="gap-4">
      {skills.length === 0 ? (
        <EmptyState title="No skills yet." description="Create one to get started." />
      ) : query.visible.length === 0 ? (
        <EmptyState title="No skills match this view." />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {query.visible.map((skill) => (
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
