import { type RealtimeEvent, realtimeEventSchema } from "@/features/sessions/realtime";

// Redis pub/sub backplane for multi-task WebSocket fan-out (ARCHITECTURE.md §"The
// critical production detail"). With >1 Fargate task, a client's socket is pinned to
// one task; an event produced anywhere must reach every task's subscribers. Every
// task publishes/subscribes to per-session channels on the shared ElastiCache.
//
// The backplane is written against a narrow Broker port so it unit-tests against an
// in-memory fake and swaps in ioredis in production (see redisBroker).

/** Detaches a subscription. */
export type Unsubscribe = () => Promise<void>;

export interface Broker {
  publish(channel: string, message: string): Promise<void>;
  /** Subscribe to a channel; resolves to an unsubscribe function. */
  subscribe(channel: string, listener: (message: string) => void): Promise<Unsubscribe>;
}

const channelFor = (sessionId: string) => `session:${sessionId}`;

export function createSessionBackplane(broker: Broker) {
  return {
    /** Fan an event out to every task subscribed to this session. */
    publish(sessionId: string, event: RealtimeEvent): Promise<void> {
      return broker.publish(channelFor(sessionId), JSON.stringify(event));
    },

    /**
     * Receive session events from any task. Validates at this process boundary — a
     * malformed payload is dropped, never dispatched (ARCHITECTURE.md §Security).
     */
    subscribe(sessionId: string, onEvent: (event: RealtimeEvent) => void): Promise<Unsubscribe> {
      return broker.subscribe(channelFor(sessionId), (message) => {
        let parsed: unknown;
        try {
          parsed = JSON.parse(message);
        } catch {
          return;
        }
        const result = realtimeEventSchema.safeParse(parsed);
        if (result.success) onEvent(result.data);
      });
    },
  };
}

export type SessionBackplane = ReturnType<typeof createSessionBackplane>;
