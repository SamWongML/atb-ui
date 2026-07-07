# ATB Frontend — Folder & Module Structure

**Feature-sliced.** `app/` stays thin (routing only). Each domain lives in a self-contained `features/<name>/` slice with its own components, hooks, schema, and store. This is the layout a solo dev and Claude Code navigate fastest: to change Sessions, everything is in one folder.

```
atb-console/
├─ app/                          # Next App Router — routing only, thin
│  ├─ (auth)/sign-in/page.tsx
│  ├─ (app)/
│  │  ├─ layout.tsx              # shell: nav · breadcrumb · ⌘K · providers
│  │  ├─ overview/page.tsx
│  │  ├─ sessions/[id]/page.tsx  # streaming chat + canvas
│  │  ├─ runs/ · agents/ · workflows/ · skills/
│  │  └─ mcp/ · sandboxes/ · analytics/
│  └─ api/
│     ├─ trpc/[trpc]/route.ts    # tRPC handler
│     ├─ stream/[sessionId]/route.ts   # SSE token proxy
│     └─ ws/route.ts             # WebSocket upgrade
├─ features/                     # one self-contained slice per domain
│  ├─ sessions/{components,hooks,api,schema,store}
│  ├─ agents/ · runs/ · workflows/ · squads/
│  ├─ skills/ · mcp/ · sandboxes/ · analytics/
│  └─ command-menu/
├─ components/ui/                # shadcn primitives (owned, restyled to tokens)
├─ components/                   # shared composite components
├─ lib/
│  ├─ realtime/{sse.ts, ws.ts, reconcile.ts}   # the streaming spine
│  ├─ query/{client.ts, keys.ts}
│  ├─ trpc/{client.ts, react.ts}
│  └─ utils.ts
├─ server/                       # BFF: routers · services · downstream clients
│  ├─ routers/ · services/ · context.ts · redis.ts
├─ styles/                       # tokens.css (the semantic vars) · globals.css
├─ test/                         # msw handlers · setup
├─ infra/                        # AWS CDK — ECS · ALB · ECR · ElastiCache · CloudFront
├─ Dockerfile
├─ biome.json
├─ next.config.ts
└─ package.json
```

## Conventions
- **One domain, one folder.** A feature owns its UI, data hooks, Zod schema, and any local store. Cross-feature sharing goes through `components/`, `lib/`, or the BFF — never feature-to-feature imports.
- **`app/` is routing glue only.** Pages compose feature components; they hold no business logic.
- **Schemas live with their feature** and are imported by both the client hook and the `server/` router that serves it — one definition, both sides.
- **`lib/realtime/` is the single streaming spine.** All SSE/WS traffic flows through `reconcile.ts` into the Query cache. Features subscribe to Query, not to sockets.
- **`styles/tokens.css` is the design-system contract.** It holds the `:root` (dark) and `[data-theme="light"]` variable sets from the prototype verbatim. Tailwind's `@theme` binds to these; never hardcode hex values in components.
- **`infra/` is TypeScript (CDK)** so the whole repo is one language.

## Scaling to a monorepo (later)
If a second app or a shared design-system package emerges, promote to **pnpm workspaces + Turborepo**: extract `packages/ui` (the shadcn/tokens layer) and `packages/schema` (shared Zod contracts), keep `apps/console` and a future `apps/*`. The feature-slice layout ports in unchanged.
