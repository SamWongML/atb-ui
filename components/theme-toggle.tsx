"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { DEFAULT_THEME, getCurrentTheme, setTheme, type Theme } from "@/lib/theme";
import { cn } from "@/lib/utils";

// Dark/Light segmented control (README.md §App Shell). A single-select radiogroup
// wired to lib/theme.ts — selecting applies `data-theme` and persists the choice.

const OPTIONS: readonly { value: Theme; label: string; icon: typeof Moon }[] = [
  { value: "dark", label: "Dark", icon: Moon },
  { value: "light", label: "Light", icon: Sun },
];

export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>(DEFAULT_THEME);

  // Sync to the theme the no-FOUC script already applied (avoids a hydration flip).
  useEffect(() => {
    setThemeState(getCurrentTheme());
  }, []);

  function choose(next: Theme) {
    setTheme(next);
    setThemeState(next);
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className="inline-flex gap-0.5 rounded-lg border border-border bg-inset p-0.5"
    >
      {OPTIONS.map(({ value, label, icon: Icon }) => {
        const active = theme === value;
        return (
          // biome-ignore lint/a11y/useSemanticElements: a styled segmented control is the radiogroup/radio ARIA pattern, not native inputs.
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => choose(value)}
            className={cn(
              "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[12.5px] font-medium transition-colors",
              active
                ? "bg-panel text-text shadow-[var(--shadow)]"
                : "text-text-3 hover:text-text-2",
            )}
          >
            <Icon className="size-3.5" aria-hidden />
            {label}
          </button>
        );
      })}
    </div>
  );
}
