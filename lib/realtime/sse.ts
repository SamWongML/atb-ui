import { fetchEventSource } from "@microsoft/fetch-event-source";
import { type RealtimeEvent, realtimeEventSchema } from "@/features/sessions/realtime";

// SSE reader (ARCHITECTURE.md §Real-time). Uses fetch-event-source (POST + auth
// headers, unlike raw EventSource) to carry the high-frequency one-way token stream.
// Every frame is Zod-validated at this boundary before it reaches reconcile().

export type SseHandlers = {
  onEvent: (event: RealtimeEvent) => void;
  onError?: (error: unknown) => void;
};

/** Parse + validate one SSE data payload into a typed event (throws if malformed). */
export function parseFrame(data: string): RealtimeEvent {
  return realtimeEventSchema.parse(JSON.parse(data));
}

/** Validate a raw frame and dispatch it, routing any parse failure to onError. */
export function handleSseMessage(data: string, handlers: SseHandlers): void {
  let event: RealtimeEvent;
  try {
    event = parseFrame(data);
  } catch (error) {
    handlers.onError?.(error);
    return;
  }
  handlers.onEvent(event);
}

export type SessionStreamOptions = SseHandlers & {
  sessionId: string;
  signal?: AbortSignal;
  /** Test/override base; defaults to the same-origin BFF. */
  baseUrl?: string;
};

/**
 * Open the SSE token stream for a session. Frames flow to onEvent (→ reconcile);
 * fetch-event-source auto-reconnects. Abort via options.signal to close.
 */
export function openSessionStream({
  sessionId,
  onEvent,
  onError,
  signal,
  baseUrl = "",
}: SessionStreamOptions): void {
  void fetchEventSource(`${baseUrl}/api/stream/${encodeURIComponent(sessionId)}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    signal,
    openWhenHidden: true,
    onmessage: (message) => {
      if (message.data) handleSseMessage(message.data, { onEvent, onError });
    },
    onerror: (error) => {
      onError?.(error);
    },
  });
}
