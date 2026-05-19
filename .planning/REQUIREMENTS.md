# Requirements: Centro Doacao CAPS Backend Stabilization

**Defined:** 2026-05-19
**Core Value:** O backend precisa registrar e proteger dados operacionais de doacoes, unidades, residentes e administradores de forma confiavel, segura e implantavel em producao.

## v1 Requirements

### Backend Audit

- [ ] **AUD-01**: Backend routes, controllers, services, middleware, Prisma schema, env files and deploy docs are reviewed against the current codebase.
- [ ] **AUD-02**: Current working behavior is documented before any code changes.
- [ ] **AUD-03**: Risks are prioritized by security, data correctness, deploy impact and implementation blast radius.
- [ ] **AUD-04**: Planned implementation files are listed before code changes begin.

### API Organization

- [ ] **API-01**: Backend domains have a clear target layering strategy for routes, controllers, services and repositories.
- [ ] **API-02**: Route-local Prisma usage is classified as keep, wrap, or refactor.
- [ ] **API-03**: Public and admin endpoint behavior is preserved while future refactors are planned.
- [ ] **API-04**: API response contracts and error formats are identified before refactoring.

### Security and Privacy

- [ ] **SEC-01**: Auth, cookie, JWT, CORS, CSRF and trusted-origin behavior is documented and covered in the improvement plan.
- [ ] **SEC-02**: Local/dev auth bypass and environment-admin login paths are isolated as production-risk areas.
- [ ] **SEC-03**: Public donation write abuse risk is documented with mitigation options.
- [ ] **SEC-04**: PII handling for donations, residents and browser donor history is documented with retention/deletion recommendations.

### Database and Prisma

- [ ] **DB-01**: Prisma schema fields, relationships, migrations and seed behavior are reviewed for correctness and future migration risk.
- [ ] **DB-02**: Query patterns that need pagination, indexes or unit scoping are identified.
- [ ] **DB-03**: Any proposed schema change is deferred to an approved implementation phase with migration plan.

### Deployment and Operations

- [ ] **DEP-01**: Backend build, tests and production dependency audit are executed and recorded.
- [ ] **DEP-02**: Required production environment variables and deploy commands are documented.
- [ ] **DEP-03**: Dockerfile, platform deployment docs and migration/seed flow are reviewed for gaps.
- [ ] **DEP-04**: In-memory services and external RSS integration limitations are documented.

### Testing

- [ ] **TST-01**: Current backend test coverage is summarized.
- [ ] **TST-02**: Missing route-level security tests are identified.
- [ ] **TST-03**: Missing donation creation/privacy tests are identified.
- [ ] **TST-04**: Missing deploy/config validation tests are identified.

## v2 Requirements

### Product Operations

- **OPS-01**: Admin can manage resident records through the UI.
- **OPS-02**: Admin can manage profile and password through implemented backend endpoints and UI flows.
- **OPS-03**: Donation lifecycle supports statuses such as received, scheduled, delivered, rejected or spam.
- **OPS-04**: Highlights and telemetry can be persisted outside process memory when production operations require it.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Immediate backend refactor | User requested analysis and approval gate first |
| Frontend UI implementation | Initial focus is backend review and improvement plan |
| Replacing Express or Prisma | Current stack works and should be stabilized first |
| Running production migrations | Requires separate approval and database backup/rollback plan |
| Changing auth UX | Backend security can be planned first without changing user-facing flow |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUD-01 | Phase 1 | Pending |
| AUD-02 | Phase 1 | Pending |
| AUD-03 | Phase 1 | Pending |
| AUD-04 | Phase 1 | Pending |
| API-01 | Phase 2 | Pending |
| API-02 | Phase 2 | Pending |
| API-03 | Phase 2 | Pending |
| API-04 | Phase 2 | Pending |
| SEC-01 | Phase 3 | Pending |
| SEC-02 | Phase 3 | Pending |
| SEC-03 | Phase 3 | Pending |
| SEC-04 | Phase 3 | Pending |
| DB-01 | Phase 4 | Pending |
| DB-02 | Phase 4 | Pending |
| DB-03 | Phase 4 | Pending |
| DEP-01 | Phase 5 | Pending |
| DEP-02 | Phase 5 | Pending |
| DEP-03 | Phase 5 | Pending |
| DEP-04 | Phase 5 | Pending |
| TST-01 | Phase 3 | Pending |
| TST-02 | Phase 3 | Pending |
| TST-03 | Phase 3 | Pending |
| TST-04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 23 total
- Mapped to phases: 23
- Unmapped: 0

---
*Requirements defined: 2026-05-19*
*Last updated: 2026-05-19 after backend-first project initialization*
