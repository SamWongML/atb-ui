import type { Broker } from "./backplane";

// Single-process pub/sub for local dev and tests — the fallback when no REDIS_URL is
// set. Fans out within one Node process only; production uses the ioredis broker
// (server/redis.ts) for cross-task delivery.
export function createMemoryBroker(): Broker {
  const channels = new Map<string, Set<(message: string) => void>>();
  return {
    publish(channel, message) {
      for (const listener of channels.get(channel) ?? []) listener(message);
      return Promise.resolve();
    },
    subscribe(channel, listener) {
      const set = channels.get(channel) ?? new Set();
      set.add(listener);
      channels.set(channel, set);
      return Promise.resolve(() => {
        set.delete(listener);
        return Promise.resolve();
      });
    },
  };
}
