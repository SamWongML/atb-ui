import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";
import { cn } from "@/lib/utils";

// shadcn/ui Button — owned source, restyled to ATB tokens (TECH_STACK.md L7).
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-[13.5px] font-medium leading-none transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-accent hover:bg-primary-2",
        soft: "border border-primary-soft-bd bg-primary-soft text-primary hover:bg-primary-bg",
        outline:
          "border border-border bg-transparent text-text hover:border-border-2 hover:bg-[var(--nav-hover)]",
        ghost: "text-text-2 hover:bg-[var(--nav-hover)] hover:text-text",
        destructive: "bg-red text-on-accent hover:opacity-90",
      },
      size: {
        default: "h-9 px-3.5 py-2",
        sm: "h-8 px-3",
        lg: "h-10 px-5",
        icon: "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
