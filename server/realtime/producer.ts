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
