# External Integrations

**Analysis Date:** 2026-05-29

## APIs & External Services

**Internal REST API:**
- Centro Doacao CAPS API - Frontend calls backend routes under `/api`.
  - SDK/Client: browser `fetch` wrapper in `src/lib/api.ts`.
  - Auth: `httpOnly` JWT cookie named `token`, set by `server/src/routes/auth.ts` and read by `server/src/middleware/auth.ts`.
  - Base URL: `VITE_API_URL` in `src/lib/api.ts`; empty value uses same-origin requests and Vite proxies `/api` to `http://localhost:3333` in `vite.config.js`.

**Municipal News RSS:**
- Campo Grande CGNoticias RSS - Public highlights include external news about CAPS/mental health.
  - SDK/Client: built-in `fetch` plus `fast-xml-parser` in `server/src/services/highlights-service.ts`.
  - Auth: none.
  - Host restriction: only `https://www.campogrande.ms.gov.br/cgnoticias/` is accepted in `server/src/services/highlights-service.ts`.
  - Operational limits: 8 second fetch timeout, 256 KB response cap, 15 minute in-memory cache in `server/src/services/highlights-service.ts`.

**Maps:**
- OpenStreetMap tile service - Leaflet map tiles in `src/components/CapsMap.tsx`.
  - SDK/Client: `leaflet` and `react-leaflet`.
  - Auth: none.
- Google Maps search links - Address deep links generated in `src/lib/contact.ts`.
  - SDK/Client: plain URL generation.
  - Auth: none.

**Messaging / Contact Links:**
- WhatsApp click-through links - Unit contact links generated as `wa.me` URLs in `src/lib/contact.ts`.
  - SDK/Client: plain URL generation.
  - Auth: none.

**Fonts:**
- Google Fonts - Lexend and Source Sans 3 imported in `src/Styles/Layout.css`.
  - SDK/Client: CSS `@import`.
  - Auth: none.

## Data Storage

**Databases:**
- PostgreSQL
  - Connection: `DATABASE_URL`.
  - Client: Prisma Client from `@prisma/client`, instantiated in `server/src/lib/prisma.ts`.
  - Schema: `server/prisma/schema.prisma`.
  - Models: `Unit`, `Need`, `Host`, `Donation`, `Resident` in `server/prisma/schema.prisma`.
  - Migrations: `server/prisma/migrations/20260330212620_init/migration.sql` and `server/prisma/migrations/20260504103000_add_baixa_need_priority/migration.sql`.

**File Storage:**
- Local/static assets only.
  - Public browser assets: `public/*.png`, `public/*.jpg`, `public/*.jpeg`, `public/robots.txt`.
  - Source-imported image duplicates: `src/public/*.jpg`, `src/public/*.jpeg`, `src/public/*.png`.
  - No object storage SDK or external file upload service detected.

**Caching:**
- In-memory news cache in `server/src/services/highlights-service.ts`.
- In-memory editable highlight store in `server/src/services/highlights-service.ts`; custom admin-created highlights are process-local.
- In-memory telemetry ring buffer with max 1000 events in `server/src/services/telemetry-service.ts`.
- Browser `localStorage` for donor intentions in `src/services/donor-intentions-service.ts` and admin UI state in `src/hooks/useAdminLogin.ts`, `src/hooks/useDashboardData.ts`, `src/components/Layout.tsx`, and `src/pages/admin/Dashboard.tsx`.

## Authentication & Identity

**Auth Provider:**
- Custom first-party authentication.
  - Implementation: email/password login in `server/src/routes/auth.ts`.
  - Password verification: `bcryptjs` in `server/src/routes/auth.ts`.
  - Persistent users: `Host` records in PostgreSQL through Prisma model `Host` in `server/prisma/schema.prisma`.
  - Session format: JWT signed by `server/src/lib/jwt.ts`.
  - Session transport: `httpOnly` cookie from `server/src/lib/session-cookie.ts`.
  - Authorization: `requireAuth` and `requireAdmin` in `server/src/middleware/auth.ts`.
  - Admin seed path: `server/src/prisma/seed.ts`, configured through `SEED_ADMIN_*` env names.
  - Environment admin login: optional `ENABLE_ENV_ADMIN_LOGIN` path in `server/src/routes/auth.ts` and `server/src/config/env.ts`.
  - Local development bypass: optional `ENABLE_LOCAL_AUTH_BYPASS` backend path in `server/src/middleware/auth.ts`; frontend detection in `src/lib/auth.ts`.

## Monitoring & Observability

**Error Tracking:**
- None detected. No Sentry, Datadog, OpenTelemetry, LogRocket, or similar package appears in `package.json` or `server/package.json`.

**Logs:**
- Backend logs startup, migration, DB connection, and shutdown events with `console` in `server/src/index.ts`.
- Prisma logs warnings/errors in development and errors in production from `server/src/lib/prisma.ts`.
- Frontend telemetry posts user interaction/performance events to the first-party `/api/telemetry` endpoint from `src/services/telemetry-service.ts`.
- Telemetry summaries are admin-only through `server/src/routes/telemetry.ts`.

## CI/CD & Deployment

**Hosting:**
- Frontend static hosting from root build output `dist`, documented in `DEPLOYMENT.md`.
- Backend Node service from `server/dist/index.js`, documented in `DEPLOYMENT.md`.
- Backend Docker image based on `node:20-bookworm-slim` in `server/Dockerfile`.
- Managed PostgreSQL is expected for production in `DEPLOYMENT.md`.
- Hostinger deployment paths are documented in `DEPLOYMENT.md`.
- Vite preview allows `centro-doacao-caps.onrender.com` in `vite.config.js`; proxy/trust-proxy configuration is controlled by `TRUST_PROXY` in `server/src/app.ts`.

**CI Pipeline:**
- None detected. `.github` contains agent markdown files in `.github/agents/*.agent.md`; no `.github/workflows/*.yml` or `.github/workflows/*.yaml` files are present.
- Manual deployment validation command is `npm run deploy:check` in `package.json`.

## Environment Configuration

**Required env vars:**
- Backend production: `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`.
- Backend deployment/proxy: `PORT`, `TRUST_PROXY`, `SESSION_COOKIE_SAMESITE`.
- Backend seeded/admin access: `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_PASSWORD_HASH`, `SEED_ADMIN_NAME`, `SEED_ADMIN_CAP_SLUG`, `ENABLE_ENV_ADMIN_LOGIN`.
- Backend local bypass: `ENABLE_LOCAL_AUTH_BYPASS`, `LOCAL_AUTH_BYPASS_UNIT_SLUG`.
- Frontend API/runtime: `VITE_API_URL`, `VITE_ENABLE_LOCAL_AUTH_BYPASS`, `VITE_ENABLE_TELEMETRY`.

**Secrets location:**
- Environment example files exist at `.env.example`, `.env.production.example`, `server/.env.example`, and `server/.env.production.example`; contents were not read.
- Actual secrets are expected in deployment platform environment variables according to `DEPLOYMENT.md`.
- `DEPLOYMENT.md` explicitly instructs not to publish `.env` files.

## Webhooks & Callbacks

**Incoming:**
- No webhook-specific endpoints detected.
- Public incoming REST endpoints include `/api/health`, `/api/units`, `/api/needs`, `/api/donations`, `/api/highlights`, and `/api/telemetry`, registered in `server/src/app.ts`.
- Authenticated/admin incoming REST endpoints include `/api/auth/me`, `/api/donations`, `/api/residents`, `/api/highlights`, and `/api/telemetry/summary`, registered through `server/src/app.ts` and route files in `server/src/routes/*.ts`.

**Outgoing:**
- Server-side outgoing RSS fetches to `www.campogrande.ms.gov.br` from `server/src/services/highlights-service.ts`.
- Browser-side outgoing tile requests to `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` from `src/components/CapsMap.tsx`.
- Browser-side external navigation links to Google Maps and WhatsApp from `src/lib/contact.ts`.
- Browser-side font request to Google Fonts from `src/Styles/Layout.css`.

---

*Integration audit: 2026-05-29*
