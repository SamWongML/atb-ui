import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// The one empty-state panel for list surfaces. Agents uses it now; the other BUILD lists
// (Workflows, Squads, Skills, MCP) each hand-roll a near-identical copy today and adopt
// this as the redesign propagates. Tokenized + theme-safe: a hairline panel with an
// optional tinted icon, a title, optional supporting copy, and an optional action.

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-hair bg-panel px-6 py-16 text-center",
        className,
      )}
    >
      {Icon && (
        <span
          aria-hidden
          className="grid size-11 place-items-center rounded-xl border border-border bg-panel-2 text-text-3"
        >
          <Icon className="size-5" />
        </span>
      )}
      <div className="flex flex-col gap-1">
        <p className="text-[13.5px] font-medium text-text">{title}</p>
        {description && (
          <p className="mx-auto max-w-[44ch] text-[12.5px] leading-relaxed text-text-3">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
}
