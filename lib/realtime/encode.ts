import type { RealtimeEvent } from "@/features/sessions/realtime";

// SSE wire encoding for the BFF proxy. The inverse of sse.ts#parseFrame, so what the
// server writes is exactly what the client reader validates.
export function toSseFrame(event: RealtimeEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`;
}
