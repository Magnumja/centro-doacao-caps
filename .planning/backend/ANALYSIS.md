# Backend Analysis

**Date:** 2026-05-19
**Scope:** `server/`, backend-related env/deploy docs, Prisma schema and `.planning/codebase/`
**Constraint:** Analysis only. No implementation code changed.

## Sources Reviewed

- `.planning/codebase/STACK.md`
- `.planning/codebase/ARCHITECTURE.md`
- `.planning/codebase/STRUCTURE.md`
- `.planning/codebase/CONCERNS.md`
- `server/package.json`
- `server/src/index.ts`
- `server/src/app.ts`
- `server/src/config/env.ts`
- `server/src/config/security.ts`
- `server/src/middleware/auth.ts`
- `server/src/lib/jwt.ts`
- `server/src/lib/session-cookie.ts`
- `server/src/routes/*.ts`
- `server/src/controllers/*.ts`
- `server/src/services/*.ts`
- `server/src/repositories/*.ts`
- `server/prisma/schema.prisma`
- `server/.env.example`
- `server/.env.production.example`
- `server/Dockerfile`
- `DEPLOYMENT.md`

## Validation Run

| Command | Result |
|---------|--------|
| `npm --prefix server run build` | Passed |
| `npm --prefix server run test:unit` | Passed, 7 tests |
| `npm --prefix server audit --omit=dev --audit-level=moderate` | Passed, 0 vulnerabilities |

## Backend Structure

The backend is an Express API with Prisma/PostgreSQL persistence.

Current major entry points:

- `server/src/index.ts` validates env, connects Prisma and starts the app.
- `server/src/app.ts` installs security middleware, body parsing, rate limiters, routes, healthcheck and error handlers.
- `server/prisma/schema.prisma` defines Unit, Need, Host, Donation and Resident.

Layering is mixed:

- `server/src/routes/needs.ts` -> `server/src/controllers/needs-controller.ts` -> `server/src/services/needs-service.ts` -> `server/src/repositories/needs-repository.ts`
- `server/src/routes/donations.ts` -> `server/src/controllers/donations-controller.ts` -> `server/src/services/donations-service.ts` -> `server/src/repositories/donations-repository.ts`
- `server/src/routes/auth.ts`, `server/src/routes/units.ts` and `server/src/routes/residents.ts` use Prisma or auth logic directly in route modules.
- `server/src/routes/highlights.ts` and `server/src/routes/telemetry.ts` delegate to singleton services, but those services keep process-local state.

## Routes and Domains

### Auth

Files:

- `server/src/routes/auth.ts`
- `server/src/middleware/auth.ts`
- `server/src/lib/jwt.ts`
- `server/src/lib/session-cookie.ts`
- `server/src/config/env.ts`

Current behavior:

- Login validates email/password through Zod.
- Supports database hosts and optional env-admin login.
- Signs JWT with issuer/audience and stores it in an httpOnly cookie.
- `/api/auth/me` returns the current host, with special handling for local bypass and env-admin tokens.
- `requireAuth` supports local bypass only in development, localhost and loopback conditions.

Risks:

- Auth route has several responsibilities in one file: credential validation, env-admin login, database lookup, token issue, cookie behavior and `/me` response shaping.
- Local bypass and env-admin login are powerful paths that need route-level tests.
- `/api/auth/me` returns a `password: ''` field, which is not secret but keeps password in the API shape unnecessarily.

### Units

Files:

- `server/src/routes/units.ts`
- `server/src/data/public-fallback.ts`

Current behavior:

- Public list and detail endpoints.
- Fallback data is returned when `API_MOCK_MODE=true`.
- Uses direct Prisma queries in route handlers.

Risks:

- No service/repository boundary around unit read contracts.
- Detail endpoint includes needs without pagination.
- Fallback and live shapes need contract tests to prevent divergence.

### Needs

Files:

- `server/src/routes/needs.ts`
- `server/src/controllers/needs-controller.ts`
- `server/src/services/needs-service.ts`
- `server/src/repositories/needs-repository.ts`

Current behavior:

- Public list supports optional priority, unitId and pagination.
- Authenticated create uses the host unit id.
- Service validates create payload with Zod.

Risks:

- Query param `unitId` can represent a unit id in live mode but fallback accepts id or slug; callers may rely on ambiguous behavior.
- More route-level tests are needed for invalid query params and auth-protected create behavior.

### Donations

Files:

- `server/src/routes/donations.ts`
- `server/src/controllers/donations-controller.ts`
- `server/src/services/donations-service.ts`
- `server/src/repositories/donations-repository.ts`

Current behavior:

- Public `POST /api/donations` creates donation records by unit slug.
- Authenticated `GET /api/donations` lists donations scoped to current host unit.
- Authenticated `DELETE /api/donations/:id` allows same-unit host or admin deletion.
- Anonymous donations clear donor name/email before persistence.

Risks:

- Public write endpoint can be abused even with validation, trusted origin, CSRF header and rate limit.
- Donation create privacy behavior is not directly covered by tests.
- Single frontend action can create multiple donation records, so partial failures need a future design decision.

### Residents

Files:

- `server/src/routes/residents.ts`
- `server/prisma/schema.prisma`

Current behavior:

- All resident routes require auth.
- List is scoped to current host unit.
- Create uses current host unit.
- Update/delete allow same-unit host or admin.

Risks:

- CRUD logic and Prisma queries live directly in the route.
- List is unpaginated.
- PII fields such as `name` and `emergencyContact` need retention/deletion policy.
- No route tests cover unit scoping or admin override.

### Highlights

Files:

- `server/src/routes/highlights.ts`
- `server/src/services/highlights-service.ts`

Current behavior:

- Public list returns automatic Campo Grande RSS news plus in-memory highlights.
- Admin create/update/delete mutate process-local highlights.
- RSS fetches are limited by allowed host, max bytes and timeout.

Risks:

- Admin-created highlights are lost on restart.
- Multiple API instances will diverge.
- Cache miss can fan out to many RSS requests and wait for slow feeds.
- XML parsing and HTML stripping need more malformed-input tests.

### Telemetry

Files:

- `server/src/routes/telemetry.ts`
- `server/src/services/telemetry-service.ts`

Current behavior:

- Public `POST /api/telemetry` validates and stores events in memory.
- Admin summary requires admin auth.
- Events are capped at 1000.

Risks:

- In-memory telemetry is not durable and diverges across processes.
- Public endpoint accepts writes from browsers and needs continued rate-limit and payload-limit coverage.

## Middleware and Security

Positive signals:

- `helmet` is installed.
- `x-powered-by` is disabled.
- CORS uses an origin delegate.
- Unsafe methods require trusted origin and production anti-CSRF header.
- JSON body size is limited to 64kb.
- Login, donation and telemetry routes have specialized rate limits.
- Production env validation blocks local auth bypass and requires HTTPS frontend origins.

Main risks:

- Security behavior is concentrated in middleware/config, but there are no dedicated route or integration tests for CORS, CSRF, cookie options or bypass constraints.
- `TRUST_PROXY` must be correct in production for secure cookies, request origin checks and rate-limit IP behavior behind hosting providers.
- `SESSION_COOKIE_SAMESITE=none` is valid only with HTTPS and cross-site frontend/API deployment; docs and env examples should keep this exact.

## Prisma and Database

Current schema:

- `Unit` has needs, donations, residents and hosts.
- `Need` has priority enum `alta | media | baixa`.
- `Host` has email/password/role and unit.
- `Donation` stores category, quantity, donor identity fields, date/time and unit.
- `Resident` stores name, emergency contact, entry date, status and unit.

Risks:

- Donation `date`, `time` and resident `entryDate` are strings, so calendar validation is format-only unless service logic adds semantic validation.
- Common filters such as `unitId`, `priority` and `registeredAt` may need indexes as data grows.
- Resident list is unpaginated.
- Schema contains PII and needs documented retention/deletion expectations before expanding admin features.

## Env and Deploy

Positive signals:

- `server/.env.example` and `server/.env.production.example` document required backend variables.
- `DEPLOYMENT.md` documents static frontend, backend service, migrations and seed flow.
- `server/Dockerfile` builds from `node:20-bookworm-slim`, installs runtime OpenSSL/CA certs, runs build and prunes dev dependencies.

Risks:

- `docker-compose.yml` was mapped as having no active service definition, so local container orchestration is unclear.
- Production deploy requires correct ordering: build, env validation, migration deploy, seed once, then runtime.
- Env-admin login and seed credential behavior must be explicit for production operators.
- In-memory highlights/telemetry should be documented as non-durable before horizontal scaling.

## Test Coverage

Current tests:

- Backend service tests for donations pagination, highlights CRUD/news filtering and needs pagination/create validation.

Missing high-value tests:

- Auth login/logout/me route behavior.
- Cookie options under production/development.
- CORS/origin/CSRF rejection behavior.
- Local auth bypass disabled in production.
- Donation create validation, anonymous PII clearing and unknown unit slug.
- Resident unit scoping and admin override.
- Fallback/live shape consistency for units and needs.
- RSS malformed feed, timeout and oversized response behavior.

## Prioritized Risks

### High

1. Route-level security behavior has little automated coverage.
2. Public donation writes can create spam or junk operational records.
3. Resident and donation PII lack explicit retention/deletion policy.
4. Local/dev auth bypass and env-admin paths are powerful and need tests around disabled production behavior.

### Medium

1. Mixed route organization makes future changes harder and less testable.
2. Resident and some unit/needs reads are unpaginated.
3. Highlights and telemetry are process-local and non-durable.
4. Deploy path depends on careful env/proxy/cookie configuration.

### Low

1. Encoding drift/mojibake exists in some literals and docs.
2. Dependency version ranges allow minor Prisma drift.
3. Docker compose story is unclear, but Dockerfile exists for backend image builds.

## Conclusion

The backend is functional and has a reasonable security baseline, but the next work should be test-first and behavior-preserving. The safest first implementation phase is not a refactor; it is adding route/config/security tests around current behavior, then refactoring the most direct-Prisma route modules after those tests lock contracts.

---
*Analysis completed: 2026-05-19*
