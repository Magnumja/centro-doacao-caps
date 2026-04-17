import { randomUUID } from 'crypto'
import { z } from 'zod'
import { AppError } from '../errors/app-error'
import { highlights as seedHighlights, HighlightItem } from '../data/highlights'

const highlightSchema = z.object({
  title: z.string().min(5).max(140),
  description: z.string().min(10).max(260),
  image: z.string().min(1),
  ctaLabel: z.string().min(2).max(60),
  ctaLink: z.string().min(1).max(220),
})

export class HighlightsService {
  private readonly items = new Map<string, HighlightItem>()

  constructor(initial: HighlightItem[] = seedHighlights) {
    initial.forEach((item) => this.items.set(item.id, { ...item }))
  }

  list(): HighlightItem[] {
    return [...this.items.values()]
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
}

export const highlightsService = new HighlightsService()
