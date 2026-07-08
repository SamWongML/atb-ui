import type { QueryClient } from "@tanstack/react-query";
import { WebSocket as ReconnectingWebSocket } from "partysocket";
import { CONTROL_STATUS, type ControlCommand } from "@/features/sessions/realtime";
import { reconcile } from "./reconcile";
import { handleSseMessage, type SseHandlers } from "./sse";

// WS control client (ARCHITECTURE.md §"Return path"). WebSockets carry genuine
// bidirectional traffic (approve/interrupt); partysocket handles reconnect/backoff/
// heartbeat. Outbound commands update the cache optimistically, then the authoritative
// echo returns through the SAME reconcile() sink — control and streams never diverge.

/** The minimal outbound surface, so sendControl is testable without a real socket. */
export type ControlTransport = { send: (data: string) => void };

export function serializeControlCommand(command: ControlCommand): string {
  return JSON.stringify(command);
}

/**
 * Optimistically reflect a control action in the cache (via reconcile, as if the echo
 * had arrived) and send it over the transport. The authoritative echo later corrects
 * the guess through the same sink.
 */
export function sendControl(
  transport: ControlTransport,
  queryClient: QueryClient,
  command: ControlCommand,
): void {
  reconcile(queryClient, {
    type: "control",
    sessionId: command.sessionId,
    action: command.action,
    status: CONTROL_STATUS[command.action],
  });
  transport.send(serializeControlCommand(command));
}

export type ControlSocket = ControlTransport & { close: () => void };

/**
 * Open the reconnecting control WebSocket for a session. Inbound frames flow through
 * the shared reconcile dispatch; the returned handle sends commands and closes.
 */
export function openControlSocket(
  options: SseHandlers & { sessionId: string; host?: string },
): ControlSocket {
  const host = options.host ?? (typeof window !== "undefined" ? window.location.host : "");
  const socket = new ReconnectingWebSocket(
    `${location.protocol === "https:" ? "wss" : "ws"}://${host}/api/ws?sessionId=${encodeURIComponent(options.sessionId)}`,
  );

  socket.addEventListener("message", (event: MessageEvent) => {
    if (typeof event.data === "string") {
      handleSseMessage(event.data, { onEvent: options.onEvent, onError: options.onError });
    }
  });
  socket.addEventListener("error", () => options.onError?.(new Error("control socket error")));

  return {
    send: (data) => socket.send(data),
    close: () => socket.close(),
  };
}

export { reconcile };
