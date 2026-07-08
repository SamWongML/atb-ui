import { ChevronDown } from "lucide-react";
import type * as React from "react";
import { cn } from "@/lib/utils";

// Owned select primitive — a native <select> restyled to ATB tokens. Native (not a Radix
// popover) so enum fields stay keyboard-accessible and trivially driven in tests. Bound
// to tokens; never hardcodes color.
function Select({ className, children, ...props }: React.ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        data-slot="select"
        className={cn(
          "flex h-9 w-full appearance-none rounded-md border border-border bg-inset pl-3 pr-8 text-[13.5px] text-text outline-none transition-colors focus-visible:border-border-2 focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 aria-[invalid=true]:border-red",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 size-4 -translate-y-1/2 text-text-4" />
    </div>
  );
}

export { Select };
