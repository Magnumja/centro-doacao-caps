import { z } from 'zod'
import { AppError } from '../errors/app-error'
import { ValidationError } from '../errors/validation-error'
import { DonationsRepository } from '../repositories/donations-repository'
import { resolvePagination } from '../utils/pagination'

const createDonationSchema = z.object({
  unitSlug: z.string().trim().min(1, 'Unidade obrigatoria.').max(80).regex(/^[a-z0-9-]+$/i, 'Unidade invalida.'),
  category: z.enum(['roupa', 'comida', 'utensilios'], { message: 'Categoria invalida.' }),
  quantity: z.string().trim().min(1, 'Quantidade obrigatoria.').max(100),
  isAnonymous: z.boolean(),
  donorName: z.string().trim().max(120).optional(),
  donorEmail: z.string().trim().toLowerCase().email('E-mail invalido.').max(200).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD.'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:MM.'),
}).refine(
  (data) => data.isAnonymous || (!!data.donorName && data.donorName.trim().length > 0),
  { message: 'Nome do doador e obrigatorio para doacoes nao anonimas.', path: ['donorName'] },
)

export class DonationsService {
  constructor(private readonly repository = new DonationsRepository()) {}

  async create(payload: unknown) {
    const parsed = createDonationSchema.safeParse(payload)
    if (!parsed.success) {
      throw new ValidationError(parsed.error)
    }

    const { unitSlug, ...data } = parsed.data
    const unit = await this.repository.findUnitBySlug(unitSlug)

    if (!unit) {
      throw new AppError('Unidade nao encontrada.', 404)
    }

    return this.repository.create({ ...data, unitId: unit.id })
  }

  async listByHost(unitId: string, page = '1', limit = '20') {
    const pagination = resolvePagination(page, limit, { defaultLimit: 20, maxLimit: 100 })

    const [donations, total] = await this.repository.listByUnit(unitId, pagination.skip, pagination.limit)

    return { data: donations, total, page: pagination.page, limit: pagination.limit }
  }

  async delete(id: string, authHost: { unitId: string, role: 'host' | 'admin' }) {
    const donation = await this.repository.findById(id)

    if (!donation) {
      throw new AppError('Doacao nao encontrada.', 404)
    }

    if (donation.unitId !== authHost.unitId && authHost.role !== 'admin') {
      throw new AppError('Sem permissao para remover esta doacao.', 403)
    }

    await this.repository.delete(id)
  }
}
