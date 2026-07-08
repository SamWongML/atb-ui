import { serializeSessionCookie } from "@/server/auth/service";

// BFF sign-out: expire the session cookie.
export async function POST(): Promise<Response> {
  const response = Response.json({ ok: true });
  response.headers.set("set-cookie", serializeSessionCookie("", 0));
  return response;
}
