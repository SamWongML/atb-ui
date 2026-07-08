import { beforeEach, describe, expect, it } from "vitest";
import { authSecret } from "@/server/auth/service";
import { createSessionToken } from "@/server/auth/session";
import { GET as sessionGET } from "./session/route";
import { POST as signInPOST } from "./sign-in/route";
import { POST as signOutPOST } from "./sign-out/route";

// Seam: the BFF auth route handlers, invoked as (Request) => Response. Assert status
// codes and the Set-Cookie contract (httpOnly), not internals.

beforeEach(() => {
  process.env.AUTH_DEV_PASSWORD = "atb";
});

function signInRequest(body: unknown): Request {
  return new Request("http://localhost/api/auth/sign-in", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/auth/sign-in", () => {
  it("sets an httpOnly session cookie for valid credentials", async () => {
    const res = await signInPOST(signInRequest({ email: "you@atb.dev", password: "atb" }));
    expect(res.status).toBe(200);
    const cookie = res.headers.get("set-cookie") ?? "";
    expect(cookie).toMatch(/atb_session=/);
    expect(cookie).toMatch(/HttpOnly/i);
  });

  it("rejects wrong credentials with 401 and no cookie", async () => {
    const res = await signInPOST(signInRequest({ email: "you@atb.dev", password: "nope" }));
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
  });
});

describe("POST /api/auth/sign-out", () => {
  it("clears the session cookie", async () => {
    const res = await signOutPOST();
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie") ?? "").toMatch(/atb_session=;?.*Max-Age=0/i);
  });
});

describe("GET /api/auth/session", () => {
  it("returns 401 when unauthenticated", async () => {
    const res = await sessionGET(new Request("http://localhost/api/auth/session"));
    expect(res.status).toBe(401);
  });

  it("returns the current user when authenticated", async () => {
    const token = await createSessionToken(
      { user: { id: "u_1", name: "You", email: "you@atb.dev" }, exp: 9_999_999_999 },
      authSecret(),
    );
    const res = await sessionGET(
      new Request("http://localhost/api/auth/session", {
        headers: { cookie: `atb_session=${token}` },
      }),
    );
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ user: { id: "u_1", name: "You", email: "you@atb.dev" } });
  });
});
