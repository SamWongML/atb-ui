import { toSseFrame } from "@/lib/realtime/encode";
import { getSessionFromRequest } from "@/server/auth/service";
import { mockTokenStream } from "@/server/realtime/producer";
import { getBackplane } from "@/server/redis";

// SSE token proxy (ARCHITECTURE.md §Real-time step 2). Auth at the BFF, then a
// long-lived text/event-stream. The route subscribes to the session's backplane
// channel and streams every event out; a mock producer publishes frames so they fan
// out through the backplane exactly as real agent output would.
export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
): Promise<Response> {
  const session = await getSessionFromRequest(request);
  if (!session) return new Response("Unauthorized", { status: 401 });

  const { sessionId } = await params;
  const backplane = getBackplane();
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const unsubscribe = await backplane.subscribe(sessionId, (event) => {
        controller.enqueue(encoder.encode(toSseFrame(event)));
      });
      request.signal.addEventListener("abort", () => {
        void unsubscribe();
        try {
          controller.close();
        } catch {
          // already closed
        }
      });
      // Mock agent: publish the session's frames onto the backplane (fans out to all tasks).
      for (const frame of mockTokenStream(sessionId)) {
        await backplane.publish(sessionId, frame);
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/event-stream",
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
    },
  });
}
