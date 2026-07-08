import type { RealtimeEvent } from "@/features/sessions/realtime";

// Mock agent producer for the Phase 1 exit demo. Stands in for the agent engine:
// emits a short token stream, ends the message, then settles the session to review.
// Published onto the backplane so frames fan out to every subscriber.
export function mockTokenStream(
  sessionId: string,
  messageId = "m1",
  agent = "Builder",
): RealtimeEvent[] {
  const chunks = ["Analyzing", " the", " auth", " module", " — proposing", " a diff", "."];
  const frames: RealtimeEvent[] = chunks.map((text) => ({
    type: "token",
    sessionId,
    messageId,
    agent,
    text,
  }));
  frames.push({ type: "message_end", sessionId, messageId });
  frames.push({ type: "step", sessionId, steps: { completed: 4, total: 4 } });
  frames.push({ type: "status", sessionId, status: "review" });
  return frames;
}

/** Delay between mock frames so tokens arrive as a visible stream, not one burst. */
export const MOCK_FRAME_INTERVAL_MS = 40;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The mock stream, paced: yields the first frame immediately (so the stream opens with
 * no lag) then spaces the rest by MOCK_FRAME_INTERVAL_MS. The route publishes each
 * yielded frame onto the backplane as real agent output would arrive over time.
 */
export async function* streamMockTokens(
  sessionId: string,
  intervalMs = MOCK_FRAME_INTERVAL_MS,
): AsyncGenerator<RealtimeEvent> {
  const frames = mockTokenStream(sessionId);
  for (let i = 0; i < frames.length; i++) {
    if (i > 0) await wait(intervalMs);
    yield frames[i] as RealtimeEvent;
  }
}
