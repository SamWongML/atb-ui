# ATB Frontend — Tech Stack Decision Record

**Context:** Greenfield · no existing backend (frontend ships its own BFF) · real-time via **SSE + WebSockets** · deploys to **enterprise AWS ECS Fargate** · built **solo + AI-assisted (Claude Code)**.

One primary pick per layer, with the alternative worth knowing and (where relevant) what was deliberately declined.

---

### L1 · Framework & runtime — **Next.js 16 (React 19.2, App Router)**
RSC lets a dozen data-heavy surfaces render server-side and ship minimal JS. Turbopack is the default bundler (fast HMR at scale), the React Compiler removes manual memoization, and Route Handlers provide the BFF in-repo (streaming responses for SSE, an upgrade path for WS). Runs as a standalone Node container on ECS with no serverless lock-in, and its conventions are the ones Claude Code knows best.
- **Alternative:** Vite + React Router 7 (framework mode) + standalone **Hono** BFF — a stricter SPA/API split.
- **Declined:** TanStack Start (younger ecosystem) for a system meant to last.

### L2 · Language & contracts — **TypeScript 5.9 (strict) + Zod 4**
No implicit `any`. Zod is the single source of truth for shapes: one schema validates an inbound stream frame at the BFF, types the tRPC output, and powers form validation. A malformed live event becomes a caught error, never a silent `undefined`.
- **Alternative:** Valibot where bundle size is tight.
- **Note:** generate types from the backend's OpenAPI/proto once it exists; keep Zod for runtime-validated boundaries.

### L3 · API boundary (the BFF) — **Next Route Handlers + tRPC v11**
The frontend ships its own **Backend-for-Frontend**: owns auth/session, holds secrets, shapes data. tRPC gives fully typed, autocompleted calls with zero codegen and zero client/server drift — the biggest productivity lever for a solo TS dev. When real services come online, the BFF becomes the aggregation seam; the UI contract never changes.
- **Alternative:** oRPC when the contract must be OpenAPI-documented for external/mobile consumers.
- **Declined:** GraphQL — operational weight isn't justified with one first-party UI + a BFF you control.

### L4 · State — **TanStack Query v5 · Zustand · nuqs**
Split state by ownership. **TanStack Query** owns all server data and is the single sink streaming events reconcile into. **Zustand** owns the small amount of true global UI state. **nuqs** puts filters/selection/active-tab in the URL (shareable, reloadable, back-button-correct).
- **Alternative:** Jotai for fine-grained atomic/derived state.
- **Declined:** Redux Toolkit — boilerplate + single-store fights stream-driven data.

### L5 · Real-time transport — **SSE for streams · WebSocket for control** ★
Right pipe per job. **SSE** carries high-frequency one-way flows (agent tokens, logs, status) — auto-reconnects, proxy-friendly, simple to operate. **WebSockets** carry genuine bidirectional traffic (steering, approvals, presence, interrupts). Both feed one reconcile layer that writes the Query cache, so the UI never learns which transport delivered a change.
- Client: **fetch-event-source** (POST + auth headers, unlike raw `EventSource`) for SSE; **partysocket** (reconnecting, backoff, heartbeat) for WS.
- **Alternative:** collapse onto one WebSocket if ops simplicity outweighs SSE resilience.
- **ECS caveat:** multi-task fan-out needs a **Redis pub/sub backplane** (see `ARCHITECTURE.md`).

### L6 · Styling & theming — **Tailwind CSS v4 + CSS variables**
The prototype already *is* a semantic token system swapped on `[data-theme]`. Tailwind v4's CSS-first `@theme` binds onto those exact variables, so theming stays in CSS (where the runtime toggle lives) while utilities give velocity.
- **Alternative:** vanilla-extract (typed, zero-runtime) if you prefer authored stylesheets.
- **Declined:** runtime CSS-in-JS (per-render cost + RSC friction).

### L7 · Component primitives — **shadcn/ui + Radix + cmdk**
shadcn copies component *source* into the repo (you own & restyle it to ATB tokens; Claude Code can edit it) on accessible Radix primitives. **cmdk** = ⌘K palette; **Sonner** = toasts. Bespoke surfaces (session canvas) are built directly.
- **Alternative:** Base UI (Radix team's 1.0 successor).
- **Declined:** MUI / Ant Design — heavy themes fight the crafted look.

### L8 · Specialized libraries
- **TanStack Table + Virtual** — virtualized runs/sessions lists (alt: AG Grid).
- **Recharts** — analytics charts (alt: visx bespoke, Tremor instant dashboards).
- **Shiki** — accurate diff/code highlighting (Monaco only if inline editing needed).
- **React Hook Form + Zod** — config forms; schema reused from the API boundary.
- **Auth.js v5 / better-auth** — self-hostable BFF session auth; **WorkOS** for enterprise SAML/SCIM.
- **Motion (Framer)** — restrained transitions; honor `prefers-reduced-motion`.

### L9 · Toolchain, testing & observability
- **Toolchain:** pnpm · Biome (lint+format) · Turbopack · lefthook (pre-commit).
- **Testing:** Vitest + RTL · Playwright (E2E) · **MSW** (mock SSE/WS/REST — non-negotiable with no backend) · Storybook 9 + visual regression.
- **Observability:** Sentry (errors + RUM) · PostHog (product, self-hostable) · OpenTelemetry (trace runs end-to-end) · pino → CloudWatch.
