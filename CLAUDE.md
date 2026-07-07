# ATB Console — real-time AI agent-orchestration console (Next.js + in-repo BFF)

Next.js 16 (App Router, RSC) · TypeScript strict · Tailwind v4 on a CSS-variable
token system · shadcn/ui · realtime via SSE + WS reconciled into a TanStack Query
cache · ships as a standalone Node container on AWS ECS Fargate.

**Status: Phase 0 (foundation) done; Phase 1 (app shell + realtime spine) next.**
Read first for depth (this file is only the index):
- **`CONTEXT.md`** — domain vocabulary + testing seams. Read before naming things or writing tests.
- **`docs/design_handoff_atb_frontend/`** — full design: `ARCHITECTURE` · `TECH_STACK` · `FOLDER_STRUCTURE` · `ROADMAP`.

## Commands (pnpm — never npm/yarn)
- `pnpm dev` — dev server (Turbopack) at :3000
- `pnpm test` / `pnpm test:watch` — Vitest + RTL, all tests run against the MSW harness
- `pnpm typecheck` — `tsc --noEmit` (strict)
- `pnpm lint` / `pnpm format` — Biome check / write
- `pnpm build` — production standalone build

**The bar — a change isn't done until CI is green:**
`pnpm biome ci . && pnpm typecheck && pnpm test && pnpm build`.
(pre-commit auto-fixes with Biome; pre-push runs typecheck + test.)

## Where code lives — feature-sliced (`@/*` = repo root)
`FOLDER_STRUCTURE.md` is the **target** map; create a folder/slice the first time you
need it — much of `server/`, `lib/realtime/`, `lib/query/`, `lib/trpc/` isn't built yet.
- `app/` — App Router; **routing glue only**, no business logic. Pages compose feature components.
- `features/<name>/` — one self-contained slice per domain (`components, hooks, api, schema, store`).
  **One domain, one folder. No feature-to-feature imports** — share via `components/`, `lib/`, or the BFF.
- `components/ui/` — owned shadcn primitives (restyled to tokens); `components/` — shared composites.
- `lib/` — `utils.ts` (`cn`), `theme.ts`, and (Phase 1) `realtime/`, `query/`, `trpc/`.
- `styles/` — `tokens.css` (the token contract) + `globals.css` (Tailwind ↔ token bindings).
- `server/` (Phase 1) — the BFF: routers, services, downstream clients. `test/` — MSW handlers + setup. `infra/` — AWS CDK.

## Hard rules

**Design tokens & components — keep the UI one consistent, reusable system**
- Never hardcode a color — no hex, no `bg-white`/`bg-black`. Every color is a token utility
  bound in `styles/globals.css` (backed by `styles/tokens.css`). `styles/tokens.contract.test.ts` enforces this.
- shadcn's **`primary` is the ATB brand (clay)**; its **`accent` is a neutral hover/selected
  surface, NOT the brand** — never reach for `bg-accent` expecting brand color.
- Add primitives with `npx shadcn add <component>` (new-york · RSC · lucide) — the `@theme inline`
  bridge renders them in the ATB look with no hand-patching. Check `components/ui/` before hand-rolling.

**Data & realtime — one source of truth per boundary**
- One Zod schema per shape, colocated at `features/<name>/schema.ts`, imported by both the client
  hook and the BFF router. **Validate at every process boundary** (`schema.parse(...)`) — a malformed
  frame becomes a caught error, never a silent `undefined`.
- All SSE/WS traffic flows through the single `lib/realtime/reconcile.ts` sink into the Query cache.
  **Components render the cache; they never touch sockets.** (Phase 1.)

**Tests — exercise the seam, not the internals**
- Test through public surfaces: feature `api.ts` fns (against MSW `test/handlers.ts`), public `lib`
  fns, and components via RTL roles/text. Never assert on internal structure.
- Every test runs against MSW with `onUnhandledRequest: "error"` — register a handler in
  `test/handlers.ts` or the test fails loudly.
