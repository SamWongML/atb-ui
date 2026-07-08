import type * as React from "react";
import { cn } from "@/lib/utils";

// Owned textarea primitive, restyled to ATB tokens (TECH_STACK.md L7).
function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex min-h-20 w-full rounded-md border border-border bg-inset px-3 py-2 text-[13.5px] leading-relaxed text-text outline-none transition-colors placeholder:text-text-4 focus-visible:border-border-2 focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 aria-[invalid=true]:border-red",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
