import { type NextRequest, NextResponse } from "next/server";
import { authGate, getSessionFromRequest } from "@/server/auth/service";

// BFF auth gate. Runs on the Edge before every page request; verifies the session
// cookie (Web Crypto, Edge-safe) and redirects per authGate. The auth API and Next
// internals are excluded by the matcher and guard themselves.
export async function middleware(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  const redirectTo = authGate(request.nextUrl.pathname, session !== null);
  if (redirectTo) {
    return NextResponse.redirect(new URL(redirectTo, request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.\\w+$).*)"],
};
