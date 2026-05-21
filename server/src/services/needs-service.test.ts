import test from 'node:test'
import assert from 'node:assert/strict'
import { NeedsService } from './needs-service'
import { AppError } from '../errors/app-error'
import { ValidationError } from '../errors/validation-error'

test('NeedsService.listPaginated returns pagination contract', async () => {
  const mockRepository = {
    listPaginated: async () => [[{ id: 'n1' }, { id: 'n2' }], 5],
  }

  const service = new NeedsService(mockRepository as any)
  const result = await service.listPaginated({}, '2', '2')

  assert.equal(result.page, 2)
  assert.equal(result.limit, 2)
  assert.equal(result.total, 5)
  assert.equal(result.hasMore, true)
  assert.equal(result.data.length, 2)
})

test('NeedsService.listPaginated falls back when pagination params are invalid', async () => {
  let capturedSkip: number | undefined
  let capturedTake: number | undefined
  const mockRepository = {
    listPaginated: async (_filters: unknown, skip: number, take: number) => {
      capturedSkip = skip
      capturedTake = take
      return [[], 0]
    },
  }

  const service = new NeedsService(mockRepository as any)
  const result = await service.listPaginated({}, 'abc', 'xyz')

  assert.equal(capturedSkip, 0)
  assert.equal(capturedTake, 12)
  assert.equal(result.page, 1)
  assert.equal(result.limit, 12)
})

test('NeedsService.create accepts baixa priority used by the public contract', async () => {
  const mockRepository = {
    create: async (data: unknown) => ({ id: 'n1', data }),
  }

  const service = new NeedsService(mockRepository as any)
  const result = await service.create({
    title: 'Itens de apoio',
    amount: 3,
    description: 'Itens de baixa prioridade para reposicao planejada.',
    category: 'Outros',
    priority: 'baixa',
  }, 'unit-1') as any

  assert.equal(result.data.priority, 'baixa')
})

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

test('NeedsService.delete removes need from the authenticated host unit', async () => {
  let deletedId: string | undefined
  const mockRepository = {
    findById: async () => ({ id: 'n1', unitId: 'unit-1' }),
    delete: async (id: string) => {
      deletedId = id
    },
  }

  const service = new NeedsService(mockRepository as any)
  await service.delete('n1', { unitId: 'unit-1', role: 'host' })

  assert.equal(deletedId, 'n1')
})

test('NeedsService.delete allows admins to remove needs from other units', async () => {
  let deletedId: string | undefined
  const mockRepository = {
    findById: async () => ({ id: 'n1', unitId: 'unit-2' }),
    delete: async (id: string) => {
      deletedId = id
    },
  }

  const service = new NeedsService(mockRepository as any)
  await service.delete('n1', { unitId: 'unit-1', role: 'admin' })

  assert.equal(deletedId, 'n1')
})

test('NeedsService.delete rejects hosts from other units', async () => {
  const mockRepository = {
    findById: async () => ({ id: 'n1', unitId: 'unit-2' }),
    delete: async () => {
      throw new Error('delete should not be called')
    },
  }

  const service = new NeedsService(mockRepository as any)

  await assert.rejects(
    () => service.delete('n1', { unitId: 'unit-1', role: 'host' }),
    (error: unknown) => error instanceof AppError && error.statusCode === 403,
  )
})
