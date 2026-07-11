"use client";

import type * as React from "react";
import { cn } from "@/lib/utils";

// Owned switch primitive, tokenized like the rest of components/ui (TECH_STACK.md L7).
// Dependency-free (no Radix): a controlled `role="switch"` button with data-state
// styling. The thumb color follows the state — on-accent over the clay track when
// checked, text-3 over the neutral track when not — so it keeps contrast in BOTH
// themes (a white thumb on the light theme's pale unchecked track is invisible).

export function Switch({
  checked,
  onCheckedChange,
  disabled,
  className,
  ...props
}: Omit<React.ComponentProps<"button">, "onClick" | "children" | "type" | "role"> & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      data-state={checked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-4 w-7 shrink-0 items-center rounded-full outline-none transition-colors",
        "focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        checked ? "bg-primary" : "bg-border-2",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "pointer-events-none block size-3 rounded-full transition-transform",
          checked ? "translate-x-3.5 bg-on-accent" : "translate-x-0.5 bg-text-3",
        )}
      />
    </button>
  );
}
