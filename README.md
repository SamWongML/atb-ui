# ATB Console

Real-time AI agent-orchestration console — frontend + BFF.

Next.js 16 (App Router, RSC) · TypeScript (strict) · Tailwind v4 bound to the ATB
CSS-variable token system · shadcn/ui · SSE + WebSockets → a single `reconcile()`
sink into the TanStack Query cache · deployed as a standalone Node container on AWS
ECS Fargate. See `docs/design_handoff_atb_frontend/` for the full design + architecture handoff.

## Status: Phase 0 — Foundation ✅

Repo, pnpm, strict TS, Biome, lefthook. Tailwind v4 wired to `styles/tokens.css`.
shadcn/ui initialized. CI skeleton, Dockerfile, AWS CDK bootstrap, and the MSW mock
harness. (See `docs/design_handoff_atb_frontend/ROADMAP.md` for what comes next.)

## Getting started

```bash
pnpm install
pnpm dev        # themed shell at http://localhost:3000
```

## Scripts

| Command          | What it does                                        |
| ---------------- | --------------------------------------------------- |
| `pnpm dev`       | Dev server (Turbopack)                              |
| `pnpm build`     | Production build (standalone Node server)           |
| `pnpm test`      | Vitest + RTL, all tests run against the MSW harness |
| `pnpm typecheck` | `tsc --noEmit`                                      |
| `pnpm lint`      | Biome check                                         |
| `pnpm format`    | Biome format --write                                |

## Layout

Feature-sliced (`docs/design_handoff_atb_frontend/FOLDER_STRUCTURE.md`):
`app/` (routing only) · `features/<name>/` (self-contained slices) ·
`components/ui/` (owned shadcn primitives) · `lib/` · `styles/` (token contract) ·
`test/` (MSW handlers + setup) · `infra/` (AWS CDK).

## Deploy

The image runs `node server.js` from Next's standalone output (`Dockerfile`).
CI (`.github/workflows/ci.yml`) lints, typechecks, tests, and builds on every PR; the
opt-in `deploy-staging` job builds/pushes to ECR and rolls the ECS service defined in
`infra/`. Enable it by setting the repo variable `DEPLOY_ENABLED=true` plus the AWS
credentials/vars it references.

```bash
# Provision the staging stack (requires AWS credentials):
cd infra && pnpm install && pnpm cdk deploy
```
