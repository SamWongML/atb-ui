import { describe, expect, it } from "vitest";
import type { RealtimeEvent } from "@/features/sessions/realtime";
import { type Broker, createSessionBackplane } from "./backplane";

// Seam: the multi-task fan-out contract (ARCHITECTURE.md §"WebSocket fan-out"). An
// event published on one Fargate task must reach a subscriber pinned to another. We
// simulate the shared Redis with one in-memory broker and two backplane instances
// ("task A" and "task B") talking through it — no real Redis needed.

class InMemoryBroker implements Broker {
  private readonly channels = new Map<string, Set<(message: string) => void>>();

  publish(channel: string, message: string): Promise<void> {
    for (const listener of this.channels.get(channel) ?? []) listener(message);
    return Promise.resolve();
  }

  subscribe(channel: string, listener: (message: string) => void): Promise<() => Promise<void>> {
    const set = this.channels.get(channel) ?? new Set();
    set.add(listener);
    this.channels.set(channel, set);
    return Promise.resolve(() => {
      set.delete(listener);
      return Promise.resolve();
    });
  }
}

describe("session backplane", () => {
  it("delivers an event published on one task to a subscriber on another", async () => {
    const redis = new InMemoryBroker(); // the shared ElastiCache instance
    const taskA = createSessionBackplane(redis);
    const taskB = createSessionBackplane(redis);

    const received: RealtimeEvent[] = [];
    await taskB.subscribe("sess_01", (event) => received.push(event));
    await taskA.publish("sess_01", { type: "status", sessionId: "sess_01", status: "review" });

    expect(received).toHaveLength(1);
    expect(received[0]).toMatchObject({ type: "status", status: "review" });
  });

  it("scopes delivery to the session's channel", async () => {
    const redis = new InMemoryBroker();
    const backplane = createSessionBackplane(redis);

    const received: RealtimeEvent[] = [];
    await backplane.subscribe("sess_01", (event) => received.push(event));
    await backplane.publish("sess_02", { type: "status", sessionId: "sess_02", status: "done" });

    expect(received).toHaveLength(0);
  });

  it("drops a malformed payload at the boundary", async () => {
    const redis = new InMemoryBroker();
    const backplane = createSessionBackplane(redis);

    const received: RealtimeEvent[] = [];
    await backplane.subscribe("sess_01", (event) => received.push(event));
    // A corrupt frame arriving on the channel (e.g. a bad producer) must not dispatch.
    redis.publish("session:sess_01", JSON.stringify({ type: "explode" }));

    expect(received).toHaveLength(0);
  });
});
