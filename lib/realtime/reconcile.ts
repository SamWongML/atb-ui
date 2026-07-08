import type { QueryClient } from "@tanstack/react-query";
import type { RealtimeEvent, SessionDetail, SessionMessage } from "@/features/sessions/realtime";
import { queryKeys } from "@/lib/query/keys";

// The single sink (ARCHITECTURE.md §Real-time): every SSE/WS frame — whichever
// transport delivered it — flows through here into the Query cache. Components render
// the cache and never learn a socket exists. Pure over the cache: no I/O, no sockets.

/** A minimal detail to merge into before the initial snapshot (if any) has loaded. */
function seedDetail(sessionId: string): SessionDetail {
  return {
    id: sessionId,
    title: "",
    status: "active",
    steps: { completed: 0, total: 1 },
    transcript: [],
    updatedAt: "",
  };
}

function appendToken(
  transcript: readonly SessionMessage[],
  messageId: string,
  agent: string,
  text: string,
): SessionMessage[] {
  const existing = transcript.find((message) => message.id === messageId);
  if (!existing) {
    return [...transcript, { id: messageId, agent, text, pending: true }];
  }
  return transcript.map((message) =>
    message.id === messageId ? { ...message, text: message.text + text } : message,
  );
}

function endMessage(transcript: readonly SessionMessage[], messageId: string): SessionMessage[] {
  return transcript.map((message) =>
    message.id === messageId ? { ...message, pending: false } : message,
  );
}

/** Fold one event into the current detail, returning a new detail (immutable). */
function applyEvent(detail: SessionDetail, event: RealtimeEvent): SessionDetail {
  switch (event.type) {
    case "token":
      return {
        ...detail,
        transcript: appendToken(detail.transcript, event.messageId, event.agent, event.text),
      };
    case "message_end":
      return { ...detail, transcript: endMessage(detail.transcript, event.messageId) };
    case "status":
      return { ...detail, status: event.status };
    case "step":
      return { ...detail, steps: event.steps };
    case "control":
      return { ...detail, status: event.status };
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}

/** Write a validated realtime event into the session's cache entry. */
export function reconcile(queryClient: QueryClient, event: RealtimeEvent): void {
  queryClient.setQueryData<SessionDetail>(queryKeys.session(event.sessionId), (previous) =>
    applyEvent(previous ?? seedDetail(event.sessionId), event),
  );
}
