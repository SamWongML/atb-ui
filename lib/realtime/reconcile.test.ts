import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { SessionCanvas } from "@/features/sessions/canvas";
import type { SessionDetail } from "@/features/sessions/realtime";
import { queryKeys } from "@/lib/query/keys";
import { reconcile } from "./reconcile";

// Seam: the single sink writing stream events into the Query cache (ARCHITECTURE.md
// §Real-time). Observe the cache via getQueryData — never reconcile's internals. This
// is the one function every SSE/WS frame flows through.

function read(client: QueryClient, id = "sess_01"): SessionDetail | undefined {
  return client.getQueryData<SessionDetail>(queryKeys.session(id));
}

function token(text: string, messageId = "m1") {
  return {
    type: "token" as const,
    sessionId: "sess_01",
    messageId,
    agent: "Builder",
    text,
  };
}

describe("reconcile", () => {
  it("appends streamed tokens into one transcript message", () => {
    const client = new QueryClient();
    reconcile(client, token("hel"));
    reconcile(client, token("lo"));

    const detail = read(client);
    expect(detail?.transcript).toHaveLength(1);
    expect(detail?.transcript[0]?.text).toBe("hello");
    expect(detail?.transcript[0]?.pending).toBe(true);
  });

  it("keeps distinct messages for distinct messageIds", () => {
    const client = new QueryClient();
    reconcile(client, token("a", "m1"));
    reconcile(client, token("b", "m2"));
    expect(read(client)?.transcript).toHaveLength(2);
  });

  it("drops the live cursor when a message ends", () => {
    const client = new QueryClient();
    reconcile(client, token("done"));
    reconcile(client, { type: "message_end", sessionId: "sess_01", messageId: "m1" });
    expect(read(client)?.transcript[0]?.pending).toBe(false);
  });

  it("updates the session status from a status frame", () => {
    const client = new QueryClient();
    reconcile(client, { type: "status", sessionId: "sess_01", status: "review" });
    expect(read(client)?.status).toBe("review");
  });

  it("advances step progress", () => {
    const client = new QueryClient();
    reconcile(client, { type: "step", sessionId: "sess_01", steps: { completed: 3, total: 5 } });
    expect(read(client)?.steps).toEqual({ completed: 3, total: 5 });
  });

  it("applies the authoritative control echo to the status", () => {
    const client = new QueryClient();
    reconcile(client, {
      type: "control",
      sessionId: "sess_01",
      action: "interrupt",
      status: "needs_you",
    });
    expect(read(client)?.status).toBe("needs_you");
  });

  it("merges into an existing snapshot without clobbering it", () => {
    const client = new QueryClient();
    const snapshot: SessionDetail = {
      id: "sess_01",
      title: "Refactor auth module",
      status: "active",
      steps: { completed: 1, total: 5 },
      transcript: [],
      updatedAt: "2026-07-07T10:12:00.000Z",
    };
    client.setQueryData(queryKeys.session("sess_01"), snapshot);
    reconcile(client, token("hi"));

    const detail = read(client);
    expect(detail?.title).toBe("Refactor auth module");
    expect(detail?.transcript[0]?.text).toBe("hi");
  });
});

// The canvas (Plan/Run/Diff/Trace) is a second live cache entry the same sink feeds, so
// the four working views update through reconcile() exactly like the transcript — no
// component ever touches a socket (CLAUDE.md §Data & realtime).
function readCanvas(client: QueryClient, id = "sess_01"): SessionCanvas | undefined {
  return client.getQueryData<SessionCanvas>(queryKeys.sessionCanvas(id));
}

describe("reconcile — canvas", () => {
  it("appends a run-log line into the canvas cache", () => {
    const client = new QueryClient();
    reconcile(client, {
      type: "run_log",
      sessionId: "sess_01",
      line: { id: "r1", at: "2026-07-07T10:00:00.000Z", level: "info", text: "pnpm test" },
    });
    reconcile(client, {
      type: "run_log",
      sessionId: "sess_01",
      line: { id: "r2", at: "2026-07-07T10:00:01.000Z", level: "error", text: "1 failing" },
    });
    expect(readCanvas(client)?.run.map((l) => l.text)).toEqual(["pnpm test", "1 failing"]);
  });

  it("replaces the plan when a plan frame arrives", () => {
    const client = new QueryClient();
    reconcile(client, {
      type: "plan",
      sessionId: "sess_01",
      plan: [{ id: "p1", text: "Refactor login()", state: "active" }],
    });
    expect(readCanvas(client)?.plan).toEqual([
      { id: "p1", text: "Refactor login()", state: "active" },
    ]);
  });

  it("appends a trace span", () => {
    const client = new QueryClient();
    reconcile(client, {
      type: "trace",
      sessionId: "sess_01",
      span: { id: "t1", name: "verify()", durationMs: 12, status: "ok" },
    });
    expect(readCanvas(client)?.trace).toHaveLength(1);
  });

  it("seeds the whole canvas from a snapshot frame", () => {
    const client = new QueryClient();
    const canvas: SessionCanvas = {
      sessionId: "sess_01",
      plan: [{ id: "p1", text: "Read the module", state: "done" }],
      run: [],
      diff: "diff --git a/x b/x\n",
      trace: [],
    };
    reconcile(client, { type: "canvas", sessionId: "sess_01", canvas });
    expect(readCanvas(client)?.diff).toContain("diff --git");
  });

  it("keeps transcript and canvas in separate cache entries", () => {
    const client = new QueryClient();
    reconcile(client, {
      type: "run_log",
      sessionId: "sess_01",
      line: { id: "r1", at: "", level: "info", text: "hi" },
    });
    // A canvas frame must not create or clobber the transcript entry.
    expect(read(client)).toBeUndefined();
    expect(readCanvas(client)?.run).toHaveLength(1);
  });
});
