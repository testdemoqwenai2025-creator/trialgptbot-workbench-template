# ============================================================
# TrialGPTBot Enterprise — Multi-stage Dockerfile
# ============================================================
# Stage 1 (deps):    install bun dependencies (cached layer)
# Stage 2 (builder): generate Prisma client + Next.js standalone build
# Stage 3 (runtime): minimal image with only the standalone output
#
# Result: ~150MB image that runs `bun standalone/server.js` on port 3000.
# Multi-arch (amd64 + arm64) is built by the release workflow via buildx.

# ---------- Stage 1: deps ----------
FROM oven/bun:1.3.14 AS deps
WORKDIR /app

# Copy lockfile + package.json first for cache
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# ---------- Stage 2: builder ----------
FROM oven/bun:1.3.14 AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time env
ENV DATABASE_URL="file:./db/custom.db" \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

# Generate Prisma client, then build standalone
RUN bun run db:generate && \
    bun run build

# Verify expected output exists
RUN test -f .next/standalone/server.js && \
    test -d .next/standalone/.next/static && \
    test -d .next/standalone/public && \
    echo "✓ standalone build verified"

# ---------- Stage 3: runtime ----------
FROM oven/bun:1.3.14-alpine AS runtime
WORKDIR /app

# Install only what runtime needs: a SQLite-compatible libc (musl already in alpine)
# and tini for proper signal handling
RUN apk add --no-cache tini sqlite

# Copy standalone build (includes node_modules, server.js, .next/static, public)
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/standalone/.next/static ./.next/static
COPY --from=builder /app/.next/standalone/public ./public

# Copy Prisma schema + DB so the runtime can use the SQLite DB
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/db ./db

# Run as non-root
RUN addgroup -S app && adduser -S app -G app && \
    chown -R app:app /app
USER app

# Env defaults
ENV NODE_ENV=production \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    DATABASE_URL="file:./db/custom.db"

EXPOSE 3000

# Healthcheck — hit the homepage
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://127.0.0.1:3000/ >/dev/null 2>&1 || exit 1

# tini handles SIGTERM cleanly so bun can flush
ENTRYPOINT ["/sbin/tini", "--"]
CMD ["bun", "server.js"]
