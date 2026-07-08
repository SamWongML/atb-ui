import { describe, expect, it } from "vitest";
import type { RealtimeEvent } from "@/features/sessions/realtime";
import { createSessionBackplane } from "./backplane";
import { applyControl, handleControlMessage } from "./gateway";
import { createMemoryBroker } from "./memory-broker";

// Seam: the server side of the WS control round-trip (ARCHITECTURE.md §"Return path").
// An inbound command yields the engine's authoritative echo, published to the backplane
// so it fans out to every task's subscribers. Malformed commands are dropped.

describe("applyControl", () => {
  it("resolves approve to a running session", () => {
    expect(
      applyControl({ type: "control", sessionId: "sess_01", action: "approve" }),
    ).toMatchObject({
      type: "control",
      status: "active",
    });
  });

  it("resolves interrupt to needs-you", () => {
    expect(
      applyControl({ type: "control", sessionId: "sess_01", action: "interrupt" }),
    ).toMatchObject({
      status: "needs_you",
    });
  });
});

describe("handleControlMessage", () => {
  it("fans the authoritative echo out over the backplane", async () => {
    const backplane = createSessionBackplane(createMemoryBroker());
    const received: RealtimeEvent[] = [];
    await backplane.subscribe("sess_01", (event) => received.push(event));

    await handleControlMessage(
      JSON.stringify({ type: "control", sessionId: "sess_01", action: "interrupt" }),
      backplane,
    );

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({
      type: "control",
      action: "interrupt",
      status: "needs_you",
    });
  });

  it("drops a malformed control message", async () => {
    const backplane = createSessionBackplane(createMemoryBroker());
    const received: RealtimeEvent[] = [];
    await backplane.subscribe("sess_01", (event) => received.push(event));

    await handleControlMessage('{"type":"control","action":"nope"}', backplane);
    await handleControlMessage("not json", backplane);

    expect(received).toHaveLength(0);
  });
});
