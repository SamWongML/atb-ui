import { QueryClient } from "@tanstack/react-query";
import { describe, expect, it } from "vitest";
import type { SessionDetail } from "@/features/sessions/realtime";
import { queryKeys } from "@/lib/query/keys";
import { reconcile } from "./reconcile";
import { handleSseMessage } from "./sse";
import { sendControl, serializeControlCommand } from "./ws";

// Seam: the WS control round-trip (ARCHITECTURE.md §"Return path"). A steering command
// updates the cache optimistically and goes out over an injected transport; the
// authoritative echo returns through the same reconcile() sink and wins. No real
// socket — the transport is a fake that records what was sent.

const read = (client: QueryClient) =>
  client.getQueryData<SessionDetail>(queryKeys.session("sess_01"));

describe("serializeControlCommand", () => {
  it("serializes a command to its wire shape", () => {
    const wire = serializeControlCommand({
      type: "control",
      sessionId: "sess_01",
      action: "approve",
    });
    expect(JSON.parse(wire)).toEqual({ type: "control", sessionId: "sess_01", action: "approve" });
  });
});

describe("sendControl", () => {
  it("optimistically reflects the action and sends the command", () => {
    const client = new QueryClient();
    const sent: string[] = [];
    sendControl({ send: (data) => sent.push(data) }, client, {
      type: "control",
      sessionId: "sess_01",
      action: "interrupt",
    });

    expect(read(client)?.status).toBe("needs_you");
    expect(JSON.parse(sent[0] ?? "{}")).toMatchObject({ action: "interrupt" });
  });

  it("lets the authoritative echo override the optimistic guess", () => {
    const client = new QueryClient();
    sendControl({ send: () => {} }, client, {
      type: "control",
      sessionId: "sess_01",
      action: "approve",
    });
    expect(read(client)?.status).toBe("active"); // optimistic

    // The engine actually moved it to review; the echo reconciles authoritatively.
    handleSseMessage(
      JSON.stringify({
        type: "control",
        sessionId: "sess_01",
        action: "approve",
        status: "review",
      }),
      { onEvent: (event) => reconcile(client, event) },
    );
    expect(read(client)?.status).toBe("review");
  });
});
