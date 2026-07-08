import { Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { SKILL_CATEGORY_META, SKILL_STATUS_META } from "../presentation";
import type { Skill } from "../schema";

// The skills list (README.md §Skills): a grid of versioned capability packages, each card
// showing its category, version and lifecycle status. Fed by the RSC page through tRPC; a
// header action opens the create form.

export function SkillsList({ skills }: { skills: readonly Skill[] }) {
  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-medium tracking-tight text-text">Skills</h1>
          <p className="text-[13px] text-text-3">Reusable capability packages, versioned.</p>
        </div>
        <Link
          href="/skills/new"
          className="inline-flex items-center gap-1.5 rounded-md border border-primary-soft-bd bg-primary-soft px-3 py-2 text-[13px] font-medium text-primary transition-colors hover:bg-primary-bg"
        >
          <Plus className="size-4" /> New skill
        </Link>
      </header>

      {skills.length === 0 ? (
        <p className="rounded-xl border border-hair bg-panel px-4 py-10 text-center text-[13px] text-text-3">
          No skills yet. Create one to get started.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      )}
    </div>
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
