import { z } from 'zod'
import { ValidationError } from '../errors/validation-error'
import { NeedFilters, NeedsRepository } from '../repositories/needs-repository'
import { resolvePagination } from '../utils/pagination'

const createNeedSchema = z.object({
  title: z.string().min(2, 'Titulo obrigatorio.').max(120),
  amount: z.number().int().positive('Quantidade deve ser maior que zero.'),
  description: z.string().min(5, 'Descricao obrigatoria.').max(600),
  category: z.string().min(2, 'Categoria obrigatoria.').max(80),
  priority: z.enum(['alta', 'media', 'baixa']),
})

export class NeedsService {
  constructor(private readonly repository = new NeedsRepository()) {}

  list(filters: NeedFilters) {
    return this.repository.findMany(filters)
  }

  async listPaginated(filters: NeedFilters, page = '1', limit = '12') {
    const pagination = resolvePagination(page, limit, { defaultLimit: 12, maxLimit: 60 })

    const [data, total] = await this.repository.listPaginated(filters, pagination.skip, pagination.limit)

    return {
      data,
      page: pagination.page,
      limit: pagination.limit,
      total,
      hasMore: pagination.skip + data.length < total,
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
