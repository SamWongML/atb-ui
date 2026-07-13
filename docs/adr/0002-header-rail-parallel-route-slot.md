# ADR 0002 — Server-render the list rail via a `@header` parallel-route slot

Status: accepted · 2026-07-12 · amends ADR 0001 (Decision #1) · refined 2026-07-13 (in-shell 404, Cache Components migration note)

## Context

ADR 0001 made the shell header a **client portal**: list screens rendered
`<PageHeader><ListRail/></PageHeader>` and the rail was `createPortal`ed into the shell's
header region after hydration; other routes fell back to the route breadcrumb. ADR 0001
explicitly accepted the consequence that **a hard refresh of a list page paints the
breadcrumb fallback for one frame before the rail mounts** ("Flash A").

A portal can never appear in server HTML, so the fallback paint is unavoidable while the
rail is injected client-side. The prior change (Flash B) moved the toolbar preferences from
localStorage into an SSR-readable **cookie** seeded through a layout-level
`ListPrefsProvider`, which means a *server-rendered* rail can now show the correct
sort/filter on the first paint. That unlocks the proper fix for Flash A.

## Research (best-practice basis)

- **Parallel routes are the App Router mechanism for a shared layout whose slot content is
  route-specific and server-rendered** — exactly "render one or more pages in the same
  layout." A layout cannot read a child's data, so this is the idiomatic way to put
  per-route server data (the item count) into the persistent header region.
  ([Next.js parallel routes](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes))
- **The "breadcrumb via parallel routes" pattern is canonical** — a `@slot` with a
  `default.tsx` plus a `[...catchAll]` is the documented shape for a header/breadcrumb that
  varies by route. ([openstatus](https://www.openstatus.dev/blog/dynamic-breadcrumb-nextjs),
  Next PR [#65063](https://github.com/vercel/next.js/pull/65063))
- **Soft vs hard navigation differ.** On a hard load, an unmatched slot renders
  `default.js`; on a *soft* (client) navigation, an unmatched slot **keeps its previously
  active content**. So a `default.tsx`-only slot would leave the last rail stuck in the
  header when navigating from a list route to a non-list route. A `[...catchAll]` slot is a
  real match for those routes and resolves the slot instead. Next 16 also makes `default.js`
  **mandatory** for every slot (build fails without it).
  ([soft/hard nav](https://nextjs.org/docs/app/api-reference/file-conventions/parallel-routes),
  [v16 upgrade](https://nextjs.org/docs/app/guides/upgrading/version-16))
- **React `cache()` dedupes within a render pass** across the layout, the page, and parallel
  slots — so the header slot's list read and the page's list read collapse to one BFF call.

## Decisions

1. **The shell header region renders a `@header` parallel-route slot** (`app/(app)/@header`),
   replacing the `PageChromeProvider` portal. The five BUILD list routes have a slot page
   (`@header/agents/page.tsx`, …) that reads the list from the BFF and renders that screen's
   **server-rendered rail**; `default.tsx` and `[...catchAll]/page.tsx` both render `null`.
   The two nulls make the slot robust to the `default`-vs-`catch-all` matching nuance while
   fixing the soft-nav "stuck rail." `components/page-chrome.tsx` (the portal) is deleted.
2. **The shell keeps the breadcrumb**, rendered for every non-list route and omitted on the
   five list routes via `isListRoute(pathname)` (`lib/nav.ts`, keyed by
   `LIST_ROUTE_SCOPES`). The rail (slot) and the breadcrumb (shell) are mutually exclusive
   by route — no runtime swap, so no flash on either. Keeping the breadcrumb + entity
   switcher in the shell keeps that well-tested subsystem untouched.
3. **Each screen's list config is extracted to `features/<name>/list-config.ts`** (sort
   fields, status tabs, search predicate, New button, Display vocabulary) and shared by two
   consumers: the rail wrapper (`features/<name>/components/<name>-rail.tsx`, in the slot)
   and the roster body (`<name>-list.tsx`, in the page). Both feed the same
   `useListQuery`/`useListDisplay`, reading the same cookie-prefs provider, so their view
   cannot drift.
4. **The list read is deduped with React `cache()`** (`server/trpc/reads.ts`): the slot and
   the page call the same cached reader, so one route render makes one BFF call.

## Consequences

- **Flash A is eliminated.** A hard refresh of a list route server-renders the rail into the
  header on the first frame; the fixed header height keeps zero layout shift. The durable
  unit proof is each `*-rail.test.tsx` "paints the saved filter on the first render" — the
  rail's saved view renders with no effect, mirroring the Flash B cookie-seed proof.
- **Realtime-ready.** The rail (slot) and body (page) sit under the layout's
  `TRPCProvider` + `ListPrefsProvider`, so they share one Query cache and one prefs context:
  changing a control in the rail re-renders the body now, and a future `reconcile()` cache
  update will re-render both. The structure needs no change to adopt prefetch +
  `HydrationBoundary`.
- **One coupling to maintain:** `LIST_ROUTE_SCOPES` (drives `isListRoute`) must match the set
  of `@header/<scope>` slot folders. Drift would double- or zero-render the header bar —
  caught by a hard-refresh check. A new list screen adds a nav item, a slot folder, a
  `list-config.ts`, a rail wrapper, and a `LIST_ROUTE_SCOPES` entry.
- **404s stay on the shell.** A missing entity throws `notFound()` (`orNotFound` in the
  detail/edit pages — a live path when a realtime delete removes something mid-session), which
  renders `app/(app)/not-found.tsx` *inside* this layout: a branded recovery surface with a way
  back, not Next's bare default page. The `@header` slot resolves to its `[...catchAll]` null for
  those URLs, so the header shows the breadcrumb. **Open upstream caveat:** a `[...catchAll]`
  inside a slot can, on a *soft* navigation to a since-deleted URL, skip the not-found boundary
  (HTTP 200 + blank) even though a hard load 404s correctly — Next issue
  [#79352](https://github.com/vercel/next.js/issues/79352) (open, fix PR linked). Reachable only
  via a stale in-app link to a deleted entity; verify with a signed-in soft-nav check.
- **Not adopted now — PPR / Cache Components.** `cacheComponents: true` (Next 16 folds
  `ppr`/`useCache`/`dynamicIO` into this one flag and makes Partial Prerendering the App Router
  default) could later prerender the rail shell and stream only the count. It layers on top of
  this structure; it is not a prerequisite. **Migration note:** under `cacheComponents` data
  fetching is dynamic-by-default, so the request-time reads this design relies on — `cookies()`
  for the prefs seed and `getServerSession()` in `app/(app)/layout.tsx` — must sit behind a
  `<Suspense>` boundary, or Next raises a "blocking route" error (a `cookies()`/`headers()` read
  outside Suspense stalls the prerendered shell). This is the known adjustment for the
  cookie-in-layout pattern, not a dead end — the same one shadcn/ui's `SidebarProvider` hit
  ([shadcn-ui#9189](https://github.com/shadcn-ui/ui/issues/9189)); the fix is Suspense placement,
  flagged here so the seam is ready.
  ([cacheComponents](https://nextjs.org/docs/app/api-reference/config/next-config-js/cacheComponents),
  [`cookies()` → dynamic rendering](https://nextjs.org/docs/app/api-reference/functions/cookies))
