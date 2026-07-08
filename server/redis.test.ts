import type Redis from "ioredis";
import { describe, expect, it } from "vitest";
import { redisBroker } from "./redis";

// Seam: the ioredis Broker that carries cross-task fan-out in production (server/
// redis.ts). We drive the real redisBroker code — its duplicate-connection-per-
// subscription, channel filtering, and unsubscribe teardown — against a fake ioredis
// whose connections share one pub/sub bus, standing in for the shared ElastiCache.
// This proves the actual production path a live two-task round-trip depends on, with
// no real Redis. (Point it at a real server by running the backplane load harness
// with REDIS_URL set — see server/realtime/load-test.test.ts.)

type MessageListener = (channel: string, message: string) => void;

/** The shared pub/sub fabric every duplicated connection publishes onto. */
class FakeBus {
  readonly subscribers = new Set<FakeRedis>();
}

/** A minimal ioredis stand-in: publish reaches every connection subscribed to the
 *  channel on the same bus, exactly as Redis pub/sub fans out across clients. */
class FakeRedis {
  readonly channels = new Set<string>();
  private readonly listeners = new Set<MessageListener>();
  disconnected = false;

  constructor(private readonly bus: FakeBus = new FakeBus()) {}

  duplicate(): FakeRedis {
    return new FakeRedis(this.bus);
  }

  publish(channel: string, message: string): Promise<number> {
    let delivered = 0;
    for (const conn of this.bus.subscribers) {
      if (!conn.channels.has(channel)) continue;
      for (const listener of conn.listeners) {
        listener(channel, message);
        delivered++;
      }
    }
    return Promise.resolve(delivered);
  }

  subscribe(channel: string): Promise<void> {
    this.channels.add(channel);
    this.bus.subscribers.add(this);
    return Promise.resolve();
  }

  unsubscribe(channel: string): Promise<void> {
    this.channels.delete(channel);
    if (this.channels.size === 0) this.bus.subscribers.delete(this);
    return Promise.resolve();
  }

  on(_event: "message", listener: MessageListener): this {
    this.listeners.add(listener);
    return this;
  }

  off(_event: "message", listener: MessageListener): this {
    this.listeners.delete(listener);
    return this;
  }

  disconnect(): void {
    this.disconnected = true;
  }
}

const asRedis = (fake: FakeRedis) => fake as unknown as Redis;

describe("redisBroker", () => {
  it("delivers a publish on one connection to a subscriber on another (cross-task path)", async () => {
    const shared = new FakeRedis(); // the shared ElastiCache instance
    const broker = redisBroker(asRedis(shared));

    const received: string[] = [];
    const unsubscribe = await broker.subscribe("session:sess_01", (m) => received.push(m));
    await broker.publish("session:sess_01", "hello");

    expect(received).toEqual(["hello"]);
    await unsubscribe();
  });

  it("scopes delivery to the subscribed channel", async () => {
    const broker = redisBroker(asRedis(new FakeRedis()));

    const received: string[] = [];
    await broker.subscribe("session:sess_01", (m) => received.push(m));
    await broker.publish("session:sess_02", "other");

    expect(received).toEqual([]);
  });

  it("stops delivering after unsubscribe", async () => {
    const broker = redisBroker(asRedis(new FakeRedis()));

    const received: string[] = [];
    const unsubscribe = await broker.subscribe("session:sess_01", (m) => received.push(m));
    await unsubscribe();
    await broker.publish("session:sess_01", "after");

    expect(received).toEqual([]);
  });
});
