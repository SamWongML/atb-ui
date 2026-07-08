# syntax=docker/dockerfile:1
# Small standalone Node image for AWS ECS Fargate (ARCHITECTURE.md §Deployment).

# ---- deps: install with the pinned pnpm from packageManager ----
FROM node:22-alpine AS deps
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# ---- builder: produce the standalone build + the bundled WS gateway server ----
FROM node:22-alpine AS builder
RUN corepack enable
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm build
# Next route handlers can't upgrade a WebSocket, so we ship a custom Node entry
# (server.ts) that boots Next and owns /api/ws. esbuild bundles it (+ ws, ioredis,
# app code) into one file; `next` stays external and resolves from the standalone
# node_modules at runtime. See ARCHITECTURE.md §"WebSocket fan-out".
RUN pnpm build:server

# ---- runner: minimal runtime, non-root ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
# Next `output: standalone` emits a self-contained server + traced node_modules
# (which the bundled server reuses for `next` and the traced deps).
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
# The custom WS gateway server replaces the default standalone `server.js`.
COPY --from=builder --chown=nextjs:nodejs /app/ws-server.cjs ./ws-server.cjs

USER nextjs
EXPOSE 3000
CMD ["node", "ws-server.cjs"]
