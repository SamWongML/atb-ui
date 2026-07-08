"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useRef } from "react";
import type { ControlAction } from "@/features/sessions/realtime";
import { reconcile } from "@/lib/realtime/reconcile";
import { type ControlSocket, openControlSocket, sendControl } from "@/lib/realtime/ws";

// Own the control WebSocket's lifecycle for a session so components never touch a
// socket (CLAUDE.md §"Data & realtime" — components render the cache). Mirrors
// useSessionStream: opens the socket on mount, routes inbound echoes through
// reconcile(), and returns a steer() that sends a command — the optimistic update and
// the authoritative echo both flow through the same reconcile() sink.
export function useControlSocket(sessionId: string): (action: ControlAction) => void {
  const queryClient = useQueryClient();
  const socketRef = useRef<ControlSocket | null>(null);

  useEffect(() => {
    const socket = openControlSocket({
      sessionId,
      onEvent: (event) => reconcile(queryClient, event),
    });
    socketRef.current = socket;
    return () => {
      socket.close();
      socketRef.current = null;
    };
  }, [sessionId, queryClient]);

  return useCallback(
    (action: ControlAction) => {
      if (!socketRef.current) return;
      sendControl(socketRef.current, queryClient, { type: "control", sessionId, action });
    },
    [sessionId, queryClient],
  );
}
