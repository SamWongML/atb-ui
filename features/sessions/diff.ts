// A pure unified-diff parser for the canvas Diff tab. The agent engine emits a session's
// edits as a unified diff; this turns it into structured files/hunks/lines with correct
// gutter numbers, so the view is a dumb renderer and Shiki only has to color the content.
// No I/O, no DOM — tested at its function seam.

export type DiffLineKind = "add" | "remove" | "context";

export interface DiffLine {
  kind: DiffLineKind;
  content: string;
  /** 1-based line number on the old side (absent on added lines). */
  oldLine?: number;
  /** 1-based line number on the new side (absent on removed lines). */
  newLine?: number;
}

export interface DiffHunk {
  header: string;
  lines: DiffLine[];
}

export interface DiffFile {
  oldPath: string;
  newPath: string;
  hunks: DiffHunk[];
}

const HUNK_HEADER = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/;

function stripPrefix(path: string): string {
  // `git diff` prefixes paths with a/ and b/; drop them for display.
  return path.replace(/^[ab]\//, "");
}

/** Parse a unified diff into files → hunks → classified, numbered lines. */
export function parseDiff(unified: string): DiffFile[] {
  const files: DiffFile[] = [];
  let file: DiffFile | null = null;
  let hunk: DiffHunk | null = null;
  let oldLine = 0;
  let newLine = 0;

  for (const line of unified.split("\n")) {
    if (line.startsWith("diff --git")) {
      file = { oldPath: "", newPath: "", hunks: [] };
      hunk = null;
      files.push(file);
      continue;
    }
    if (line.startsWith("--- ")) {
      if (file) file.oldPath = stripPrefix(line.slice(4).trim());
      continue;
    }
    if (line.startsWith("+++ ")) {
      if (file) file.newPath = stripPrefix(line.slice(4).trim());
      continue;
    }

    const hunkMatch = line.match(HUNK_HEADER);
    if (hunkMatch && file) {
      oldLine = Number(hunkMatch[1]);
      newLine = Number(hunkMatch[2]);
      hunk = { header: line, lines: [] };
      file.hunks.push(hunk);
      continue;
    }
    if (!hunk) continue;

    // "\ No newline at end of file" and any blank trailing split entry aren't content.
    if (line.startsWith("\\")) continue;

    if (line.startsWith("+")) {
      hunk.lines.push({ kind: "add", content: line.slice(1), newLine });
      newLine += 1;
    } else if (line.startsWith("-")) {
      hunk.lines.push({ kind: "remove", content: line.slice(1), oldLine });
      oldLine += 1;
    } else if (line.startsWith(" ")) {
      hunk.lines.push({ kind: "context", content: line.slice(1), oldLine, newLine });
      oldLine += 1;
      newLine += 1;
    }
  }

  return files;
}
