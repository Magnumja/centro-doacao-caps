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

// Datas relativas: o filtro de idade (1 ano) não pode fazer o teste quebrar com o tempo.
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toUTCString()

test('HighlightsService loads automatic Campo Grande news filtered by mental health terms', async () => {
  const originalFetch = globalThis.fetch
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0">
      <channel>
        <item>
          <title>CAPS Infantojuvenil amplia cuidado psicossocial</title>
          <description><![CDATA[Atendimento de saude mental em Campo Grande. <img src="https://cdn.example.test/caps.jpg" />]]></description>
          <link>https://www.campogrande.ms.gov.br/cgnoticias/noticia/caps-infantojuvenil/</link>
          <pubDate>${daysAgo(3)}</pubDate>
        </item>
        <item>
          <title>Obra de infraestrutura avanca em avenida</title>
          <description>Texto sobre pavimentacao e drenagem urbana.</description>
          <link>https://www.campogrande.ms.gov.br/cgnoticias/noticia/obra/</link>
          <pubDate>${daysAgo(2)}</pubDate>
        </item>
        <item>
          <title>Vacinação contra gripe terá plantão</title>
          <description>SESAU organiza vacinação em unidades de saúde.</description>
          <link>https://www.campogrande.ms.gov.br/cgnoticias/noticia/vacinacao/</link>
          <pubDate>${daysAgo(1)}</pubDate>
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
    assert.ok(items[0].publishedAt, 'notícia expõe a data de publicação')
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('HighlightsService pede o feed ordenado por data e descarta notícias com mais de 1 ano', async () => {
  const originalFetch = globalThis.fetch
  const requestedUrls: string[] = []
  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
    <rss version="2.0"><channel>
      <item>
        <title>CAPS recente amplia acolhimento</title>
        <description>Saúde mental na rede municipal.</description>
        <link>https://www.campogrande.ms.gov.br/cgnoticias/noticia/caps-recente/</link>
        <pubDate>${daysAgo(10)}</pubDate>
      </item>
      <item>
        <title>CAPS antigo inaugura sala</title>
        <description>Saúde mental na rede municipal.</description>
        <link>https://www.campogrande.ms.gov.br/cgnoticias/noticia/caps-antigo/</link>
        <pubDate>${daysAgo(500)}</pubDate>
      </item>
    </channel></rss>`

  globalThis.fetch = async (input: any) => {
    requestedUrls.push(String(input))
    return new Response(xml, { status: 200, headers: { 'Content-Type': 'application/rss+xml' } })
  }

  try {
    const items = await new HighlightsService([]).listPublic()
    assert.ok(requestedUrls.every((url) => url.includes('orderby=date') && url.includes('order=DESC')))
    assert.deepEqual(items.map((item) => item.title), ['CAPS recente amplia acolhimento'])
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('HighlightsService tenta de novo logo quando nenhum feed responde', async () => {
  const originalFetch = globalThis.fetch
  let calls = 0
  globalThis.fetch = async () => {
    calls += 1
    throw new Error('rede indisponível')
  }

  try {
    const service = new HighlightsService([])
    await service.listPublic()
    const callsAfterFirst = calls
    const realNow = Date.now
    Date.now = () => realNow() + 3 * 60 * 1000 // 3 min depois: cache de falha (2 min) já expirou
    try {
      await service.listPublic()
    } finally {
      Date.now = realNow
    }
    assert.ok(calls > callsAfterFirst, 'refaz a busca após o cache curto de falha')
  } finally {
    globalThis.fetch = originalFetch
  }
})
