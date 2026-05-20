# ── Stage 1: builder ──────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Garante instalacao de devDependencies (tsc, tsx) mesmo que o host passe NODE_ENV=production
ENV NODE_ENV=development

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
RUN npm ci

COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# ── Stage 2: runtime ──────────────────────────────────────────────────────
FROM node:20-bookworm-slim AS runtime

WORKDIR /app

ENV NODE_ENV=production

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates dumb-init \
  && rm -rf /var/lib/apt/lists/*

RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs --no-create-home appuser

COPY package*.json ./
COPY prisma ./prisma

# --ignore-scripts evita postinstall (prisma generate) — cliente copiado do builder abaixo
RUN npm ci --omit=dev --ignore-scripts

COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/dist ./dist

USER appuser

EXPOSE 3333

ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "dist/index.js"]
