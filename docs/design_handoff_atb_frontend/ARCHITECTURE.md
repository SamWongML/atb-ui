# ATB Frontend — System Architecture

## Three tiers, one type-safe seam
The browser talks **only** to the BFF. The BFF owns secrets and auth, then fans out to downstream services. Every arrow that crosses a process boundary is validated by a shared Zod schema.

```
┌──────────────────────── Browser · React 19 client ────────────────────────┐
│   RSC + Pages        Query cache        SSE reader          WS client       │
│   (feature slices)   (TanStack)         (token streams)     (control · presence)
└──────────────┬──────────────────────────────┬───────────────────┬──────────┘
      HTTPS · tRPC                     SSE ↓ (fetch-event-source)   WSS ↕
               │                              │                     │
┌──────────────┴──────────────────────────────┴─────────────────────┴─────────┐
│      Backend-for-Frontend · Next.js on ECS Fargate                           │
│   tRPC routers   Auth/session   SSE proxy (fan-in)   WS gateway   Zod validate│
└──────────────┬───────────────────────────────────────────────────────────────┘
        internal service calls · OpenTelemetry spans
               │
┌──────────────┴───────────────────────────────────────────────────────────────┐
│   Downstream (as they come online)                                            │
│   Agent engine    Postgres (sessions·runs)    Redis pub/sub (WS backplane)    │
│                                                MCP registry                    │
└───────────────────────────────────────────────────────────────────────────────┘
```
Dashed/external services are owned by other teams or not yet built. **The BFF is the stable contract the UI is written against** — so UI work is unblocked before any real backend exists (build against the MSW mock harness).

---

## Real-time data flow — how a token reaches the screen
The defining pattern: **streaming transports never touch React state directly.** They land in one reconcile function that updates the Query cache; components just render the cache. This keeps optimistic control, background refetch, and live streams from fighting each other.

1. **Agent engine emits** — tokens, tool calls, status deltas as an event stream.
2. **BFF proxies over SSE** — attaches auth, multiplexes per session, publishes to Redis so any task can serve it.
3. **Client SSE reader parses + Zod-validates** — each frame becomes a typed event or a caught error.
4. **`reconcile()` writes the cache** — `queryClient.setQueryData(['session', id], append)`. One function, one sink.
5. **Components re-render from cache** — the transcript grows; no component knows SSE exists.

**Return path (WebSocket):** user clicks *Approve* / *Interrupt* → optimistic cache update → WS message to the BFF → engine acts → the authoritative echo returns through the **same** `reconcile()`, confirming or rolling back. Bidirectional control and one-way streams share a sink, never a transport.

```
lib/realtime/
  sse.ts         — fetch-event-source wrapper; parses frames, Zod-validates
  ws.ts          — partysocket client; reconnect/backoff/heartbeat; send()
  reconcile.ts   — the single sink: (event) => queryClient.setQueryData(...)
```

---

## Deployment on AWS ECS
Next.js builds to a **standalone Node server** in a small Docker image and runs as a long-lived **Fargate** service — no serverless caveats around streaming or connection lifetime.

- **Ship path:** GitHub Actions (build + test) → Docker image → **ECR** → **ECS Fargate** (rolling / blue-green via CodeDeploy) → behind an **ALB**. Static assets → **S3 + CloudFront**.
- **Config:** secrets in **Secrets Manager**, config in **SSM Parameter Store**.
- **IaC:** **AWS CDK** (TypeScript — same language as the app), in `infra/`.

### ⚠ The critical production detail — WebSocket fan-out
With more than one Fargate task, a client's WebSocket is pinned to **one** task. An event produced on task A must reach a subscriber on task B. Solve it with a **Redis (ElastiCache) pub/sub backplane**: every task publishes/subscribes to session channels, so any task can serve any client.

- Configure the ALB with a **long idle timeout** for SSE/WS.
- **Disable response buffering** on stream routes.
- Enable stickiness only as a fallback, not the primary mechanism.
- **Design this in from Phase 1** — retrofitting a backplane into a live socket layer is painful.

---

## Cross-cutting budgets (enforced in CI)
- **Performance:** LCP < 2.0s · INP < 200ms · initial route JS < 200KB · RSC by default · code-split the canvas & Shiki · virtualize every live list.
- **Accessibility:** WCAG 2.2 AA contrast (light theme already tuned) · focus management in dialogs & ⌘K · full keyboard paths · honor `prefers-reduced-motion`.
- **Security:** secrets only at the BFF · httpOnly session cookies · CSP · Zod-validate every boundary & stream frame · rate-limit SSE/WS connections.
