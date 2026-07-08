import Redis from "ioredis";
import { type Broker, createSessionBackplane, type SessionBackplane } from "./realtime/backplane";
import { createMemoryBroker } from "./realtime/memory-broker";

// Production backplane wiring. When REDIS_URL points at ElastiCache, pub/sub fans out
// across every Fargate task; otherwise (local dev) an in-process broker stands in.

let redisClient: Redis | null = null;

/** Lazy ioredis singleton at the ElastiCache primary endpoint (REDIS_URL). */
export function getRedis(): Redis {
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", {
      maxRetriesPerRequest: null,
    });
  }
  return redisClient;
}

/** ioredis Broker — a dedicated subscriber connection per subscription (ioredis rule). */
export function redisBroker(redis: Redis = getRedis()): Broker {
  return {
    publish: async (channel, message) => {
      await redis.publish(channel, message);
    },
    subscribe: async (channel, listener) => {
      const sub = redis.duplicate();
      await sub.subscribe(channel);
      const onMessage = (incoming: string, message: string) => {
        if (incoming === channel) listener(message);
      };
      sub.on("message", onMessage);
      return async () => {
        sub.off("message", onMessage);
        await sub.unsubscribe(channel);
        sub.disconnect();
      };
    },
  };
}

let backplane: SessionBackplane | null = null;

/** The app's session backplane — Redis-backed when configured, in-process otherwise. */
export function getBackplane(): SessionBackplane {
  if (!backplane) {
    backplane = createSessionBackplane(
      process.env.REDIS_URL ? redisBroker() : createMemoryBroker(),
    );
  }
  return backplane;
}
