import { describe, expect, it } from "vitest";
import type { RealtimeEvent } from "@/features/sessions/realtime";
import { toSseFrame } from "./encode";
import { parseFrame } from "./sse";

// Seam: the SSE wire encoding. What the BFF writes must be exactly what the client
// reader parses back — encode/decode are inverses.
describe("toSseFrame", () => {
  it("frames an event as an SSE `data:` block the reader parses back", () => {
    const event: RealtimeEvent = { type: "status", sessionId: "sess_01", status: "review" };
    const frame = toSseFrame(event);

    expect(frame.startsWith("data: ")).toBe(true);
    expect(frame.endsWith("\n\n")).toBe(true);
    expect(parseFrame(frame.slice("data: ".length).trim())).toEqual(event);
  });
});
