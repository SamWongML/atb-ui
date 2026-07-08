import { performance } from "node:perf_hooks";
import type { RealtimeEvent } from "@/features/sessions/realtime";
import type { SessionBackplane } from "./backplane";

// Load harness for the WebSocket fan-out spine (ROADMAP Phase 1 — "load-tested with
// the Redis backplane"; ARCHITECTURE.md §"WebSocket fan-out"). Drives N concurrent
// subscribers × M published events through a backplane, waits for the fan-out to
// settle, and reports delivery correctness + throughput. Backplane-agnostic: point it
// at the in-process broker for a CI check, or at the real ioredis backplane
// (server/redis.ts, REDIS_URL set) to load-test genuine cross-task delivery.

export type LoadOptions = {
  /** Concurrent subscribers on the session channel. */
  subscribers: number;
  /** Events published onto the channel. */
  events: number;
  sessionId?: string;
  /** Bound on how long to wait for async fan-out (e.g. real Redis) to settle. */
  timeoutMs?: number;
};

export type LoadReport = {
  subscribers: number;
  events: number;
  /** subscribers × events — every subscriber should see every event. */
  expectedDeliveries: number;
  actualDeliveries: number;
  /** expectedDeliveries − actualDeliveries; a passing run is 0. */
  lost: number;
  durationMs: number;
  /** Deliveries per second across the publish + fan-out window. */
  throughput: number;
};

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function loadEvent(sessionId: string, index: number): RealtimeEvent {
  return { type: "token", sessionId, messageId: "load", agent: "load", text: `t${index}` };
}

/** Run one fan-out load pass and return its delivery + throughput report. */
export async function runBackplaneLoad(
  backplane: SessionBackplane,
  { subscribers, events, sessionId = "loadtest", timeoutMs = 5_000 }: LoadOptions,
): Promise<LoadReport> {
  const expectedDeliveries = subscribers * events;

  let actualDeliveries = 0;
  let settle = () => {};
  const settled = new Promise<void>((resolve) => {
    settle = resolve;
  });
  const onDeliver = () => {
    actualDeliveries += 1;
    if (actualDeliveries >= expectedDeliveries) settle();
  };

  const unsubs = await Promise.all(
    Array.from({ length: subscribers }, () => backplane.subscribe(sessionId, onDeliver)),
  );

  const start = performance.now();
  for (let i = 0; i < events; i++) {
    await backplane.publish(sessionId, loadEvent(sessionId, i));
  }
  // In-process brokers deliver synchronously; a real Redis backplane fans out async,
  // so wait for the count to reach the target (bounded, so a lossy run still returns).
  await Promise.race([settled, wait(timeoutMs)]);
  const durationMs = performance.now() - start;

  await Promise.all(unsubs.map((unsub) => unsub()));

  return {
    subscribers,
    events,
    expectedDeliveries,
    actualDeliveries,
    lost: expectedDeliveries - actualDeliveries,
    durationMs,
    throughput: durationMs > 0 ? (actualDeliveries / durationMs) * 1_000 : actualDeliveries,
  };
}
