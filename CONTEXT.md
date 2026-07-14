# CONTEXT

Domain vocabulary and testing seams for the ATB console. Read this before adding
tests so names and interfaces match the project's language.

## Domain language

- **Session** — a launched, steerable agent run. The hero surface. Grouped by
  status: `needs_you` (amber) · `active` (clay) · `review` (violet) · `done` (green).
- **Agent** — a configured worker (harness + model + edit/bash/network permissions +
  system prompt + attached skills/MCPs).
- **Harness** — the coding-agent framework an Agent runs inside (Claude Code · Codex ·
  OpenCode). It drives the model and defines the tool/permission protocol. Distinct from
  **Sandbox** (the compute environment agents run inside) and from **model** (the LLM it
  drives); a harness supports a set of models (`HARNESS_MODELS`).
- **Squad** — a team of agents with a lead, mission, target repo, and phase.
- **Workflow** — a multi-agent pipeline (nodes + connections).
- **Skill** — a reusable capability package (versioned).
- **MCP server** — a connected tool server with a health state (healthy / degraded).
- **Run** — an execution record; failures carry a root cause.
- **Sandbox** — a compute environment agents run inside.
- **reconcile()** — the single sink: SSE + WS events (Zod-validated) are written into
  the TanStack Query cache. Components render the cache; they never touch sockets.

Semantic colors: clay/accent = primary/active · green = healthy/done/allow · amber =
attention/needs-you/ask/degraded · violet = review · blue = info/running · red =
error/deny.

## Testing seams (test here; never against internals)

- **Feature data layer** — `features/<name>/api.ts` fns fetch from the BFF and return
  Zod-validated shapes (`features/<name>/schema.ts`). Test through the fn; the mock BFF
  is `test/handlers.ts` (MSW). Assert known-good literals, and that malformed frames
  reject at the Zod boundary.
- **Theme** — `lib/theme.ts` public fns; observe `data-theme` on the root and
  `localStorage`, not internals.
- **Components** — render via RTL, assert on roles/text (public output), not structure.

Conventions: schemas live with their feature and are shared client+server. Never
hardcode hex — use the token utilities bound in `styles/globals.css`. `app/` is routing
glue only. All tests run against MSW (`onUnhandledRequest: "error"`).

**Adding shadcn components:** `styles/globals.css` (`@theme inline`) bridges shadcn's
role vocabulary (`bg-background`, `bg-card`, `text-muted-foreground`, `bg-destructive`,
…) onto ATB tokens, so `npx shadcn add <component>` renders in the ATB look with no
hand-patching. One naming trap: shadcn's `accent` role is a subtle neutral
hover/selected surface, not the ATB brand color — the brand (clay) is `primary`. Don't
reach for `accent`/`bg-accent` expecting the brand color.

## Phase status

Phase 0 (foundation) is complete. Next: Phase 1 — app shell (sidebar nav, ⌘K, entity
switcher), BFF auth, tRPC + TanStack Query, and the SSE/WS + `reconcile()` spine with a
Redis backplane. See `docs/design_handoff_atb_frontend/ROADMAP.md`.
