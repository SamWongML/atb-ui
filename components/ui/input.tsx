import type * as React from "react";
import { cn } from "@/lib/utils";

// Owned input primitive, restyled to ATB tokens (TECH_STACK.md L7). Bound to the shadcn
// role vocabulary via styles/globals.css, so it renders in the ATB look with no patching.
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-9 w-full rounded-md border border-border bg-inset px-3 py-2 text-[13.5px] text-text outline-none transition-colors placeholder:text-text-4 focus-visible:border-border-2 focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 aria-[invalid=true]:border-red",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
