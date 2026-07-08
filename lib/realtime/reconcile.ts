import type { QueryClient } from "@tanstack/react-query";
import type { SessionCanvas } from "@/features/sessions/canvas";
import {
  CANVAS_EVENT_TYPES,
  type CanvasEvent,
  type RealtimeEvent,
  type SessionDetail,
  type SessionMessage,
} from "@/features/sessions/realtime";
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

/** The non-canvas frames — those that settle a session's transcript/detail entry. */
type DetailEvent = Exclude<RealtimeEvent, CanvasEvent>;

/** Fold one event into the current detail, returning a new detail (immutable). */
function applyEvent(detail: SessionDetail, event: DetailEvent): SessionDetail {
  switch (event.type) {
    case "token":
      return {
        ...detail,
        transcript: appendToken(detail.transcript, event.messageId, event.agent, event.text),
      };
    case "message_end":
      return { ...detail, transcript: endMessage(detail.transcript, event.messageId) };
    // A status change and a control echo both settle the session's lifecycle status.
    case "status":
    case "control":
      return { ...detail, status: event.status };
    case "step":
      return { ...detail, steps: event.steps };
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}

/** An empty canvas to merge into before the snapshot (if any) has seeded the cache. */
function seedCanvas(sessionId: string): SessionCanvas {
  return { sessionId, plan: [], run: [], diff: "", trace: [] };
}

const CANVAS_TYPES = new Set<string>(CANVAS_EVENT_TYPES);

function isCanvasEvent(event: RealtimeEvent): event is CanvasEvent {
  return CANVAS_TYPES.has(event.type);
}

/** Fold one canvas frame into the current canvas, returning a new canvas (immutable). */
function applyCanvasEvent(canvas: SessionCanvas, event: CanvasEvent): SessionCanvas {
  switch (event.type) {
    case "canvas":
      return event.canvas;
    case "plan":
      return { ...canvas, plan: event.plan };
    case "run_log":
      return { ...canvas, run: [...canvas.run, event.line] };
    case "trace":
      return { ...canvas, trace: [...canvas.trace, event.span] };
    default: {
      const _exhaustive: never = event;
      return _exhaustive;
    }
  }
}

/**
 * Write a validated realtime event into the session's cache. Canvas-family frames land
 * in the canvas entry; everything else in the transcript/detail entry — two live targets,
 * one sink, so no component ever learns a socket exists.
 */
export function reconcile(queryClient: QueryClient, event: RealtimeEvent): void {
  if (isCanvasEvent(event)) {
    queryClient.setQueryData<SessionCanvas>(queryKeys.sessionCanvas(event.sessionId), (previous) =>
      applyCanvasEvent(previous ?? seedCanvas(event.sessionId), event),
    );
    return;
  }
  queryClient.setQueryData<SessionDetail>(queryKeys.session(event.sessionId), (previous) =>
    applyEvent(previous ?? seedDetail(event.sessionId), event),
  );
}
