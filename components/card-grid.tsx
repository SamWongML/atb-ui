import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// The one responsive card grid for every BUILD list surface (Agents, MCP, Skills, Squads,
// Workflows). Columns auto-fill down to the `--card-col-min` floor then flex to `1fr`, so
// the grid reflows fluidly without per-screen breakpoint tuning. Centralised alongside
// <Card> so every roster shares the same column rhythm and gutter.
export function CardGrid({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "grid gap-3.5 [grid-template-columns:repeat(auto-fill,minmax(var(--card-col-min),1fr))]",
        className,
      )}
    >
      {children}
    </div>
  );
}
