import type * as React from "react";
import { cn } from "@/lib/utils";

// Owned label primitive, restyled to ATB tokens (TECH_STACK.md L7).
function Label({ className, ...props }: React.ComponentProps<"label">) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: htmlFor is always supplied by the Field wrapper that pairs this with its control.
    <label
      data-slot="label"
      className={cn(
        "flex items-center gap-1 text-[12.5px] font-medium text-text-2 select-none",
        className,
      )}
      {...props}
    />
  );
}

export { Label };
