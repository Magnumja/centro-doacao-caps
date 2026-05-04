import { randomUUID } from 'crypto'
import https from 'https'
import { XMLParser } from 'fast-xml-parser'
import { z } from 'zod'
import { AppError } from '../errors/app-error'
import { highlights as seedHighlights, HighlightItem } from '../data/highlights'

type NewsHighlightItem = HighlightItem & {
  publishedAtMs: number
}

const highlightSchema = z.object({
  title: z.string().min(5).max(140),
  description: z.string().min(10).max(260),
  image: z.string().min(1),
  ctaLabel: z.string().min(2).max(60),
  ctaLink: z.string().min(1).max(220),
})

export class HighlightsService {
  private readonly items = new Map<string, HighlightItem>()
  private readonly newsCacheTtlMs = 1000 * 60 * 15
  private readonly parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    cdataPropName: 'text',
  })

  private newsCache: { expiresAt: number, items: HighlightItem[] } | null = null

  private readonly searchTerms = [
    'CAPS',
    'Centro de Atenção Psicossocial',
    'Atenção Psicossocial',
    'saúde mental',
    'psicossocial',
    'psicosocial',
    'psicologia',
    'psiquiatria',
    'Residência Terapêutica',
    'RAPS',
    'álcool e drogas',
    'dependência química',
    'Janeiro Branco',
    'Setembro Amarelo',
  ]

  private readonly primaryNewsTerms = [
    'caps',
    'centro de atencao psicossocial',
    'atencao psicossocial',
    'saúde mental',
    'saude mental',
    'psicossocial',
    'psicosocial',
    'residência terapêutica',
    'residencia terapeutica',
    'raps',
    'alcool e drogas',
    'álcool e drogas',
    'dependencia quimica',
    'dependência química',
    'janeiro branco',
    'setembro amarelo',
  ]

  private readonly secondaryNewsTerms = [
    'psicologia',
    'psiquiatria',
  ]

  private readonly fallbackImages = [
    '/capsvilaalmeida.jpeg',
    '/capsmargarida.jpg',
    '/capsaerorancho.jpeg',
    '/capsafrodite.jpeg',
  ]

  constructor(initial: HighlightItem[] = seedHighlights) {
    initial.forEach((item) => this.items.set(item.id, { ...item }))
  }

  list(): HighlightItem[] {
    return [...this.items.values()]
  }

  async listPublic(): Promise<HighlightItem[]> {
    const news = await this.listNews()
    return [...news, ...this.list()].slice(0, 8)
  }

  create(payload: unknown): HighlightItem {
    const parsed = highlightSchema.safeParse(payload)
    if (!parsed.success) {
      throw new AppError('Dados inválidos para destaque.', 400, parsed.error.flatten().fieldErrors)
    }

    const highlight: HighlightItem = {
      id: randomUUID(),
      ...parsed.data,
    }

    this.items.set(highlight.id, highlight)
    return highlight
  }

  update(id: string, payload: unknown): HighlightItem {
    const parsed = highlightSchema.partial().safeParse(payload)
    if (!parsed.success) {
      throw new AppError('Dados inválidos para atualização de destaque.', 400, parsed.error.flatten().fieldErrors)
    }

    const current = this.items.get(id)
    if (!current) {
      throw new AppError('Destaque não encontrado.', 404)
    }

    const updated: HighlightItem = { ...current, ...parsed.data }
    this.items.set(id, updated)

    return updated
  }

  remove(id: string): void {
    if (!this.items.has(id)) {
      throw new AppError('Destaque não encontrado.', 404)
    }

    this.items.delete(id)
  }

  private async listNews(): Promise<HighlightItem[]> {
    if (this.newsCache && this.newsCache.expiresAt > Date.now()) {
      return this.newsCache.items
    }

    const newsFeeds = this.searchTerms.map((term) => (
      `https://www.campogrande.ms.gov.br/cgnoticias/?s=${encodeURIComponent(term)}&feed=rss2`
    ))
    const results = await Promise.allSettled(newsFeeds.map((feed) => this.fetchNewsFeed(feed)))
    const items = results
      .flatMap((result) => result.status === 'fulfilled' ? result.value : [])
      .filter((item, index, allItems) => allItems.findIndex((candidate) => candidate.ctaLink === item.ctaLink) === index)
      .sort((a, b) => b.publishedAtMs - a.publishedAtMs)
      .map(({ publishedAtMs: _publishedAtMs, ...item }) => item)
      .slice(0, 5)

    this.newsCache = {
      expiresAt: Date.now() + this.newsCacheTtlMs,
      items,
    }

    return items
  }

  private async fetchNewsFeed(feedUrl: string): Promise<NewsHighlightItem[]> {
    const xml = await this.fetchFeedXml(feedUrl)
    const parsed = this.parser.parse(xml) as any
    const rawItems = parsed?.rss?.channel?.item
    const feedItems = Array.isArray(rawItems) ? rawItems : rawItems ? [rawItems] : []

    return feedItems
      .map((item, index) => this.mapRssItemToHighlight(item, index))
      .filter((item): item is NewsHighlightItem => item !== null)
  }

  private async fetchFeedXml(feedUrl: string): Promise<string> {
    const headers = {
      Accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8',
      'User-Agent': 'CentroDoacaoCAPS/1.0 (+https://www.campogrande.ms.gov.br)',
    }

    try {
      const response = await fetch(feedUrl, { headers })
      if (!response.ok) {
        return ''
      }

      return response.text()
    } catch {
      return this.fetchFeedXmlWithLenientCertificate(feedUrl, headers)
    }
  }

  private fetchFeedXmlWithLenientCertificate(feedUrl: string, headers: Record<string, string>): Promise<string> {
    return new Promise((resolve) => {
      const url = new URL(feedUrl)
      const request = https.get({
        hostname: url.hostname,
        path: `${url.pathname}${url.search}`,
        headers,
        rejectUnauthorized: false,
      }, (response) => {
        if ((response.statusCode ?? 500) >= 300 && (response.statusCode ?? 500) < 400 && response.headers.location) {
          response.resume()
          resolve(this.fetchFeedXmlWithLenientCertificate(response.headers.location, headers))
          return
        }

        if (response.statusCode !== 200) {
          response.resume()
          resolve('')
          return
        }

        response.setEncoding('utf8')
        let body = ''
        response.on('data', (chunk) => {
          body += chunk
        })
        response.on('end', () => resolve(body))
      })

      request.setTimeout(8000, () => {
        request.destroy()
        resolve('')
      })
      request.on('error', () => resolve(''))
    })
  }

  private mapRssItemToHighlight(item: any, index: number): NewsHighlightItem | null {
    const title = this.toPlainText(item?.title)
    const description = this.toPlainText(item?.description ?? item?.['content:encoded']).slice(0, 210)
    const link = this.normalizeCgNoticiasLink(this.toPlainText(item?.link))
    const searchableText = this.normalizeText(`${title} ${description}`)

    if (!title || !link || !this.isRelevantNews(searchableText)) {
      return null
    }

    return {
      id: `cgnoticias-${this.slugify(link)}`,
      title,
      description: description || 'Notícia publicada pela Agência Municipal de Notícias de Campo Grande.',
      image: this.extractImage(item) ?? this.fallbackImages[index % this.fallbackImages.length],
      ctaLabel: 'Ler notícia',
      ctaLink: link,
      publishedAtMs: this.parsePublishedAt(item?.pubDate),
    }
  }

  private parsePublishedAt(value: unknown): number {
    const timestamp = Date.parse(String(value ?? ''))
    return Number.isNaN(timestamp) ? 0 : timestamp
  }

  private normalizeText(value: string): string {
    return value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
  }

  private isRelevantNews(searchableText: string): boolean {
    const hasPrimaryTerm = this.primaryNewsTerms.some((term) => (
      searchableText.includes(this.normalizeText(term))
    ))
    if (hasPrimaryTerm) {
      return true
    }

    const hasSecondaryTerm = this.secondaryNewsTerms.some((term) => (
      searchableText.includes(this.normalizeText(term))
    ))

    return hasSecondaryTerm && (
      searchableText.includes('saude')
      || searchableText.includes('sus')
      || searchableText.includes('acolhimento')
      || searchableText.includes('cuidado')
    )
  }

  private extractImage(item: any): string | undefined {
    const enclosureUrl = item?.enclosure?.url
    if (typeof enclosureUrl === 'string' && enclosureUrl.startsWith('http')) {
      return enclosureUrl
    }

    const mediaContent = item?.['media:content']
    if (typeof mediaContent?.url === 'string' && mediaContent.url.startsWith('http')) {
      return mediaContent.url
    }

    const html = String(item?.['content:encoded']?.text ?? item?.['content:encoded'] ?? item?.description?.text ?? item?.description ?? '')
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i)
    return match?.[1]
  }

  private normalizeCgNoticiasLink(value: string): string {
    if (!value) {
      return ''
    }

    try {
      const url = new URL(value, 'https://www.campogrande.ms.gov.br')

      if (url.hostname !== 'www.campogrande.ms.gov.br') {
        return ''
      }

      if (!url.pathname.startsWith('/cgnoticias/')) {
        return ''
      }

      url.protocol = 'https:'
      return url.toString()
    } catch {
      return ''
    }
  }

  private toPlainText(value: unknown): string {
    const raw = typeof value === 'object' && value !== null && 'text' in value
      ? String((value as { text?: unknown }).text ?? '')
      : String(value ?? '')

    return raw
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#8220;|&#8221;/g, '"')
      .replace(/&#8211;|&#8212;/g, '-')
      .replace(/&#8216;|&#8217;/g, "'")
      .replace(/\s+/g, ' ')
      .trim()
  }

  private slugify(value: string): string {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80)
  }
}

export const highlightsService = new HighlightsService()
