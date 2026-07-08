"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import type { ControlAction } from "@/features/sessions/realtime";
import { reconcile } from "@/lib/realtime/reconcile";
import { type ControlSocket, openControlSocket, sendControl } from "@/lib/realtime/ws";
import { useSessionStream } from "../hooks/use-session-stream";
import { SessionTranscript } from "./session-transcript";

// The live session surface (Phase 1 exit demo). Streams tokens via useSessionStream
// and steers via the control socket — approve/interrupt update the cache optimistically
// and reconcile to the authoritative echo through the same sink.
export function SessionView({ sessionId }: { sessionId: string }) {
  const queryClient = useQueryClient();
  const { data } = useSessionStream(sessionId);
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

  function steer(action: ControlAction) {
    if (!socketRef.current) return;
    sendControl(socketRef.current, queryClient, { type: "control", sessionId, action });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <SessionTranscript detail={data} />
      <div className="flex gap-2.5 border-t border-hair pt-4">
        <Button variant="soft" onClick={() => steer("approve")}>
          Approve
        </Button>
        <Button variant="outline" onClick={() => steer("interrupt")}>
          Interrupt
        </Button>
      </div>
    </div>
  );
}
