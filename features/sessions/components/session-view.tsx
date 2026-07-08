"use client";

import { Button } from "@/components/ui/button";
import { useControlSocket } from "../hooks/use-control-socket";
import { useSessionStream } from "../hooks/use-session-stream";
import { SessionTranscript } from "./session-transcript";

// The live session surface (Phase 1 exit demo). Streams tokens via useSessionStream
// and steers via useControlSocket — approve/interrupt update the cache optimistically
// and reconcile to the authoritative echo through the same sink. The component only
// reads the cache and calls steer(); it never touches a socket.
export function SessionView({ sessionId }: { sessionId: string }) {
  const { data } = useSessionStream(sessionId);
  const steer = useControlSocket(sessionId);

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
