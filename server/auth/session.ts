// Signed session tokens for the BFF (ARCHITECTURE.md §Security — httpOnly session
// cookies, secrets only at the BFF). Built on Web Crypto (HMAC-SHA256) so the same
// verification runs in the Edge middleware and in Node route handlers. A real IdP
// (Auth.js / WorkOS) can later mint the SessionUser behind this same seam.

export type SessionUser = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
};

export type Session = {
  readonly user: SessionUser;
  /** Absolute expiry, unix seconds. */
  readonly exp: number;
};

export const SESSION_COOKIE = "atb_session";

const encoder = new TextEncoder();

function base64UrlEncode(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64UrlDecode(value: string): Uint8Array {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sign(payload: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

/** Constant-time string compare so signature checks don't leak timing. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function isSession(value: unknown): value is Session {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Record<string, unknown>;
  const user = candidate.user as Record<string, unknown> | undefined;
  return (
    typeof candidate.exp === "number" &&
    typeof user === "object" &&
    user !== null &&
    typeof user.id === "string" &&
    typeof user.name === "string" &&
    typeof user.email === "string"
  );
}

/** `<base64url(payload)>.<base64url(hmac)>`. */
export async function createSessionToken(session: Session, secret: string): Promise<string> {
  const payload = base64UrlEncode(encoder.encode(JSON.stringify(session)));
  const signature = await sign(payload, secret);
  return `${payload}.${signature}`;
}

/** Verify signature + expiry; returns the Session or null if either fails. */
export async function verifySessionToken(
  token: string,
  secret: string,
  nowSeconds: number,
): Promise<Session | null> {
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payload, signature] = parts;
  if (!payload || !signature) return null;

  const expected = await sign(payload, secret);
  if (!timingSafeEqual(signature, expected)) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
  } catch {
    return null;
  }
  if (!isSession(parsed) || parsed.exp <= nowSeconds) return null;
  return parsed;
}
