"use client";

import { useEffect, useState } from "react";

// Shiki-backed syntax highlighting for the canvas Diff tab (TECH_STACK.md L8: "Shiki —
// accurate diff/code highlighting"). The highlighter is imported lazily so it lands in a
// code-split chunk (ARCHITECTURE.md budget: "code-split the canvas & Shiki"). Output is
// dual-theme with `defaultColor: false`, so each token carries `--shiki-light/-dark` CSS
// vars that globals.css flips on `data-theme` — colors stay in CSS, never hardcoded here.
// Highlighting is additive: the plain content renders first and Shiki enhances it, so the
// text never changes, only its coloring.

export const SHIKI_LANGS = ["typescript", "tsx", "javascript", "jsx", "sql", "markdown"] as const;
export type ShikiLang = (typeof SHIKI_LANGS)[number] | "text";

const LIGHT_THEME = "github-light";
const DARK_THEME = "github-dark";

/** Best-effort language from a file path; unknown extensions render as plain text. */
export function langFromPath(path: string): ShikiLang {
  if (/\.tsx$/.test(path)) return "tsx";
  if (/\.ts$/.test(path)) return "typescript";
  if (/\.jsx$/.test(path)) return "jsx";
  if (/\.(js|mjs|cjs)$/.test(path)) return "javascript";
  if (/\.sql$/.test(path)) return "sql";
  if (/\.(md|mdx)$/.test(path)) return "markdown";
  return "text";
}

type Highlighter = Awaited<ReturnType<typeof import("shiki").createHighlighter>>;

let highlighterPromise: Promise<Highlighter> | null = null;

function getHighlighter(): Promise<Highlighter> {
  if (!highlighterPromise) {
    highlighterPromise = import("shiki").then(({ createHighlighter }) =>
      createHighlighter({ themes: [LIGHT_THEME, DARK_THEME], langs: [...SHIKI_LANGS] }),
    );
  }
  return highlighterPromise;
}

/**
 * Returns Shiki inline HTML for one line of code, or `null` until (and unless) the
 * highlighter is ready. Callers render the plain content while this is null.
 */
export function useShikiHtml(code: string, lang: ShikiLang): string | null {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    if (lang === "text" || code === "") {
      setHtml(null);
      return;
    }
    let active = true;
    getHighlighter()
      .then((highlighter) => {
        if (!active) return;
        setHtml(
          highlighter.codeToHtml(code, {
            lang,
            themes: { light: LIGHT_THEME, dark: DARK_THEME },
            defaultColor: false,
            structure: "inline",
          }),
        );
      })
      .catch(() => {
        // Highlighting is a progressive enhancement; on failure keep the plain text.
      });
    return () => {
      active = false;
    };
  }, [code, lang]);

  return html;
}
