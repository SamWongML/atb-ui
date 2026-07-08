import type { Route } from "next";
import type { BreadcrumbEntity } from "@/components/breadcrumb-nav";
import type { Session } from "./schema";

// Derives the header breadcrumb's entity switcher for a session-detail route. Pure so
// the shell can wire it from the pathname + the sessions list (README.md §App Shell).

const SESSION_DETAIL = /^\/sessions\/([^/]+)\/?$/;

/**
 * The breadcrumb entity for a `/sessions/:id` route: the open session as the current
 * crumb, its peers as the sibling switcher. Returns undefined off the detail route so
 * the breadcrumb falls back to a plain section crumb.
 */
export function sessionBreadcrumbEntity(
  pathname: string,
  sessions: readonly Session[],
): BreadcrumbEntity | undefined {
  const currentId = pathname.match(SESSION_DETAIL)?.[1];
  if (!currentId) return undefined;

  const current = sessions.find((session) => session.id === currentId);
  return {
    label: current?.title ?? currentId,
    currentId,
    siblings: sessions.map((session) => ({
      id: session.id,
      label: session.title,
      href: `/sessions/${session.id}` as Route,
      sub: session.status,
    })),
  };
}
