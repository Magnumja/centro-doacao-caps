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

  async create(payload: unknown, unitId: string) {
    const parsed = createNeedSchema.safeParse(payload)
    if (!parsed.success) {
      throw new ValidationError(parsed.error)
    }

    return this.repository.create({ ...parsed.data, unitId })
  }
}
