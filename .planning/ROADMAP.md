# Roadmap: Centro Doacao CAPS Backend Stabilization

**Created:** 2026-05-19
**Mode:** standard
**Current constraint:** No implementation code changes until the user approves a specific plan.

## Phase Overview

| Phase | Name | Goal | Requirements |
|-------|------|------|--------------|
| 1 | Backend Diagnostic | Document current backend structure, risks and validation signals without code changes | AUD-01, AUD-02, AUD-03, AUD-04 |
| 2 | API Organization Plan | Define behavior-preserving route/controller/service/repository cleanup plan | API-01, API-02, API-03, API-04 |
| 3 | Security and Test Plan | Plan tests and mitigations for auth, CORS, CSRF, public writes and PII | SEC-01, SEC-02, SEC-03, SEC-04, TST-01, TST-02, TST-03 |
| 4 | Prisma and Data Plan | Review schema, query patterns, indexes, unit scoping and migration risk | DB-01, DB-02, DB-03 |
| 5 | Deploy and Operations Plan | Review production env, Docker/deploy flow, migrations, seeds and runtime integrations | DEP-01, DEP-02, DEP-03, DEP-04, TST-04 |

## Phase Details

### Phase 1: Backend Diagnostic

**Goal:** Produce a clear backend assessment based on `.planning/codebase/` and direct inspection of `server/`.

**Success Criteria:**
1. Current backend layers and route ownership are documented.
2. Current validation signals are recorded.
3. Initial risk list is prioritized.
4. No implementation files are modified.

**Files created/updated in this phase:**
- `.planning/PROJECT.md`
- `.planning/REQUIREMENTS.md`
- `.planning/ROADMAP.md`
- `.planning/STATE.md`
- `.planning/backend/ANALYSIS.md`
- `.planning/backend/IMPROVEMENT_PLAN.md`

### Phase 2: API Organization Plan

**Goal:** Prepare a behavior-preserving backend organization cleanup.

**Potential implementation files if approved later:**
- `server/src/routes/auth.ts`
- `server/src/routes/units.ts`
- `server/src/routes/residents.ts`
- `server/src/routes/highlights.ts`
- `server/src/routes/telemetry.ts`
- `server/src/controllers/*.ts`
- `server/src/services/*.ts`
- `server/src/repositories/*.ts`
- `server/src/errors/*.ts`

**Success Criteria:**
1. Route-local Prisma usage is categorized.
2. A target layering pattern is defined for each backend domain.
3. Refactor order minimizes response-contract risk.
4. Tests needed before refactor are listed.

### Phase 3: Security and Test Plan

**Goal:** Add confidence around production-sensitive behavior before changing auth or request security code.

**Potential implementation files if approved later:**
- `server/src/config/security.ts`
- `server/src/config/env.ts`
- `server/src/middleware/auth.ts`
- `server/src/lib/jwt.ts`
- `server/src/lib/session-cookie.ts`
- `server/src/routes/auth.ts`
- `server/src/routes/donations.ts`
- `server/src/services/donations-service.ts`
- `server/src/services/*.test.ts`
- possible new route/security test files under `server/src`

**Success Criteria:**
1. Auth, cookie, CORS, CSRF and bypass behavior has test coverage.
2. Donation creation validation and anonymous PII clearing are tested.
3. Public write abuse mitigations are decided.
4. Production env validation remains strict.

### Phase 4: Prisma and Data Plan

**Goal:** Prepare safe database improvements without accidental migration risk.

**Potential implementation files if approved later:**
- `server/prisma/schema.prisma`
- `server/prisma/migrations/*`
- `server/src/prisma/seed.ts`
- `server/src/repositories/needs-repository.ts`
- `server/src/repositories/donations-repository.ts`
- `server/src/routes/residents.ts`
- `server/src/services/needs-service.ts`

**Success Criteria:**
1. Query paths needing pagination or indexes are identified.
2. Unit scoping rules are documented for every protected data path.
3. Schema changes are split into independent migrations.
4. Seed behavior is safe for production-like environments.

### Phase 5: Deploy and Operations Plan

**Goal:** Make deployment repeatable and observable before production hardening.

**Potential implementation files if approved later:**
- `DEPLOYMENT.md`
- `server/README.md`
- `server/Dockerfile`
- `docker-compose.yml`
- `package.json`
- `server/package.json`
- `.env.example`
- `.env.production.example`
- `server/.env.example`
- `server/.env.production.example`
- `server/src/services/highlights-service.ts`
- `server/src/services/telemetry-service.ts`

**Success Criteria:**
1. Build, migrations, seed and start commands are consistent across docs and package scripts.
2. Docker image expectations are documented.
3. In-memory highlights/telemetry limitations are explicit.
4. Deploy checklist covers env validation, proxy, cookies and database migration order.

## Approval Gate

Before implementation starts, present a scoped phase plan with:

1. Files to modify.
2. Behavioral risks.
3. Tests to add or run.
4. Rollback or revert strategy.
5. Confirmation request from the user.

No implementation phase is approved yet.

---
*Roadmap created: 2026-05-19*
