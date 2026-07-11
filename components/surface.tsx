import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// The one main-pane content column (design §main): centered, capped at
// --surface-max-w — --surface-narrow-max-w for chat/reading/form columns — using the
// 26/30/70 padding from the design's wide scrolling surfaces, reused here for the
// narrow variant too for consistency (chat regions carry their own rhythm and will
// own it once that layout is built). The shell's <main> owns scrolling; Surface owns
// width and padding. `fill` bounds the column to the pane height (with a symmetric
// bottom pad) for surfaces that scroll a region internally instead of flowing in <main>.
// `fullWidth` lifts the cap entirely (a first-class prop, NOT a `max-w-none` className:
// tailwind-merge doesn't know the custom `max-w-surface` utility, so class overrides
// silently lose the specificity race) — the display option list screens expose.
export function Surface({
  narrow = false,
  fill = false,
  fullWidth = false,
  className,
  children,
}: {
  narrow?: boolean;
  fill?: boolean;
  fullWidth?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col px-surface-x pt-surface-t",
        fullWidth ? "max-w-none" : narrow ? "max-w-surface-narrow" : "max-w-surface",
        fill ? "h-full pb-surface-t" : "pb-surface-b",
        className,
      )}
    >
      {children}
    </div>
  );
}
