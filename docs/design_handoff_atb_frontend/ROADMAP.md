# ATB Frontend — Phased Roadmap

**~12 weeks, solo + Claude Code.** Build the real-time spine and app shell *before* any feature surface — every surface depends on them, so proving them early de-risks everything after. Durations are indicative.

---

## Phase 0 · Foundation — Week 1
Repo, pnpm, strict TS, Biome, lefthook. Tailwind v4 wired to the ATB token file (`styles/tokens.css`). shadcn/ui initialized. CI skeleton, Dockerfile, AWS CDK bootstrap, and the **MSW mock harness** — so day-one feature work runs against fake streams.

**Exit:** `pnpm dev` renders a themed shell; `pnpm test` runs against MSW; a container deploys to a staging ECS service.

## Phase 1 · Shell & real-time spine — Weeks 2–3 (the spine)
App shell: sidebar nav, breadcrumb + entity switcher, workspace/env switcher, ⌘K palette, dark/light theming (persisted). Auth at the BFF. tRPC + TanStack Query wired. The **SSE + WS clients and the `reconcile()` layer** built and load-tested with the **Redis backplane**.

**Exit:** a mock session streams tokens end-to-end through `reconcile()` into a live-updating view; WS round-trip (approve/interrupt) works across two ECS tasks.

## Phase 2 · Sessions — Weeks 4–6 (hero surface)
The grouped, **virtualized** sessions list (Needs you / Active / Review / Done + filter tabs) and the session **detail**: streaming chat transcript + the **canvas** (Plan / Run / Diff / Trace) with **Shiki**-highlighted diffs. Ship end-to-end before widening.

**Exit:** a real (or fully mocked) session is watchable and steerable start to finish.

## Phase 3 · Build surfaces — Weeks 7–9
Agents (model, **edit/bash/network** permissions, system prompt), Squads, Workflows, Skills, MCP servers (with health states). Mostly forms + detail views reusing the feature-slice pattern — fast once conventions are set.

## Phase 4 · Runtime & insight — Weeks 10–11
Runs history + failures, Sandboxes, the Analytics dashboard (**Recharts**: cost, model mix), and the Overview home tying the activity feed together.

## Phase 5 · Hardening & cutover — Week 12+ (ongoing)
Accessibility pass, performance-budget enforcement in CI, visual-regression coverage, **WS fan-out load test**, observability dashboards (Sentry / PostHog / OTel), and the blue-green production cutover.

---

### Sequencing principle
Nothing in Phases 2–5 is safe to start before the Phase 1 spine is proven. The most expensive mistake would be building feature surfaces on an unvalidated streaming/reconcile layer and discovering the fan-out or cache-reconciliation model is wrong after ten screens depend on it.
