# Phase 1: Backend Diagnostic - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md - this log preserves the alternatives considered.

**Date:** 2026-05-19
**Phase:** 1-Backend Diagnostic
**Areas discussed:** Backend organization, Security and tests, Prisma/data/deploy

---

## Area Selection

| Option | Description | Selected |
|--------|-------------|----------|
| Todas principais | Cobre testes/seguranca, organizacao de rotas, Prisma/dados e deploy antes de gerar CONTEXT.md. | yes |
| Seguranca/testes | Foca em auth, cookies, CORS/CSRF, bypass local, doacoes publicas e cobertura de testes. | |
| Organizacao/deploy | Foca em rotas/controllers/services, Prisma, variaveis de ambiente e caminho de publicacao. | |

**User's choice:** 1
**Notes:** User selected all main areas.

---

## Backend Organization

| Option | Description | Selected |
|--------|-------------|----------|
| Testes e seguranca primeiro | Create coverage for auth, cookies, CORS/CSRF, local bypass, public donations and PII before refactors. | |
| Organizacao de backend primeiro | Start by standardizing routes/controllers/services/repositories, with tests alongside or immediately after. | yes |
| Deploy/producao primeiro | Focus on environment variables, Docker, migrations, seed, proxy/cookies and publication docs first. | |

**User's choice:** 2
**Notes:** Backend organization should lead the first implementation plan.

| Option | Description | Selected |
|--------|-------------|----------|
| Padronizar tudo em route -> controller -> service -> repository | Move all domains toward the same layering pattern used by needs/donations. | yes |
| Padronizar so dominios com regra de negocio | Layer core domains, keep simpler routes for units/telemetry/highlights where appropriate. | |
| Refactor minimo por risco | Touch only concrete problem areas first. | |

**User's choice:** 1
**Notes:** Target pattern is full backend standardization.

| Option | Description | Selected |
|--------|-------------|----------|
| Permitir mudancas com testes antes/depois | Sensitive files may change if each change is small and tested. | |
| Congelar seguranca/Prisma no primeiro refactor | Organize less-sensitive domains first; leave auth/security/Prisma for separate phases. | yes |
| Alterar auth, mas congelar Prisma | Auth may be organized, but schema/migrations stay untouched. | |

**User's choice:** 2
**Notes:** First refactor should avoid auth/security/JWT/cookies/Prisma/migrations.

| Option | Description | Selected |
|--------|-------------|----------|
| Contrato identico | Paths, status codes, JSON responses and error messages remain identical. | |
| Contrato compativel com pequenas limpezas | Small cleanup allowed when documented and tested. | yes |
| Contrato pode melhorar onde houver problema | Response shapes and errors may improve now even if frontend needs adjustment. | |

**User's choice:** 2
**Notes:** Compatibility is required, but clear inconsistencies may be cleaned up with tests.

---

## Security and Tests

| Option | Description | Selected |
|--------|-------------|----------|
| Testes de contrato por rota | Verify endpoint behavior through HTTP status, JSON, auth, errors and unit scoping. | yes |
| Testes unitarios por service | Focus on service/repository tests with mocks. | |
| Misto minimo | Unit service tests plus a few HTTP tests for sensitive endpoints. | |

**User's choice:** 1
**Notes:** Route-level contract tests are required for meaningful refactors.

| Option | Description | Selected |
|--------|-------------|----------|
| Manter fluxo publico atual, so testar e monitorar | Do not add CAPTCHA/email now; cover validation, rate limit/origin/CSRF and anonymous data clearing. | |
| Planejar mitigacao anti-spam ja | Evaluate CAPTCHA, honeypot or simple verification for public donations. | yes |
| Restringir doacao a contato/admin | Reduce or remove the public creation endpoint. | |

**User's choice:** 2
**Notes:** Public donation endpoint can remain public, but anti-spam mitigation should be planned now.

| Option | Description | Selected |
|--------|-------------|----------|
| Documentar retencao minima agora | Define simple policy: collect only necessary data, clear anonymous donations, avoid long browser storage, manual deletion. | yes |
| Criar fluxo completo de privacidade | Plan export, deletion, audit and formal retention workflows. | |
| Adiar politica formal | Only ensure refactors do not increase data exposure. | |

**User's choice:** 1
**Notes:** Minimum PII retention posture should be documented now.

| Option | Description | Selected |
|--------|-------------|----------|
| Somente mapear e criar backlog tecnico | Do not touch auth/security files now; record tests and risks for future phase. | yes |
| Adicionar testes sem refactor | Add auth/security contract tests now, but do not reorganize sensitive files. | |
| Permitir pequenas correcoes criticas | Avoid refactor, but fix critical issues if found. | |

**User's choice:** 1
**Notes:** Auth/security remain backlog-only in the first refactor.

---

## Prisma, Data and Deploy

| Option | Description | Selected |
|--------|-------------|----------|
| Congelar schema/migrations totalmente | No `schema.prisma` or migration changes in first cycle. | |
| Permitir indices sem mudar modelos | Plan indexes for frequent filters, without changing fields or relations. | yes |
| Planejar melhorias de modelo ja | Evaluate DateTime fields, donation status, retention fields and migrations. | |

**User's choice:** 2
**Notes:** Index planning is allowed; model and relation changes are not.

| Option | Description | Selected |
|--------|-------------|----------|
| Paginar listas protegidas agora | Plan pagination for `residents` and admin lists that can grow. | yes |
| Somente documentar risco | Keep endpoints as-is in first refactor. | |
| Paginar so onde o frontend ja suporta | Avoid changing array-returning endpoints until frontend supports it. | |

**User's choice:** 1
**Notes:** Protected/admin lists should be paginated now with contract care.

| Option | Description | Selected |
|--------|-------------|----------|
| Documentar e alinhar comandos existentes | Clarify build, migrations, seed, env, proxy and cookies. No Docker Compose now. | |
| Adicionar Docker Compose local | Plan functional local PostgreSQL/API compose setup. | |
| Focar so producao | Review Hostinger/Render/Node deploy, env vars, cookies and migrations. | yes |

**User's choice:** 3
**Notes:** Production deploy is the priority; local Docker Compose is deferred.

| Option | Description | Selected |
|--------|-------------|----------|
| Documentar como limitacao aceita por enquanto | Document restart loss and multi-instance divergence. No persistence now. | yes |
| Persistir highlights, manter telemetry leve | Save highlights in database, leave telemetry temporary. | |
| Persistir ambos ou remover de producao | Do not leave operational state in memory in production. | |

**User's choice:** 1
**Notes:** In-memory highlights and telemetry are accepted for now with documentation.

## the agent's Discretion

- Choose the first less-sensitive domain to refactor based on risk and dependency order.
- Choose specific HTTP contract test tooling and mocking strategy.
- Decide whether pagination belongs in the first executable plan or needs a separate plan if frontend compatibility risk is high.

## Deferred Ideas

- Auth/security refactor.
- Prisma model/migration changes.
- Full privacy/export/audit workflow.
- Persistence for highlights and telemetry.
- Docker Compose local setup.
