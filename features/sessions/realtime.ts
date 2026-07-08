import { z } from "zod";
import { sessionStatusSchema, sessionStepsSchema } from "./schema";

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

export const realtimeEventSchema = z.discriminatedUnion("type", [
  tokenEventSchema,
  messageEndEventSchema,
  statusEventSchema,
  stepEventSchema,
  controlEventSchema,
]);
export type RealtimeEvent = z.infer<typeof realtimeEventSchema>;

// --- WS outbound (client → BFF control message) ---

/** A steering command the user sends over the WebSocket. */
export const controlCommandSchema = z.object({
  type: z.literal("control"),
  sessionId: z.string(),
  action: controlActionSchema,
});
export type ControlCommand = z.infer<typeof controlCommandSchema>;
