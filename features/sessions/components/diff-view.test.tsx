import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { codeLine } from "@/test/dom";
import { DiffView } from "./diff-view";

// Seam: the canvas Diff tab's public output. It renders the parsed unified diff (diff.ts)
// as add/remove/context lines with a per-file header. Content is asserted via textContent
// so the test holds whether or not Shiki has layered its (additive) syntax spans on top.

const DIFF = `diff --git a/src/f.ts b/src/f.ts
--- a/src/f.ts
+++ b/src/f.ts
@@ -1,2 +1,2 @@
-const a = 1;
+const a = 2;
 const b = 3;
`;

describe("DiffView", () => {
  it("renders the file path header", () => {
    render(<DiffView diff={DIFF} />);
    expect(screen.getByText("src/f.ts")).toBeInTheDocument();
  });

  it("renders removed, added, and context line content", () => {
    render(<DiffView diff={DIFF} />);
    expect(codeLine("const a = 1;")).toBeInTheDocument();
    expect(codeLine("const a = 2;")).toBeInTheDocument();
    expect(codeLine("const b = 3;")).toBeInTheDocument();
  });

  it("labels the changed lines for assistive tech", () => {
    render(<DiffView diff={DIFF} />);
    expect(screen.getAllByText(/^added line$/i)).toHaveLength(1);
    expect(screen.getAllByText(/^removed line$/i)).toHaveLength(1);
  });

  it("shows the hunk header", () => {
    render(<DiffView diff={DIFF} />);
    expect(screen.getByText("@@ -1,2 +1,2 @@")).toBeInTheDocument();
  });

  it("shows an empty state when there is no diff", () => {
    render(<DiffView diff="" />);
    expect(screen.getByText(/no changes/i)).toBeInTheDocument();
  });
});
