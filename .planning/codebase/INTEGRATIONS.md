# External Integrations

**Analysis Date:** 2026-05-19

## APIs & External Services

**Internal REST API:**
- Express API - Serves application data and admin workflows under `/api/*`.
  - SDK/Client: Browser `fetch` wrapper in `src/lib/api.ts`.
  - Auth: `token` httpOnly cookie issued by `server/src/routes/auth.ts`; backend secret `JWT_SECRET`.
  - Route mounting: `server/src/app.ts`.

**Public News:**
- Campo Grande municipal news RSS - Supplies public highlight cards for CAPS and mental health topics.
  - SDK/Client: Node global `fetch` plus `fast-xml-parser` in `server/src/services/highlights-service.ts`.
  - Auth: Not required.
  - Allowed host: `www.campogrande.ms.gov.br` enforced by `server/src/services/highlights-service.ts`.
  - Cache: In-memory 15-minute cache in `server/src/services/highlights-service.ts`.

**Maps:**
- OpenStreetMap tile service - Renders base map tiles in the Leaflet map.
  - SDK/Client: `leaflet` and `react-leaflet` in `src/components/CapsMap.tsx`.
  - Auth: Not required.
  - URL template: `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` in `src/components/CapsMap.tsx`.
- Google Maps search links - Opens address search pages for unit addresses.
  - SDK/Client: Direct URL construction in `src/lib/contact.ts`.
  - Auth: Not required.
- WhatsApp deep links - Opens donor contact flow from unit phone numbers.
  - SDK/Client: Direct `https://wa.me/` URL construction in `src/lib/contact.ts`.
  - Auth: Not required.

**Fonts and Browser Assets:**
- Google Fonts - CSS imports Lexend and Source Sans 3.
  - SDK/Client: CSS `@import` in `src/Styles/Layout.css`.
  - Auth: Not required.
- Static public images - SESAU logo and CAPS photos are served from `public/*` and duplicated under `src/public/*`.
  - SDK/Client: Vite static asset handling and TS imports in `src/data/mockData.ts` and `src/components/Layout.tsx`.
  - Auth: Not required.

## Data Storage

**Databases:**
- PostgreSQL
  - Connection: `DATABASE_URL` read by Prisma datasource in `server/prisma/schema.prisma`.
  - Client: Prisma Client singleton in `server/src/lib/prisma.ts`.
  - Schema: `Unit`, `Need`, `Host`, `Donation`, and `Resident` models in `server/prisma/schema.prisma`.
  - Migrations: `server/prisma/migrations/20260330212620_init/migration.sql` and `server/prisma/migrations/20260504103000_add_baixa_need_priority/migration.sql`.
  - Seed: `server/src/prisma/seed.ts`.

**File Storage:**
- Local repository/static filesystem only.
  - Public frontend assets: `public/SESAU.png`, `public/logosesau.png`, and CAPS images under `public/`.
  - Source-imported assets: `src/public/*.png`, `src/public/*.jpg`, and `src/public/*.jpeg`.
  - No external object storage client detected.

**Caching:**
- In-memory news cache in `server/src/services/highlights-service.ts`.
- In-memory telemetry event ring buffer of 1000 events in `server/src/services/telemetry-service.ts`.
- Browser localStorage for donor intentions, theme, and cached admin display state in `src/services/donor-intentions-service.ts`, `src/theme/ThemeProvider.tsx`, `src/hooks/useAdminLogin.ts`, and `src/hooks/useDashboardData.ts`.
- No Redis, Memcached, or external cache service detected.

## Authentication & Identity

**Auth Provider:**
- Custom application authentication.
  - Implementation: Email/password login in `server/src/routes/auth.ts`, password verification with `bcryptjs`, JWT signing in `server/src/lib/jwt.ts`, and httpOnly cookie settings in `server/src/lib/session-cookie.ts`.
  - Database identity: `Host` records in `server/prisma/schema.prisma`.
  - Authorization: `requireAuth` and `requireAdmin` middleware in `server/src/middleware/auth.ts`.
  - Env-admin fallback: Optional `ENABLE_ENV_ADMIN_LOGIN`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD_HASH`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_NAME`, and `SEED_ADMIN_CAP_SLUG` handling in `server/src/routes/auth.ts` and `server/src/config/env.ts`.
  - Local bypass: Optional development-only `ENABLE_LOCAL_AUTH_BYPASS` and `LOCAL_AUTH_BYPASS_UNIT_SLUG` in `server/src/middleware/auth.ts`; frontend gate uses `VITE_ENABLE_LOCAL_AUTH_BYPASS` in `src/lib/auth.ts`.

## Monitoring & Observability

**Error Tracking:**
- None detected.
  - Backend errors are normalized by `server/src/middleware/error-handler.ts`.
  - Startup and runtime diagnostics use `console.log`, `console.warn`, and `console.error` in `server/src/index.ts`.

**Logs:**
- Prisma logging uses `['warn', 'error']` in development and `['error']` otherwise in `server/src/lib/prisma.ts`.
- Express request logging middleware is not detected in `server/src/app.ts`.
- Frontend telemetry posts browser events to `/api/telemetry` through `src/services/telemetry-service.ts`; backend stores summaries only in memory through `server/src/services/telemetry-service.ts`.

## CI/CD & Deployment

**Hosting:**
- Frontend: Static site deployment from repo root, build output `dist`, documented in `DEPLOYMENT.md`.
- Backend: Node service from `server`, build output `server/dist`, documented in `DEPLOYMENT.md`.
- Database: Managed PostgreSQL documented in `DEPLOYMENT.md`.
- Backend container: `server/Dockerfile` builds a Node 20 slim image, generates Prisma client, compiles TypeScript, prunes dev dependencies, exposes `3333`, and starts `npm start`.
- Vite preview allows `centro-doacao-caps.onrender.com` in `vite.config.js`.
- Hostinger deployment modes are documented in `DEPLOYMENT.md`.

**CI Pipeline:**
- None detected.
  - `.github/agents/*.agent.md` exists for review-agent metadata.
  - No `.github/workflows/*.yml` or `.github/workflows/*.yaml` files detected.
  - Manual validation command is `npm run deploy:check` from `package.json`.

## Environment Configuration

**Required env vars:**
- Frontend: `VITE_API_URL`, `VITE_ENABLE_LOCAL_AUTH_BYPASS`, and `VITE_ENABLE_TELEMETRY` are referenced by `src/lib/api.ts`, `src/lib/auth.ts`, and `src/services/telemetry-service.ts`.
- Backend production: `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, and `TRUST_PROXY` are documented in `DEPLOYMENT.md` and validated or read by `server/src/config/env.ts`, `server/src/config/security.ts`, and `server/src/app.ts`.
- Backend session/security options: `SESSION_COOKIE_SAMESITE`, `ENABLE_LOCAL_AUTH_BYPASS`, `LOCAL_AUTH_BYPASS_UNIT_SLUG`, `ENABLE_ENV_ADMIN_LOGIN`, and `API_MOCK_MODE` are referenced by `server/src/**/*.ts`.
- Seed/admin: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_PASSWORD_HASH`, `SEED_ADMIN_NAME`, and `SEED_ADMIN_CAP_SLUG` are referenced by `server/src/prisma/seed.ts`, `server/src/routes/auth.ts`, and `server/src/config/env.ts`.
- Runtime port: `PORT` is read by `server/src/index.ts` and `scripts/preview.mjs`.

**Secrets location:**
- Local secrets should live in ignored `.env` files; `.gitignore` ignores `.env` and `.env.*` while explicitly allowing example files.
- Example env files exist at `.env.example`, `.env.production.example`, `server/.env.example`, and `server/.env.production.example`; do not copy secret values into documentation.
- Deployment secrets are configured in the hosting provider panel according to `DEPLOYMENT.md`.

## Webhooks & Callbacks

**Incoming:**
- No third-party webhook endpoints detected.
- Public REST entry points include `/api/donations`, `/api/needs`, `/api/units`, `/api/highlights`, `/api/telemetry`, and `/api/health` mounted in `server/src/app.ts`.
- Admin/auth REST entry points include `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/residents`, protected donation reads/deletes, protected need creation, protected highlight writes, and telemetry summary routes in `server/src/routes/*.ts`.

**Outgoing:**
- Campo Grande RSS requests from `server/src/services/highlights-service.ts` to `https://www.campogrande.ms.gov.br/cgnoticias/?s=...&feed=rss2`.
- OpenStreetMap tile requests from `src/components/CapsMap.tsx`.
- Google Maps search links from `src/lib/contact.ts`.
- WhatsApp `wa.me` links from `src/lib/contact.ts`.
- Browser telemetry posts and beacons to `/api/telemetry` through `src/services/telemetry-service.ts`.

---

*Integration audit: 2026-05-19*
