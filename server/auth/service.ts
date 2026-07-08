import {
  createSessionToken,
  SESSION_COOKIE,
  type Session,
  type SessionUser,
  verifySessionToken,
} from "./session";

// BFF auth service: reads/writes the session cookie, checks credentials, and decides
// route access. Secrets live only here (ARCHITECTURE.md §Security).

export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

/** HMAC secret for session tokens. A dev fallback keeps local runs working; prod sets it. */
export function authSecret(): string {
  return process.env.AUTH_SECRET ?? "atb-dev-secret-change-me";
}

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const index = part.indexOf("=");
    if (index === -1) continue;
    const name = part.slice(0, index).trim();
    if (name) out[name] = part.slice(index + 1).trim();
  }
  return out;
}

/** The verified session for a request, or null if the cookie is missing/invalid/expired. */
export async function getSessionFromRequest(request: Request): Promise<Session | null> {
  const token = parseCookies(request.headers.get("cookie"))[SESSION_COOKIE];
  if (!token) return null;
  return verifySessionToken(token, authSecret(), nowSeconds());
}

/**
 * Phase 1 credential check: a shared dev password gates any email (no user store
 * yet). The seam is stable — a real IdP replaces the body, not the signature.
 */
export function verifyCredentials(email: string, password: string): SessionUser | null {
  const devPassword = process.env.AUTH_DEV_PASSWORD ?? "atb";
  const normalized = email.trim();
  if (!normalized || password !== devPassword) return null;
  const name = normalized.split("@")[0] || "You";
  return { id: `u_${name}`, name, email: normalized };
}

/** Mint a session token for a signed-in user. */
export function issueSessionToken(user: SessionUser): Promise<string> {
  return createSessionToken({ user, exp: nowSeconds() + SESSION_TTL_SECONDS }, authSecret());
}

/** Serialize the session Set-Cookie value; maxAge 0 clears it. */
export function serializeSessionCookie(value: string, maxAgeSeconds: number): string {
  const attributes = [
    `${SESSION_COOKIE}=${value}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`,
  ];
  if (process.env.NODE_ENV === "production") attributes.push("Secure");
  return attributes.join("; ");
}

/**
 * Where a request should be redirected, or null to let it through. Unauthenticated
 * visitors are sent to sign-in (except the sign-in page and the self-guarding auth
 * API); authenticated visitors are bounced off the sign-in page.
 */
export function authGate(pathname: string, isAuthed: boolean): string | null {
  const isSignIn = pathname === "/sign-in" || pathname.startsWith("/sign-in/");
  if (isAuthed) return isSignIn ? "/overview" : null;
  if (isSignIn || pathname.startsWith("/api/")) return null;
  return "/sign-in";
}
