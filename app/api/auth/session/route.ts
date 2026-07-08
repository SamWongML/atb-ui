import { getSessionFromRequest } from "@/server/auth/service";

// Who am I — the client reads this to hydrate the account block.
export async function GET(request: Request): Promise<Response> {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return Response.json({ user: null }, { status: 401 });
  }
  return Response.json({ user: session.user });
}
