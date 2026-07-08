import {
  issueSessionToken,
  SESSION_TTL_SECONDS,
  serializeSessionCookie,
  verifyCredentials,
} from "@/server/auth/service";

// BFF sign-in: validate credentials, then set the httpOnly session cookie.
export async function POST(request: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const { email, password } = (body ?? {}) as { email?: unknown; password?: unknown };
  if (typeof email !== "string" || typeof password !== "string") {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  const user = verifyCredentials(email, password);
  if (!user) {
    return Response.json({ error: "invalid_credentials" }, { status: 401 });
  }

  const token = await issueSessionToken(user);
  const response = Response.json({ user });
  response.headers.set("set-cookie", serializeSessionCookie(token, SESSION_TTL_SECONDS));
  return response;
}
