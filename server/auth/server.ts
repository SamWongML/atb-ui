import { cookies } from "next/headers";
import { authSecret, SESSION_TTL_SECONDS } from "./service";
import { SESSION_COOKIE, type Session, verifySessionToken } from "./session";

// Server-component adapter for the session (reads next/headers cookies). Kept apart
// from service.ts so unit tests can import the pure logic without the Next runtime.
export async function getServerSession(): Promise<Session | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token, authSecret(), Math.floor(Date.now() / 1000));
}

export { SESSION_TTL_SECONDS };
