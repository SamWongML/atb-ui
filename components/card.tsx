import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// The one list-surface entity card, shared by every BUILD grid (Agents, MCP, Skills,
// Squads, Workflows). Centralised so all cards carry the same tokenised shell — the
// fixed `--card-h` height, hairline border, panel fill and hover lift — instead of each
// feature hand-rolling the className and drifting. Renders as `<Link>` via `asChild`
// (same Slot pattern as Button) so the whole card navigates.
//
// Height is FIXED (`h-(--card-h)`), not a min: cards sit in a CSS grid whose default
// `align-items: stretch` would otherwise size every card to the tallest in its row, so a
// card's height would change with the search result set (its tallest row-sibling changes).
// A fixed height decouples each card from its neighbours — identical and search-invariant.
// The contract this asks of callers: every body section must be height-bounded so content
// can never exceed `--card-h` (clamp text with `line-clamp-*`, keep chip/tag rows to a
// single line — never `flex-1`), and the trailing row must be `<CardFooter>` (`mt-auto`)
// so the leftover height opens as a neutral gap above the footer, keeping footers aligned.
const cardVariants = cva("group flex h-(--card-h) flex-col rounded-xl p-4 transition-all", {
  variants: {
    variant: {
      solid:
        "border border-hair bg-panel hover:border-border-2 hover:bg-panel-2 hover:shadow-(--shadow)",
      dashed:
        "items-center justify-center gap-2.5 border border-dashed border-border-2 text-text-3 hover:border-text-4 hover:text-text-2",
    },
  },
  defaultVariants: {
    variant: "solid",
  },
});

export function Card({
  asChild = false,
  variant,
  className,
  children,
}: {
  asChild?: boolean;
  className?: string;
  children: ReactNode;
} & VariantProps<typeof cardVariants>) {
  const Comp = asChild ? Slot : "div";
  return <Comp className={cn(cardVariants({ variant, className }))}>{children}</Comp>;
}

// The card's trailing meta row. `mt-auto` pins it to the bottom of the flex column, so the
// leftover of the fixed `--card-h` opens as a gap above it rather than distorting the
// content above — this is what keeps every card's footer aligned without clipping.
export function CardFooter({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "mt-auto flex items-center justify-between border-t border-hair pt-3 font-mono text-[11px]",
        className,
      )}
    >
      {children}
    </div>
  );
}
