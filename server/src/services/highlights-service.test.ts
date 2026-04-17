import test from 'node:test'
import assert from 'node:assert/strict'
import { HighlightsService } from './highlights-service'

test('HighlightsService CRUD flow works', () => {
  const service = new HighlightsService([])

  const created = service.create({
    title: 'Campanha de inverno',
    description: 'Arrecadação de cobertores para unidades com acolhimento noturno.',
    image: '/capa.jpg',
    ctaLabel: 'Participar',
    ctaLink: '/caps',
  })

  assert.ok(created.id)
  assert.equal(service.list().length, 1)

  const updated = service.update(created.id, { title: 'Campanha de inverno 2026' })
  assert.equal(updated.title, 'Campanha de inverno 2026')

  service.remove(created.id)
  assert.equal(service.list().length, 0)
})
