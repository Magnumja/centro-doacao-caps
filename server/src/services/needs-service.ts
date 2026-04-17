import { z } from 'zod'
import { ValidationError } from '../errors/validation-error'
import { NeedFilters, NeedsRepository } from '../repositories/needs-repository'

const createNeedSchema = z.object({
  title: z.string().min(2, 'Titulo obrigatorio.').max(120),
  amount: z.number().int().positive('Quantidade deve ser maior que zero.'),
  description: z.string().min(5, 'Descricao obrigatoria.').max(600),
  category: z.string().min(2, 'Categoria obrigatoria.').max(80),
  priority: z.enum(['alta', 'media']),
})

export class NeedsService {
  constructor(private readonly repository = new NeedsRepository()) {}

  list(filters: NeedFilters) {
    return this.repository.findMany(filters)
  }

  async listPaginated(filters: NeedFilters, page = '1', limit = '12') {
    const pageNum = Math.max(1, parseInt(String(page), 10))
    const limitNum = Math.min(60, Math.max(1, parseInt(String(limit), 10)))
    const skip = (pageNum - 1) * limitNum

    const [data, total] = await this.repository.listPaginated(filters, skip, limitNum)

    return {
      data,
      page: pageNum,
      limit: limitNum,
      total,
      hasMore: skip + data.length < total,
    }
  }

  async create(payload: unknown, unitId: string) {
    const parsed = createNeedSchema.safeParse(payload)
    if (!parsed.success) {
      throw new ValidationError(parsed.error)
    }

    return this.repository.create({ ...parsed.data, unitId })
  }
}
