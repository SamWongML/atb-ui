"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect } from "react";

// PROTOTYPE — throwaway. The floating variant switcher for UI prototype galleries (see
// .claude/skills/prototype): a fixed bottom-centre pill with prev/next arrows and the active
// variant's name. ← / → also cycle — ignored while typing or while a menu/listbox/dialog has
// focus. Deliberately high-contrast and outside the page's visual rhythm so it never reads as
// part of the design under evaluation. Renders nothing in production builds, so a stray
// prototype merge can't ship the bar to users.

export function PrototypeSwitcher<K extends string>({
  variants,
  current,
  onSelect,
}: {
  variants: readonly { key: K; name: string }[];
  current: K;
  onSelect: (key: K) => void;
}) {
  const hidden = process.env.NODE_ENV === "production";
  const index = Math.max(
    0,
    variants.findIndex((entry) => entry.key === current),
  );

  const cycle = useCallback(
    (dir: 1 | -1) => {
      if (variants.length === 0) return;
      const next = variants[(index + dir + variants.length) % variants.length];
      if (next) onSelect(next.key);
    },
    [index, variants, onSelect],
  );

  useEffect(() => {
    if (hidden) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target instanceof Element ? event.target : null;
      if (
        target?.closest(
          "input, textarea, select, [contenteditable], [role='listbox'], [role='menu'], [role='dialog']",
        )
      ) {
        return;
      }
      event.preventDefault();
      cycle(event.key === "ArrowRight" ? 1 : -1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [hidden, cycle]);

  if (hidden || variants.length === 0) return null;
  const active = variants[index];
  return (
    <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2">
      <div className="flex items-center gap-1 rounded-full border border-border-2 bg-raise p-1 shadow-(--shadow)">
        <button
          type="button"
          aria-label="Previous variant"
          onClick={() => cycle(-1)}
          className="grid size-7 place-items-center rounded-full text-text-3 transition-colors hover:bg-[var(--nav-hover)] hover:text-text"
        >
          <ChevronLeft className="size-4" aria-hidden />
        </button>
        <span
          aria-live="polite"
          className="min-w-[200px] px-1 text-center font-mono text-[11px] text-text-2"
        >
          <span className="text-text-4">
            {index + 1}/{variants.length} ·{" "}
          </span>
          {active?.name}
        </span>
        <button
          type="button"
          aria-label="Next variant"
          onClick={() => cycle(1)}
          className="grid size-7 place-items-center rounded-full text-text-3 transition-colors hover:bg-[var(--nav-hover)] hover:text-text"
        >
          <ChevronRight className="size-4" aria-hidden />
        </button>
      </div>
    </div>
  );
}
