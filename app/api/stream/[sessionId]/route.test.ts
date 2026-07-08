import { describe, expect, it } from "vitest";
import { authSecret } from "@/server/auth/service";
import { createSessionToken } from "@/server/auth/session";
import { POST } from "./route";

// Seam: the SSE proxy route. Auth-gated, and streams `text/event-stream` token frames
// (the Phase 1 exit demo). We assert the guard and that real SSE frames flow — the
// client reader + reconcile are tested separately.

const params = (sessionId: string) => ({ params: Promise.resolve({ sessionId }) });

async function authedRequest(sessionId: string): Promise<Request> {
  const token = await createSessionToken(
    { user: { id: "u_1", name: "You", email: "you@atb.dev" }, exp: 9_999_999_999 },
    authSecret(),
  );
  return new Request(`http://localhost/api/stream/${sessionId}`, {
    method: "POST",
    headers: { cookie: `atb_session=${token}` },
  });
}

describe("POST /api/stream/[sessionId]", () => {
  it("rejects an unauthenticated request", async () => {
    const res = await POST(
      new Request("http://localhost/api/stream/sess_01", { method: "POST" }),
      params("sess_01"),
    );
    expect(res.status).toBe(401);
  });

  it("streams SSE token frames to an authenticated client", async () => {
    const res = await POST(await authedRequest("sess_stream"), params("sess_stream"));
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/event-stream");

    if (!res.body) throw new Error("expected a stream body");
    const reader = res.body.getReader();
    try {
      const { value } = await reader.read();
      const text = new TextDecoder().decode(value);
      expect(text).toContain("data:");
      expect(text).toContain("token");
    } finally {
      await reader.cancel();
    }
  });
});
