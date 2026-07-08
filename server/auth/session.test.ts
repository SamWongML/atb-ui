import { describe, expect, it } from "vitest";
import { createSessionToken, type Session, verifySessionToken } from "./session";

// Seam: the signed-token contract. A session cookie is only trusted if its HMAC
// verifies and it hasn't expired — a forged or stale token must resolve to null,
// never a silently-accepted session (ARCHITECTURE.md §Security).

const secret = "test-secret-value-please-change";
const session: Session = {
  user: { id: "u_1", name: "You", email: "you@atb.dev" },
  exp: 2000,
};

describe("session token", () => {
  it("round-trips a signed session before expiry", async () => {
    const token = await createSessionToken(session, secret);
    const verified = await verifySessionToken(token, secret, 1000);
    expect(verified?.user.email).toBe("you@atb.dev");
  });

  it("rejects a token signed with a different secret", async () => {
    const token = await createSessionToken(session, secret);
    expect(await verifySessionToken(token, "other-secret", 1000)).toBeNull();
  });

  it("rejects a tampered payload", async () => {
    const token = await createSessionToken(session, secret);
    const [payload, sig] = token.split(".");
    expect(await verifySessionToken(`${payload}AA.${sig}`, secret, 1000)).toBeNull();
  });

  it("rejects an expired session", async () => {
    const token = await createSessionToken(session, secret);
    expect(await verifySessionToken(token, secret, 3000)).toBeNull();
  });

  it("rejects a malformed token", async () => {
    expect(await verifySessionToken("not-a-token", secret, 1000)).toBeNull();
  });
});
