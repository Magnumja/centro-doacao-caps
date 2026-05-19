# Backend Improvement Plan

**Date:** 2026-05-19
**Status:** Proposed. Not approved for implementation.
**Rule:** No implementation file should be modified until the user approves a scoped phase.

## Recommended Order

1. Add tests around current backend behavior.
2. Refactor route organization only after contracts are locked.
3. Harden public-write and PII handling decisions.
4. Review Prisma/query scaling and migrations separately.
5. Tighten deploy/operations docs and non-durable service expectations.

## Phase A: Contract and Security Test Baseline

**Goal:** Protect current behavior before touching implementation code.

**Would modify or add files:**

- `server/package.json`
- `server/src/config/security.ts` only if testability requires exported helpers
- `server/src/middleware/auth.ts` only if testability requires small helper extraction
- New tests under `server/src` such as:
  - `server/src/routes/auth.test.ts`
  - `server/src/routes/donations.test.ts`
  - `server/src/config/security.test.ts`
  - `server/src/middleware/auth.test.ts`

**Checks to cover:**

- Login rejects bad credentials.
- `/api/auth/me` rejects missing/invalid cookie.
- Cookie options match production/development expectations.
- Production unsafe methods require trusted origin and `X-CSRF-Protection`.
- Local auth bypass cannot work in production.
- Donation create clears donor name/email when anonymous.
- Donation create rejects invalid unit/category/date/time.

**Risk:** Low if tests use dependency injection/mocks and avoid changing runtime behavior.

## Phase B: Route Organization Cleanup

**Goal:** Make backend domains follow consistent route/controller/service/repository boundaries.

**Would modify or add files:**

- `server/src/routes/auth.ts`
- `server/src/routes/units.ts`
- `server/src/routes/residents.ts`
- `server/src/controllers/auth-controller.ts`
- `server/src/controllers/units-controller.ts`
- `server/src/controllers/residents-controller.ts`
- `server/src/services/auth-service.ts`
- `server/src/services/units-service.ts`
- `server/src/services/residents-service.ts`
- `server/src/repositories/auth-repository.ts`
- `server/src/repositories/units-repository.ts`
- `server/src/repositories/residents-repository.ts`
- Existing tests from Phase A plus new service tests as needed.

**Approach:**

1. Move one domain at a time.
2. Keep route paths and response shapes unchanged.
3. Reuse existing `AppError`, `ValidationError` and `asyncHandler` patterns.
4. Keep Prisma in repositories except where a route is intentionally infrastructure-only.

**Risk:** Medium because auth response shapes and resident permissions are user-visible API contracts.

## Phase C: Public Write Abuse and PII Policy

**Goal:** Reduce operational and privacy risk without breaking donor flow.

**Would modify or add files after approval:**

- `server/src/services/donations-service.ts`
- `server/src/repositories/donations-repository.ts`
- `server/src/routes/donations.ts`
- `server/prisma/schema.prisma` only if statuses/retention fields are approved
- `server/prisma/migrations/*` only if schema changes are approved
- `DEPLOYMENT.md`
- `server/README.md`

**Decision points before implementation:**

- Keep current public unauthenticated donation creation or add CAPTCHA/email confirmation?
- Add donation status workflow now or defer?
- Define donor/resident retention period?
- Add admin deletion/export flows now or later?

**Risk:** Medium to high if schema or user flow changes are included. Keep this separate from route refactor.

## Phase D: Prisma Query and Scaling Review

**Goal:** Make data access safe for growing data volumes.

**Would modify or add files after approval:**

- `server/prisma/schema.prisma`
- `server/prisma/migrations/*`
- `server/src/repositories/needs-repository.ts`
- `server/src/repositories/donations-repository.ts`
- `server/src/routes/residents.ts`
- `server/src/services/residents-service.ts` if Phase B has created it
- `server/src/utils/pagination.ts`

**Potential improvements:**

- Add pagination to residents.
- Review indexes for `unitId`, `priority`, `registeredAt`, `createdAt`.
- Clarify whether need filtering should accept unit id, slug, or both.
- Consider DateTime fields for donation/resident dates in a migration-only phase.

**Risk:** Medium for pagination response changes; high for date type migrations. Split schema changes carefully.

## Phase E: Deploy and Operations Hardening

**Goal:** Make production setup repeatable and less dependent on tribal knowledge.

**Would modify or add files after approval:**

- `DEPLOYMENT.md`
- `server/README.md`
- `server/Dockerfile`
- `docker-compose.yml`
- `.env.example`
- `.env.production.example`
- `server/.env.example`
- `server/.env.production.example`
- `package.json`
- `server/package.json`
- `server/src/services/highlights-service.ts`
- `server/src/services/telemetry-service.ts`

**Potential improvements:**

- Clarify migration/seed order by platform.
- Decide whether to add an active local `docker-compose.yml` for PostgreSQL/API.
- Document non-durable highlights and telemetry.
- Pin Prisma versions if release stability matters.
- Add production deploy check script that includes backend tests and migration dry-run where feasible.

**Risk:** Low for docs/scripts, medium if Docker runtime or service persistence changes.

## Files Not To Touch Without Separate Approval

- `server/prisma/schema.prisma`
- `server/prisma/migrations/*`
- `server/src/routes/auth.ts`
- `server/src/middleware/auth.ts`
- `server/src/config/security.ts`
- `server/src/lib/session-cookie.ts`
- `server/src/lib/jwt.ts`

These files are security- or data-sensitive and should only change with tests and a narrow phase plan.

## Proposed Immediate Next Step

Start with Phase A only.

Approval request should list:

- Exact test files to add.
- Whether small exports/helper extraction are allowed for testability.
- Commands to run: `npm --prefix server run build`, `npm --prefix server run test:unit`, and the new route/security test command.
- Explicit non-goal: no endpoint behavior changes.

---
*Plan proposed: 2026-05-19*
