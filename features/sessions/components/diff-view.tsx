"use client";

import { type DiffFile, type DiffLine, parseDiff } from "../diff";
import { langFromPath, type ShikiLang, useShikiHtml } from "./use-shiki-html";

// The canvas Diff tab (README.md §Sessions): the session's unified diff, parsed (diff.ts)
// into add/remove/context lines with gutter numbers and Shiki syntax coloring. The row
// backgrounds are semantic tokens (green = added, red = removed); Shiki only colors the
// code text. Pure over its `diff` prop.

const LINE_STYLE: Record<DiffLine["kind"], { row: string; sign: string; label?: string }> = {
  add: { row: "bg-green-bg", sign: "+", label: "Added line" },
  remove: { row: "bg-red-bg", sign: "-", label: "Removed line" },
  context: { row: "", sign: " " },
};

export function DiffView({ diff }: { diff: string }) {
  const files = parseDiff(diff);

  if (files.length === 0) {
    return <p className="text-[13px] text-text-3">No changes in this session yet.</p>;
  }

  return (
    <div className="space-y-4">
      {files.map((file) => (
        <FileDiff key={file.newPath || file.oldPath} file={file} />
      ))}
    </div>
  );
}

function FileDiff({ file }: { file: DiffFile }) {
  const lang = langFromPath(file.newPath || file.oldPath);
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="border-b border-hair bg-panel-2 px-3 py-1.5 font-mono text-[11px] text-text-2">
        {file.newPath || file.oldPath}
      </div>
      <div className="overflow-x-auto bg-inset font-mono text-[12px] leading-[1.6]">
        {file.hunks.map((hunk) => (
          <div key={hunk.header}>
            <div className="bg-panel-2/60 px-3 py-0.5 text-[11px] text-text-4">{hunk.header}</div>
            {hunk.lines.map((line, index) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: diff lines have no stable id.
              <DiffLineRow key={index} line={line} lang={lang} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function DiffLineRow({ line, lang }: { line: DiffLine; lang: ShikiLang }) {
  const style = LINE_STYLE[line.kind];
  return (
    <div className={`flex ${style.row}`}>
      {style.label && <span className="sr-only">{style.label}</span>}
      <span className="w-10 flex-shrink-0 select-none px-2 text-right text-text-4">
        {line.oldLine ?? ""}
      </span>
      <span className="w-10 flex-shrink-0 select-none px-2 text-right text-text-4">
        {line.newLine ?? ""}
      </span>
      <span aria-hidden className="w-4 flex-shrink-0 select-none text-center text-text-3">
        {style.sign}
      </span>
      <DiffCode content={line.content} lang={lang} />
    </div>
  );
}

function DiffCode({ content, lang }: { content: string; lang: ShikiLang }) {
  const html = useShikiHtml(content, lang);
  if (html) {
    return (
      // Shiki preserves the text; only inline color spans are added. dangerouslySetInnerHTML
      // is safe here — the input is a diff line, and Shiki emits a fixed token structure.
      <code
        className="shiki-inline min-w-0 flex-1 whitespace-pre pr-3 text-text"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Shiki output, text-preserving.
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  }
  return <code className="min-w-0 flex-1 whitespace-pre pr-3 text-text-2">{content}</code>;
}
