import { Pencil } from "lucide-react";
import Link from "next/link";
import { Surface } from "@/components/surface";
import { cn } from "@/lib/utils";
import { SKILL_CATEGORY_META, SKILL_STATUS_META } from "../presentation";
import type { Skill } from "../schema";

// The skill detail view (README.md §Skills): summary + metadata, the instruction steps,
// the allowed tools, and the version history. Read-only; Edit routes to the form. Props
// from the RSC page.

export function SkillDetail({ skill }: { skill: Skill }) {
  const status = SKILL_STATUS_META[skill.status];
  const category = SKILL_CATEGORY_META[skill.category];
  return (
    <Surface className="gap-6">
      <header className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-serif text-2xl font-medium tracking-tight text-text">
              {skill.name}
            </h1>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.1em]",
                status.badgeClass,
              )}
            >
              {status.label}
            </span>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.08em]",
                category.badgeClass,
              )}
            >
              {skill.category}
            </span>
          </div>
          <p className="font-mono text-[12px] text-text-3">
            {skill.slug} · {skill.version} · by {skill.author} · {skill.invocations} runs
          </p>
        </div>
        <Link
          href={`/skills/${skill.id}/edit`}
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-3 py-2 text-[13px] font-medium text-text transition-colors hover:border-border-2 hover:bg-[var(--nav-hover)]"
        >
          <Pencil className="size-3.5" /> Edit
        </Link>
      </header>

      <p className="text-[13.5px] leading-relaxed text-text-2">{skill.summary}</p>

      <section className="space-y-2.5">
        <SectionLabel>Instructions</SectionLabel>
        {skill.steps.length === 0 ? (
          <p className="text-[12.5px] text-text-3">No steps yet.</p>
        ) : (
          <ol className="space-y-1.5">
            {skill.steps.map((step, i) => (
              <li key={step} className="flex gap-2.5 text-[13px] text-text-2">
                <span className="font-mono text-[11px] text-text-4">{i + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}
      </section>

      <section className="space-y-2.5">
        <SectionLabel>Allowed tools</SectionLabel>
        {skill.tools.length === 0 ? (
          <p className="text-[12.5px] text-text-3">No tools declared.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {skill.tools.map((tool) => (
              <span
                key={tool}
                className="rounded-full bg-chip px-2.5 py-1 font-mono text-[11px] text-text-2"
              >
                {tool}
              </span>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2.5">
        <SectionLabel>Version history</SectionLabel>
        <ul className="space-y-2">
          {skill.versionHistory.map((entry) => (
            <li
              key={entry.version}
              className="flex items-baseline gap-3 rounded-lg border border-hair bg-panel px-3 py-2"
            >
              <span className="font-mono text-[12px] font-medium text-text">{entry.version}</span>
              <span className="flex-1 text-[12.5px] text-text-2">{entry.note}</span>
              <span className="font-mono text-[11px] text-text-4">{entry.when}</span>
            </li>
          ))}
        </ul>
      </section>
    </Surface>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-4">{children}</h2>
  );
}
