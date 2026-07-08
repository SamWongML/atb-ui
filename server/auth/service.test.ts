import { beforeEach, describe, expect, it } from "vitest";
import { authGate, authSecret, getSessionFromRequest, verifyCredentials } from "./service";
import { createSessionToken } from "./session";

// Seams: the request→session boundary, dev credential check, and the route-gate
// decision (used by middleware). Tested as plain functions, no Next runtime needed.

beforeEach(() => {
  process.env.AUTH_DEV_PASSWORD = "atb";
});

async function requestWithSession(): Promise<Request> {
  const token = await createSessionToken(
    { user: { id: "u_1", name: "You", email: "you@atb.dev" }, exp: 9_999_999_999 },
    authSecret(),
  );
  return new Request("http://localhost/sessions", { headers: { cookie: `atb_session=${token}` } });
}

describe("getSessionFromRequest", () => {
  it("resolves the user from a valid session cookie", async () => {
    const session = await getSessionFromRequest(await requestWithSession());
    expect(session?.user.email).toBe("you@atb.dev");
  });

  it("returns null when the cookie is absent", async () => {
    const session = await getSessionFromRequest(new Request("http://localhost/sessions"));
    expect(session).toBeNull();
  });

  it("returns null for a garbage cookie", async () => {
    const session = await getSessionFromRequest(
      new Request("http://localhost/sessions", { headers: { cookie: "atb_session=tampered" } }),
    );
    expect(session).toBeNull();
  });
});

describe("verifyCredentials", () => {
  it("accepts the dev credential and returns a user", () => {
    expect(verifyCredentials("you@atb.dev", "atb")?.email).toBe("you@atb.dev");
  });

  it("rejects a wrong password", () => {
    expect(verifyCredentials("you@atb.dev", "wrong")).toBeNull();
  });

  it("rejects a blank email", () => {
    expect(verifyCredentials("", "atb")).toBeNull();
  });
});

describe("authGate", () => {
  it("sends an unauthenticated visitor from an app route to sign-in", () => {
    expect(authGate("/sessions", false)).toBe("/sign-in");
  });

  it("lets an unauthenticated visitor reach the sign-in page", () => {
    expect(authGate("/sign-in", false)).toBeNull();
  });

  it("bounces an authenticated visitor off the sign-in page", () => {
    expect(authGate("/sign-in", true)).toBe("/overview");
  });

  it("lets an authenticated visitor through an app route", () => {
    expect(authGate("/sessions", true)).toBeNull();
  });

  it("never redirects the auth API (it guards itself)", () => {
    expect(authGate("/api/auth/session", false)).toBeNull();
  });
});
