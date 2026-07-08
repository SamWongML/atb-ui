import { describe, expect, it } from "vitest";
import { createSessionBackplane } from "./backplane";
import { runBackplaneLoad } from "./load-test";
import { createMemoryBroker } from "./memory-broker";

// Exercises the fan-out spine under load (ROADMAP Phase 1 — "load-tested with the
// Redis backplane"). The default run drives thousands of deliveries through the
// in-process broker in CI and asserts zero loss. Set REDIS_URL to additionally load
// the real ioredis backplane (genuine cross-task fan-out); scale via LOADTEST_*.

const SUBSCRIBERS = Number(process.env.LOADTEST_SUBSCRIBERS ?? 50);
const EVENTS = Number(process.env.LOADTEST_EVENTS ?? 100);

describe("backplane fan-out under load", () => {
  it("delivers every event to every subscriber with no loss (in-process)", async () => {
    const backplane = createSessionBackplane(createMemoryBroker());
    const report = await runBackplaneLoad(backplane, {
      subscribers: SUBSCRIBERS,
      events: EVENTS,
    });

    expect(report.lost).toBe(0);
    expect(report.actualDeliveries).toBe(report.expectedDeliveries);
    console.info(
      `[loadtest] memory broker: ${report.actualDeliveries} deliveries in ` +
        `${report.durationMs.toFixed(1)}ms (${Math.round(report.throughput)}/s)`,
    );
  });

  it.runIf(process.env.REDIS_URL)(
    "delivers with no loss over the real Redis backplane",
    async () => {
      // Imported lazily so the ioredis connection is only created for the opt-in run.
      const { redisBroker } = await import("@/server/redis");
      const backplane = createSessionBackplane(redisBroker());
      const report = await runBackplaneLoad(backplane, {
        subscribers: SUBSCRIBERS,
        events: EVENTS,
        sessionId: `loadtest_${Date.now()}`,
      });

      expect(report.lost).toBe(0);
      console.info(
        `[loadtest] redis backplane: ${report.actualDeliveries} deliveries in ` +
          `${report.durationMs.toFixed(1)}ms (${Math.round(report.throughput)}/s)`,
      );
    },
  );
});
