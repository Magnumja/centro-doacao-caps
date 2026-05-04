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

test('HighlightsService loads automatic Campo Grande news filtered by mental health terms', async () => {
  const originalFetch = globalThis.fetch
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <item>
          <title>CAPS Infantojuvenil amplia cuidado psicossocial</title>
          <description><![CDATA[Atendimento de saude mental em Campo Grande. <img src="https://cdn.example.test/caps.jpg" />]]></description>
          <link>https://www.campogrande.ms.gov.br/cgnoticias/noticia/caps-infantojuvenil/</link>
          <pubDate>Wed, 10 Sep 2025 13:38:00 +0000</pubDate>
        </item>
        <item>
          <title>Obra de infraestrutura avanca em avenida</title>
          <description>Texto sobre pavimentacao e drenagem urbana.</description>
          <link>https://www.campogrande.ms.gov.br/cgnoticias/noticia/obra/</link>
          <pubDate>Wed, 11 Sep 2025 13:38:00 +0000</pubDate>
        </item>
        <item>
          <title>Vacinação contra gripe terá plantão</title>
          <description>SESAU organiza vacinação em unidades de saúde.</description>
          <link>https://www.campogrande.ms.gov.br/cgnoticias/noticia/vacinacao/</link>
          <pubDate>Wed, 12 Sep 2025 13:38:00 +0000</pubDate>
        </item>
      </channel>
    </rss>`

  globalThis.fetch = async () => new Response(xml, {
    status: 200,
    headers: { 'Content-Type': 'application/rss+xml' },
  })

  try {
    const service = new HighlightsService([])
    const items = await service.listPublic()

    assert.equal(items.length, 1)
    assert.equal(items[0].title, 'CAPS Infantojuvenil amplia cuidado psicossocial')
    assert.equal(items[0].ctaLabel, 'Ler notícia')
    assert.equal(items[0].image, 'https://cdn.example.test/caps.jpg')
  } finally {
    globalThis.fetch = originalFetch
  }
})
