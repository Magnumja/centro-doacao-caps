# Testing Patterns

**Analysis Date:** 2026-05-29

## Test Framework

**Runner:**
- Node.js built-in test runner through `tsx --test`.
- Config: no dedicated test config file is present. The unit test command is defined in `server/package.json`.
- Test files: `server/src/services/donations-service.test.ts`, `server/src/services/highlights-service.test.ts`, `server/src/services/needs-service.test.ts`.

**Assertion Library:**
- `node:assert/strict`, imported as `assert` in all backend unit tests.

**Run Commands:**
```bash
npm --prefix server run test:unit   # Run backend unit tests
npm --prefix server run test:api    # Run manual API smoke script against a local server
npm run build:all                   # Build frontend and backend as a broader compile check
```

## Test File Organization

**Location:**
- Unit tests are co-located with backend services under `server/src/services/`.
- Frontend tests are not present under `src/`.
- Backend route, controller, repository, middleware, and Prisma integration tests are not present under `server/src/`.

**Naming:**
- Use the suffix `.test.ts`.
- Match the service filename under test: `server/src/services/needs-service.ts` has `server/src/services/needs-service.test.ts`; `server/src/services/highlights-service.ts` has `server/src/services/highlights-service.test.ts`.

**Structure:**
```text
server/src/services/
├── donations-service.ts
├── donations-service.test.ts
├── highlights-service.ts
├── highlights-service.test.ts
├── needs-service.ts
└── needs-service.test.ts
```

## Test Structure

**Suite Organization:**
```typescript
import test from 'node:test'
import assert from 'node:assert/strict'
import { NeedsService } from './needs-service'

test('NeedsService.listPaginated returns pagination contract', async () => {
  const mockRepository = {
    listPaginated: async () => [[{ id: 'n1' }, { id: 'n2' }], 5],
  }

  const service = new NeedsService(mockRepository as any)
  const result = await service.listPaginated({}, '2', '2')

  assert.equal(result.page, 2)
})
```

**Patterns:**
- Use top-level `test(...)` calls rather than nested `describe(...)` suites: `server/src/services/needs-service.test.ts`, `server/src/services/highlights-service.test.ts`.
- Name tests as behavior sentences containing the class and method under test: `NeedsService.listPaginated returns pagination contract`, `DonationsService.listByHost falls back when pagination params are invalid`.
- Instantiate services directly and inject lightweight object mocks through constructors: `new NeedsService(mockRepository as any)` in `server/src/services/needs-service.test.ts`, `new DonationsService(mockRepository as any)` in `server/src/services/donations-service.test.ts`.
- Keep Arrange/Act/Assert inline inside each test body; there are no shared `beforeEach` or `afterEach` helpers.
- Use local captured variables to verify repository call arguments: `capturedSkip`, `capturedTake`, and `deletedId` in `server/src/services/needs-service.test.ts`.

## Mocking

**Framework:** Manual object/function mocks only

**Patterns:**
```typescript
let capturedSkip: number | undefined
let capturedTake: number | undefined
const mockRepository = {
  listByUnit: async (_unitId: string, skip: number, take: number) => {
    capturedSkip = skip
    capturedTake = take
    return [[], 0]
  },
}

const service = new DonationsService(mockRepository as any)
```

```typescript
const originalFetch = globalThis.fetch
globalThis.fetch = async () => new Response(xml, {
  status: 200,
  headers: { 'Content-Type': 'application/rss+xml' },
})

try {
  const service = new HighlightsService([])
  const items = await service.listPublic()
  assert.equal(items.length, 1)
} finally {
  globalThis.fetch = originalFetch
}
```

**What to Mock:**
- Mock repositories when testing service business rules: `server/src/services/needs-service.test.ts`, `server/src/services/donations-service.test.ts`.
- Mock `globalThis.fetch` when testing RSS/news behavior in `server/src/services/highlights-service.test.ts`.
- Use empty initial data for stateful in-memory services when isolation matters: `new HighlightsService([])` in `server/src/services/highlights-service.test.ts`.

**What NOT to Mock:**
- Do not mock the service class under test.
- Do not hit Prisma or a real database in current unit tests; repository access is mocked.
- Do not call live external feeds in unit tests; `globalThis.fetch` is replaced in `server/src/services/highlights-service.test.ts`.

## Fixtures and Factories

**Test Data:**
```typescript
const xml = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0">
    <channel>
      <item>
        <title>CAPS Infantojuvenil amplia cuidado psicossocial</title>
        <description><![CDATA[Atendimento de saude mental em Campo Grande. <img src="https://cdn.example.test/caps.jpg" />]]></description>
        <link>https://www.campogrande.ms.gov.br/cgnoticias/noticia/caps-infantojuvenil/</link>
        <pubDate>Wed, 10 Sep 2025 13:38:00 +0000</pubDate>
      </item>
    </channel>
  </rss>`
```

**Location:**
- Test fixtures are inline in the test files.
- Static app data for runtime fallback lives in `src/data/mockData.ts`, `src/data/highlights.ts`, `server/src/data/public-fallback.ts`, and `server/src/data/highlights.ts`, but current unit tests do not import separate fixture modules.

## Coverage

**Requirements:** None enforced. No coverage tool or threshold is configured in `package.json`, `server/package.json`, or detected test config files.

**View Coverage:**
```bash
# Not configured
```

## Test Types

**Unit Tests:**
- Backend service unit tests exist for pagination defaults, validation failures, delete authorization, in-memory highlight CRUD, and filtered RSS feed parsing.
- Covered files include `server/src/services/needs-service.ts`, `server/src/services/donations-service.ts`, and `server/src/services/highlights-service.ts`.
- Current unit test run result: `npm --prefix server run test:unit` passes 10 tests.

**Integration Tests:**
- Automated integration tests are not present.
- `server/scripts/test-api.ts` is a manual smoke script that logs in, creates a public donation, and lists authenticated donations against `http://localhost:3333`.
- The smoke script is invoked with `npm --prefix server run test:api` and requires a running API and seeded credentials.

**E2E Tests:**
- Not used. No Playwright, Cypress, Selenium, or browser test config is present.

**Frontend Tests:**
- Not used. There are no `*.test.tsx` or `*.spec.tsx` files under `src/`.
- Frontend validation currently relies on TypeScript/Vite build checks and manual browser behavior.

## Common Patterns

**Async Testing:**
```typescript
test('NeedsService.create throws ValidationError when payload is invalid', async () => {
  const mockRepository = {
    create: async () => ({ id: 'n1' }),
  }

  const service = new NeedsService(mockRepository as any)

  await assert.rejects(
    () => service.create({ title: 'x' }, 'unit-1'),
    (error: unknown) => error instanceof ValidationError,
  )
})
```

**Error Testing:**
```typescript
await assert.rejects(
  () => service.delete('n1', { unitId: 'unit-1', role: 'host' }),
  (error: unknown) => error instanceof AppError && error.statusCode === 403,
)
```

**Stateful Service Testing:**
```typescript
const service = new HighlightsService([])
const created = service.create({
  title: 'Campanha de inverno',
  description: 'Arrecadacao de cobertores para unidades com acolhimento noturno.',
  image: '/capa.jpg',
  ctaLabel: 'Participar',
  ctaLink: '/caps',
})

assert.ok(created.id)
assert.equal(service.list().length, 1)
```

**Manual API Smoke Testing:**
```bash
npm --prefix server run test:api
```

Use `server/scripts/test-api.ts` only after the local backend is running and seeded. It performs real HTTP requests and prints status/body output; it is not part of the unit test runner.

---

*Testing analysis: 2026-05-29*
