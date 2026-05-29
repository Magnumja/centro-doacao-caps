# Technology Stack

**Analysis Date:** 2026-05-29

## Languages

**Primary:**
- TypeScript 5.x - Frontend source in `src/**/*.ts`, `src/**/*.tsx`; backend source in `server/src/**/*.ts`.
- JavaScript ES modules - Tooling and Vite config in `vite.config.js`, `scripts/dev.mjs`, `scripts/dev-all.mjs`, `scripts/preview.mjs`.

**Secondary:**
- Prisma schema language - Database models and PostgreSQL datasource in `server/prisma/schema.prisma`.
- CSS - Component/page styling in `src/Styles/*.css` and Leaflet CSS imported from `src/components/CapsMap.tsx`.
- SQL - Prisma migrations in `server/prisma/migrations/20260330212620_init/migration.sql` and `server/prisma/migrations/20260504103000_add_baixa_need_priority/migration.sql`.

## Runtime

**Environment:**
- Node.js >= 20 - Required by `server/README.md`; Docker runtime uses `node:20-bookworm-slim` in `server/Dockerfile`.
- Browser runtime - Frontend runs as a Vite static React app from `src/main.tsx` and `index.html`.

**Package Manager:**
- npm - Root scripts in `package.json`; server scripts in `server/package.json`.
- Lockfile: present for both apps, `package-lock.json` and `server/package-lock.json` with `lockfileVersion: 3`.

## Frameworks

**Core:**
- React `^18.3.1` - UI component framework used from `src/main.tsx`, `src/app/router.tsx`, and `src/components/**/*.tsx`.
- React DOM `^18.2.0` - Browser mounting via `createRoot` in `src/main.tsx`.
- React Router DOM `^7.13.1` - Hash-router routing in `src/app/router.tsx`.
- Express `^4.22.1` - REST API server configured in `server/src/app.ts` and started from `server/src/index.ts`.
- Prisma `^5.13.0` / `@prisma/client` `^5.13.0` - ORM and migrations for PostgreSQL via `server/prisma/schema.prisma` and `server/src/lib/prisma.ts`.

**Testing:**
- Node built-in test runner - Server unit tests use `node:test` and `node:assert/strict` in `server/src/services/*.test.ts`.
- tsx `^4.14.1` - Runs TypeScript tests through `npm --prefix server run test:unit` in `server/package.json`.

**Build/Dev:**
- Vite `^8.0.13` - Frontend dev server, production build, and preview configured by `vite.config.js` and `package.json`.
- `@vitejs/plugin-react` `^6.0.2` - React plugin configured in `vite.config.js`.
- TypeScript `^5.9.3` frontend / `^5.4.5` backend - Frontend compiler config in `tsconfig.json`; backend compiler config in `server/tsconfig.json`.
- tsx `^4.14.1` - Backend watch mode in `server/package.json`.
- Docker multi-stage build - Backend production image in `server/Dockerfile`.

## Key Dependencies

**Critical:**
- `react`, `react-dom`, `react-router-dom` - Core browser application stack in `src/main.tsx` and `src/app/router.tsx`.
- `express` - API routing and middleware stack in `server/src/app.ts`.
- `@prisma/client`, `prisma` - Database access through `server/src/lib/prisma.ts`, repositories in `server/src/repositories/*.ts`, migrations in `server/prisma/migrations`.
- `zod` - Request, payload, and token validation in `server/src/config/env.ts`, `server/src/routes/auth.ts`, `server/src/services/*.ts`, and `server/src/lib/jwt.ts`.
- `jsonwebtoken` - Signed admin/host sessions in `server/src/lib/jwt.ts`.
- `bcryptjs` - Password hashing and comparison in `server/src/routes/auth.ts` and `server/src/prisma/seed.ts`.

**Infrastructure:**
- `dotenv` - Loads environment configuration from `server/src/index.ts`.
- `helmet` - HTTP security headers in `server/src/app.ts`.
- `cors` - CORS allow-list enforcement in `server/src/app.ts` and `server/src/config/security.ts`.
- `cookie-parser` - Reads JWT session cookies in `server/src/app.ts` and `server/src/middleware/auth.ts`.
- `express-rate-limit` - Global, login, donation, and telemetry rate limits in `server/src/app.ts`.
- `fast-xml-parser` - Parses Campo Grande news RSS feeds in `server/src/services/highlights-service.ts`.
- `leaflet` and `react-leaflet` - Interactive map in `src/components/CapsMap.tsx`.
- `react-icons` and `@react-icons/all-files` - UI icons throughout `src/components/**/*.tsx` and `src/pages/**/*.tsx`.

## Configuration

**Environment:**
- Backend loads env through `dotenv/config` in `server/src/index.ts`.
- Production backend validates required configuration in `server/src/config/env.ts`.
- Frontend reads Vite env values from `import.meta.env` in `src/lib/api.ts`, `src/lib/auth.ts`, and `src/services/telemetry-service.ts`.
- Environment example files exist at `.env.example`, `.env.production.example`, `server/.env.example`, and `server/.env.production.example`; contents were not read.
- Key backend env names: `NODE_ENV`, `PORT`, `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, `TRUST_PROXY`, `SESSION_COOKIE_SAMESITE`, `ENABLE_LOCAL_AUTH_BYPASS`, `ENABLE_ENV_ADMIN_LOGIN`, `SEED_ADMIN_EMAIL`, `SEED_ADMIN_PASSWORD`, `SEED_ADMIN_PASSWORD_HASH`, `SEED_ADMIN_NAME`, `SEED_ADMIN_CAP_SLUG`, `LOCAL_AUTH_BYPASS_UNIT_SLUG`.
- Key frontend env names: `VITE_API_URL`, `VITE_ENABLE_LOCAL_AUTH_BYPASS`, `VITE_ENABLE_TELEMETRY`.

**Build:**
- Frontend build command: `npm run build` from `package.json`, using `vite.config.js` and `tsconfig.json`.
- Backend build command: `npm --prefix server run build` from `server/package.json`, running `prisma generate && tsc`.
- Combined deployment check: `npm run deploy:check` in `package.json`, checking scripts and running both builds.
- Vite dev server proxies `/api` to `http://localhost:3333` in `vite.config.js`.
- Backend TypeScript compiles CommonJS into `server/dist` from `server/tsconfig.json`.

## Platform Requirements

**Development:**
- Install root dependencies with `npm install` using `package-lock.json`.
- Install server dependencies with `npm --prefix server install` using `server/package-lock.json`.
- Run frontend only with `npm run dev` or `npm run dev:web` from `package.json`.
- Run frontend plus API with `npm run dev:all` from `package.json`, which starts Vite and `server/src/index.ts` through `scripts/dev-all.mjs`.
- Run backend locally with `npm --prefix server run dev`; the default API port is `3333` in `server/src/index.ts`.
- PostgreSQL >= 14 is required for normal backend development according to `server/README.md`; local fallback public data is enabled when DB connection fails outside production in `server/src/index.ts`.

**Production:**
- Frontend deploys as a static Vite build from root with output directory `dist`, documented in `DEPLOYMENT.md`.
- API deploys as a Node.js service from `server`, with entry point `server/dist/index.js`, documented in `DEPLOYMENT.md` and implemented by `server/Dockerfile`.
- Database is managed PostgreSQL through Prisma datasource `db` in `server/prisma/schema.prisma`.
- Hostinger static and Node deployment paths are documented in `DEPLOYMENT.md`.
- `vite.config.js` allows preview host `centro-doacao-caps.onrender.com`; `DEPLOYMENT.md` also references trusted proxy deployment scenarios such as Render/Ingress.

---

*Stack analysis: 2026-05-29*
