import {
  CONTROL_STATUS,
  type ControlCommand,
  controlCommandSchema,
  type RealtimeEvent,
} from "@/features/sessions/realtime";
import type { SessionBackplane } from "./backplane";

// WS gateway (ARCHITECTURE.md §"Return path"). Receives steering commands, computes
// the engine's authoritative result, and publishes the echo onto the backplane so it
// reaches every task's subscribers — the same reconcile() sink then confirms the
// client's optimistic update.

/** The mock engine's authoritative outcome for a control action. */
export function applyControl(command: ControlCommand): RealtimeEvent {
  return {
    type: "control",
    sessionId: command.sessionId,
    action: command.action,
    status: CONTROL_STATUS[command.action],
  };
}

/** Validate an inbound WS control message and fan its authoritative echo out. */
export async function handleControlMessage(
  raw: string,
  backplane: SessionBackplane,
): Promise<void> {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return;
  }
  const result = controlCommandSchema.safeParse(parsed);
  if (!result.success) return;
  await backplane.publish(result.data.sessionId, applyControl(result.data));
}
