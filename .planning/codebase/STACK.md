# Technology Stack

**Analysis Date:** 2026-05-19

## Languages

**Primary:**
- TypeScript - Frontend React code under `src/**/*.ts` and `src/**/*.tsx`; backend API code under `server/src/**/*.ts`.
- JavaScript ES modules - Vite and development helper scripts in `vite.config.js`, `scripts/dev.mjs`, `scripts/dev-all.mjs`, and `scripts/preview.mjs`.

**Secondary:**
- SQL - Prisma migrations in `server/prisma/migrations/*/migration.sql`.
- CSS - Page and component styling in `src/Styles/*.css`; Leaflet CSS is imported by `src/components/CapsMap.tsx`.
- Prisma schema - Database models and datasource in `server/prisma/schema.prisma`.

## Runtime

**Environment:**
- Node.js >= 20 - Required by `server/README.md`; `server/Dockerfile` uses `node:20-bookworm-slim`.
- Local mapper runtime observed: Node.js `v22.20.0`, npm `10.9.3`.
- Browser runtime - Vite-built React SPA served from `dist` after `npm run build`.

**Package Manager:**
- npm - Root scripts in `package.json`; backend scripts in `server/package.json`.
- Lockfile: present at `package-lock.json` and `server/package-lock.json`, both lockfileVersion 3.

## Frameworks

**Core:**
- React `^18.3.1` - SPA UI components and pages under `src/components`, `src/pages`, and `src/app/router.tsx`.
- React DOM `^18.2.0` - App mounting in `src/main.tsx`.
- React Router DOM `^7.13.1` - Hash-based routing in `src/app/router.tsx`.
- Vite `^8.0.13` with `@vitejs/plugin-react` `^6.0.2` - Frontend dev server, build, and preview configured in `vite.config.js`.
- Express `^4.22.1` - REST API application and routes in `server/src/app.ts` and `server/src/routes/*.ts`.
- Prisma `^5.13.0` and `@prisma/client` `^5.13.0` - PostgreSQL ORM, schema, migrations, seed, and generated client under `server/prisma` and `server/src/lib/prisma.ts`.

**Testing:**
- Node built-in test runner via `tsx --test` - Backend unit test command `npm --prefix server run test:unit` runs `server/src/services/*.test.ts`.
- `node:assert/strict` - Assertions in `server/src/services/highlights-service.test.ts`, `server/src/services/needs-service.test.ts`, and `server/src/services/donations-service.test.ts`.
- Custom API smoke script - `server/scripts/test-api.ts` runs through `npm --prefix server run test:api`.

**Build/Dev:**
- TypeScript `^5.9.3` for frontend type checking config in `tsconfig.json`.
- TypeScript `^5.4.5` for backend compilation config in `server/tsconfig.json`.
- tsx `^4.14.1` - Backend watch mode, seed, and test execution in `server/package.json`.
- Docker - Backend image build in `server/Dockerfile`; root `docker-compose.yml` contains no active service definition.

## Key Dependencies

**Critical:**
- `@prisma/client` `^5.13.0` - Database access through singleton client in `server/src/lib/prisma.ts`.
- `express` `^4.22.1` - API routing, middleware, and healthcheck in `server/src/app.ts`.
- `jsonwebtoken` `^9.0.2` - Session token signing and verification in `server/src/lib/jwt.ts`.
- `bcryptjs` `^2.4.3` - Password hashing and comparison in `server/src/routes/auth.ts` and `server/src/prisma/seed.ts`.
- `zod` `^3.23.8` - Request, JWT, telemetry, and highlight validation in `server/src/**/*.ts`.
- `react-leaflet` `^4.2.1` and `leaflet` `^1.9.4` - Interactive map rendering in `src/components/CapsMap.tsx`.
- `fast-xml-parser` `^5.7.2` - RSS parsing for public highlights in `server/src/services/highlights-service.ts`.

**Infrastructure:**
- `dotenv` `^17.4.2` - Backend environment loading via `import 'dotenv/config'` in `server/src/index.ts`.
- `helmet` `^7.1.0` - HTTP security headers in `server/src/app.ts`.
- `cors` `^2.8.5` - Credentialed CORS with configured origins in `server/src/app.ts` and `server/src/config/security.ts`.
- `cookie-parser` `^1.4.6` - Reads JWT session cookie in `server/src/middleware/auth.ts`.
- `express-rate-limit` `^7.3.1` - General, login, donation, and telemetry rate limits in `server/src/app.ts`.
- `react-icons` `^5.6.0` and `@react-icons/all-files` `^4.1.0` - UI icons in components such as `src/components/Layout.tsx`, `src/pages/admin/Dashboard.tsx`, and `src/components/ui/ThemeToggle.tsx`.

## Configuration

**Environment:**
- Frontend uses Vite env values from `import.meta.env`: `VITE_API_URL` in `src/lib/api.ts` and `src/services/telemetry-service.ts`, `VITE_ENABLE_TELEMETRY` in `src/services/telemetry-service.ts`, and `VITE_ENABLE_LOCAL_AUTH_BYPASS` in `src/lib/auth.ts`.
- Backend validates production and security env in `server/src/config/env.ts`: `NODE_ENV`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `SESSION_COOKIE_SAMESITE`, `ENABLE_LOCAL_AUTH_BYPASS`, `ENABLE_ENV_ADMIN_LOGIN`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_PASSWORD_HASH`, `SEED_ADMIN_NAME`, and `SEED_ADMIN_CAP_SLUG`.
- Runtime server env is read in `server/src/index.ts` (`PORT`, `API_MOCK_MODE`), `server/src/app.ts` (`TRUST_PROXY`), and `server/src/middleware/auth.ts` (`LOCAL_AUTH_BYPASS_UNIT_SLUG`).
- Environment sample files are present at `.env.example`, `.env.production.example`, `server/.env.example`, and `server/.env.production.example`; their contents are not included in this map.
- Secret files matching `.env` and `.env.*` are ignored by `.gitignore`.

**Build:**
- Root frontend config: `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.js`, and `index.html`.
- Backend config: `server/package.json`, `server/package-lock.json`, `server/tsconfig.json`, `server/Dockerfile`, `server/prisma/schema.prisma`, and `server/prisma/migrations/*/migration.sql`.
- Development orchestration: `scripts/dev.mjs` runs Vite, `scripts/dev-all.mjs` runs frontend plus optional backend, and `scripts/preview.mjs` runs `vite preview` with `PORT`.
- Deployment checklist and environment guidance live in `DEPLOYMENT.md`.

## Platform Requirements

**Development:**
- Run root install with `npm install` from `package.json`.
- Run backend install with `npm --prefix server install` or `cd server && npm install` from `server/package.json`.
- PostgreSQL >= 14 is required for backend development according to `server/README.md`; Prisma uses `DATABASE_URL` from `server/prisma/schema.prisma`.
- Frontend-only development uses `npm run dev:web`; full development uses `npm run dev:all`, which proxies `/api` from Vite to `http://localhost:3333` in `vite.config.js`.
- Backend development uses `npm --prefix server run dev`, which runs `tsx watch src/index.ts`.

**Production:**
- Frontend static deployment builds from repo root with `npm install && npm run build` and serves `dist` per `DEPLOYMENT.md`.
- Backend deployment builds from `server` with `npm install && npm run build` and starts with `npm start` per `DEPLOYMENT.md`.
- Backend Docker runtime uses `server/Dockerfile`, exposes port `3333`, and runs `npm start`.
- Production data store is managed PostgreSQL using `DATABASE_URL`; migrations run with `npm --prefix server run db:deploy`.
- Vite preview allows host `centro-doacao-caps.onrender.com` in `vite.config.js`; `DEPLOYMENT.md` also documents Hostinger static and Node deployment modes.

---

*Stack analysis: 2026-05-19*
