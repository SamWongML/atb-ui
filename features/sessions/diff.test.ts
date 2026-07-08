import { describe, expect, it } from "vitest";
import { type DiffLine, parseDiff } from "./diff";

// Seam: the pure parser behind the canvas Diff tab. It turns a unified diff (what the
// agent engine emits per session) into structured files/hunks/lines so the view can
// render add/remove/context with correct gutter line numbers — Shiki only colors the
// content on top. Tested against a known-good literal, never a hand-rolled snapshot.

const UNIFIED = `diff --git a/src/auth.ts b/src/auth.ts
--- a/src/auth.ts
+++ b/src/auth.ts
@@ -1,4 +1,4 @@
 import { verify } from "./jwt";
-export function login(token: string) {
-  return verify(token);
+export async function login(token: string) {
+  return await verify(token);
 }
`;

/** The first file's first-hunk lines — the parser is exercised through this seam. */
function linesOf(unified: string): DiffLine[] {
  return parseDiff(unified)[0]?.hunks[0]?.lines ?? [];
}

describe("parseDiff", () => {
  it("extracts the file's old and new paths", () => {
    const file = parseDiff(UNIFIED)[0];
    expect(file?.oldPath).toBe("src/auth.ts");
    expect(file?.newPath).toBe("src/auth.ts");
  });

  it("classifies each line as add, remove, or context", () => {
    const kinds = linesOf(UNIFIED).map((line) => line.kind);
    expect(kinds).toEqual(["context", "remove", "remove", "add", "add", "context"]);
  });

  it("strips the leading marker from line content", () => {
    const added = linesOf(UNIFIED).filter((line) => line.kind === "add");
    expect(added[0]?.content).toBe("export async function login(token: string) {");
  });

  it("numbers context and removed lines on the old side", () => {
    const lines = linesOf(UNIFIED);
    expect(lines[0]?.oldLine).toBe(1);
    expect(lines[0]?.newLine).toBe(1);
    expect(lines[1]?.oldLine).toBe(2);
    expect(lines[1]?.newLine).toBeUndefined();
  });

  it("numbers added lines on the new side only", () => {
    const added = linesOf(UNIFIED).filter((line) => line.kind === "add");
    expect(added.map((line) => line.newLine)).toEqual([2, 3]);
    expect(added[0]?.oldLine).toBeUndefined();
  });

  it("keeps the hunk header for context", () => {
    expect(parseDiff(UNIFIED)[0]?.hunks[0]?.header).toBe("@@ -1,4 +1,4 @@");
  });

  it("splits multiple files into separate entries", () => {
    const twoFiles = `${UNIFIED}diff --git a/README.md b/README.md
--- a/README.md
+++ b/README.md
@@ -1 +1 @@
-# Old
+# New
`;
    const files = parseDiff(twoFiles);
    expect(files.map((f) => f.newPath)).toEqual(["src/auth.ts", "README.md"]);
  });

  it("returns no files for empty input", () => {
    expect(parseDiff("")).toEqual([]);
  });
});
