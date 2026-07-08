import { z } from "zod";
import { planStepSchema, runLogLineSchema, sessionCanvasSchema, traceSpanSchema } from "./canvas";
import { type SessionStatus, sessionStatusSchema, sessionStepsSchema } from "./schema";

// Realtime frame contracts (ARCHITECTURE.md §Real-time). One schema per frame,
// shared by the client SSE/WS readers and the BFF proxy — validated at every process
// boundary so a malformed frame is a caught error, not a silent `undefined`.

/** A single transcript entry; `text` accumulates as tokens stream in. */
export const sessionMessageSchema = z.object({
  id: z.string(),
  agent: z.string(),
  text: z.string(),
  /** Still streaming — the UI shows a live cursor while true. */
  pending: z.boolean(),
});
export type SessionMessage = z.infer<typeof sessionMessageSchema>;

/** The cache shape reconcile() maintains for one session (the live-updating view). */
export const sessionDetailSchema = z.object({
  id: z.string(),
  title: z.string(),
  status: sessionStatusSchema,
  steps: sessionStepsSchema,
  transcript: z.array(sessionMessageSchema),
  updatedAt: z.string(),
});
export type SessionDetail = z.infer<typeof sessionDetailSchema>;

// --- Stream frames (SSE one-way + WS control echo) ---

export const CONTROL_ACTIONS = ["approve", "interrupt"] as const;
export const controlActionSchema = z.enum(CONTROL_ACTIONS);
export type ControlAction = z.infer<typeof controlActionSchema>;

/**
 * The lifecycle status each control action drives. One rule, shared by both sides of
 * the round-trip: the client applies it as its optimistic guess (lib/realtime/ws.ts)
 * and the BFF applies it as the authoritative outcome (server/realtime/gateway.ts),
 * so the two can never diverge.
 */
export const CONTROL_STATUS: Record<ControlAction, SessionStatus> = {
  approve: "active",
  interrupt: "needs_you",
};

/** Agent output token(s) to append to a (possibly new) transcript message. */
export const tokenEventSchema = z.object({
  type: z.literal("token"),
  sessionId: z.string(),
  messageId: z.string(),
  agent: z.string(),
  text: z.string(),
});

/** A streaming message finished — drop its live cursor. */
export const messageEndEventSchema = z.object({
  type: z.literal("message_end"),
  sessionId: z.string(),
  messageId: z.string(),
});

/** Session lifecycle status changed. */
export const statusEventSchema = z.object({
  type: z.literal("status"),
  sessionId: z.string(),
  status: sessionStatusSchema,
});

/** Step progress advanced. */
export const stepEventSchema = z.object({
  type: z.literal("step"),
  sessionId: z.string(),
  steps: sessionStepsSchema,
});

/** WS return path: the authoritative echo of a control action (approve/interrupt). */
export const controlEventSchema = z.object({
  type: z.literal("control"),
  sessionId: z.string(),
  action: controlActionSchema,
  status: sessionStatusSchema,
});

// --- Canvas frames (the Plan/Run/Diff/Trace views, fed through the same sink) ---

/** A full canvas snapshot — seeds the canvas cache entry at stream start. */
export const canvasEventSchema = z.object({
  type: z.literal("canvas"),
  sessionId: z.string(),
  canvas: sessionCanvasSchema,
});

/** The plan advanced — replaces the plan (step states move pending → active → done). */
export const planEventSchema = z.object({
  type: z.literal("plan"),
  sessionId: z.string(),
  plan: z.array(planStepSchema),
});

/** One new run-log line to append (the agent's terminal grows). */
export const runLogEventSchema = z.object({
  type: z.literal("run_log"),
  sessionId: z.string(),
  line: runLogLineSchema,
});

/** One new trace span to append. */
export const traceEventSchema = z.object({
  type: z.literal("trace"),
  sessionId: z.string(),
  span: traceSpanSchema,
});

/** The canvas-family frames — routed to the session's canvas cache entry, not its detail. */
export const CANVAS_EVENT_TYPES = ["canvas", "plan", "run_log", "trace"] as const;

export const realtimeEventSchema = z.discriminatedUnion("type", [
  tokenEventSchema,
  messageEndEventSchema,
  statusEventSchema,
  stepEventSchema,
  controlEventSchema,
  canvasEventSchema,
  planEventSchema,
  runLogEventSchema,
  traceEventSchema,
]);
export type RealtimeEvent = z.infer<typeof realtimeEventSchema>;

/** A canvas-family frame (narrowed by the discriminant). */
export type CanvasEvent = Extract<RealtimeEvent, { type: (typeof CANVAS_EVENT_TYPES)[number] }>;

// --- WS outbound (client → BFF control message) ---

/** A steering command the user sends over the WebSocket. */
export const controlCommandSchema = z.object({
  type: z.literal("control"),
  sessionId: z.string(),
  action: controlActionSchema,
});
export type ControlCommand = z.infer<typeof controlCommandSchema>;
