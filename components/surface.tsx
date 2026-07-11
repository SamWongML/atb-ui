import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// The one main-pane content column (design §main): centered, capped at
// --surface-max-w — --surface-narrow-max-w for chat/reading/form columns — using the
// 26/30/70 padding from the design's wide scrolling surfaces, reused here for the
// narrow variant too for consistency (chat regions carry their own rhythm and will
// own it once that layout is built). The shell's <main> owns scrolling; Surface owns
// width and padding. `fill` bounds the column to the pane height (with a symmetric
// bottom pad) for surfaces that scroll a region internally instead of flowing in <main>.
export function Surface({
  narrow = false,
  fill = false,
  className,
  children,
}: {
  narrow?: boolean;
  fill?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto flex w-full flex-col px-surface-x pt-surface-t",
        narrow ? "max-w-surface-narrow" : "max-w-surface",
        fill ? "h-full pb-surface-t" : "pb-surface-b",
        className,
      )}
    >
      {children}
    </div>
  );
}
