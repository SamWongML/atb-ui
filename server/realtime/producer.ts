import type { PlanStep } from "@/features/sessions/canvas";
import type { RealtimeEvent } from "@/features/sessions/realtime";
import { getSessionCanvas } from "@/server/services/sessions";

// Mock agent producer for the exit demo. Stands in for the agent engine: emits a short
// token stream for the transcript plus canvas frames (run log, plan advance, trace) so
// both live surfaces update. Published onto the backplane so frames fan out to every
// subscriber.
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

/** Advance a plan by one step: the active step settles to done, the next starts. */
function advancePlan(plan: PlanStep[]): PlanStep[] {
  const activeIndex = plan.findIndex((step) => step.state === "active");
  if (activeIndex === -1) return plan;
  return plan.map((step, index) => {
    if (index === activeIndex) return { ...step, state: "done" };
    if (index === activeIndex + 1 && step.state === "pending") return { ...step, state: "active" };
    return step;
  });
}

/**
 * Canvas frames for the mock run: incremental updates layered on top of the snapshot the
 * detail page seeds from the BFF. The run log grows, the plan advances a step, and a trace
 * span lands — so the canvas is watchable, not a static picture. Unknown sessions (no seed
 * canvas) emit nothing.
 */
export function mockCanvasFrames(sessionId: string): RealtimeEvent[] {
  const base = getSessionCanvas(sessionId);
  if (!base) return [];
  return [
    {
      type: "run_log",
      sessionId,
      line: {
        id: `${sessionId}-rl1`,
        at: "2026-07-07T10:11:00.000Z",
        level: "info",
        text: "$ applying diff",
      },
    },
    {
      type: "trace",
      sessionId,
      span: { id: `${sessionId}-sp1`, name: "apply diff", durationMs: 96, status: "ok" },
    },
    { type: "plan", sessionId, plan: advancePlan(base.plan) },
    {
      type: "run_log",
      sessionId,
      line: {
        id: `${sessionId}-rl2`,
        at: "2026-07-07T10:11:02.000Z",
        level: "info",
        text: "diff applied",
      },
    },
  ];
}

/** The full mock session: transcript frames, then the canvas frames. */
export function mockSessionFrames(sessionId: string): RealtimeEvent[] {
  return [...mockTokenStream(sessionId), ...mockCanvasFrames(sessionId)];
}

/** Delay between mock frames so tokens arrive as a visible stream, not one burst. */
export const MOCK_FRAME_INTERVAL_MS = 40;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The mock stream, paced: yields the first frame immediately (so the stream opens with
 * no lag) then spaces the rest by MOCK_FRAME_INTERVAL_MS. The route publishes each
 * yielded frame onto the backplane as real agent output would arrive over time.
 */
export async function* streamMockSession(
  sessionId: string,
  intervalMs = MOCK_FRAME_INTERVAL_MS,
): AsyncGenerator<RealtimeEvent> {
  const frames = mockSessionFrames(sessionId);
  for (let i = 0; i < frames.length; i++) {
    if (i > 0) await wait(intervalMs);
    yield frames[i] as RealtimeEvent;
  }
}
