import { z } from 'zod'
import { AppError } from '../errors/app-error'
import { ValidationError } from '../errors/validation-error'
import { DonationsRepository } from '../repositories/donations-repository'

const createDonationSchema = z.object({
  unitSlug: z.string().min(1, 'Unidade obrigatória.'),
  category: z.enum(['roupa', 'comida', 'utensilios'], { message: 'Categoria inválida.' }),
  quantity: z.string().min(1, 'Quantidade obrigatória.').max(100),
  isAnonymous: z.boolean(),
  donorName: z.string().max(120).optional(),
  donorEmail: z.string().email('E-mail inválido.').max(200).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD.'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:MM.'),
}).refine(
  (data) => data.isAnonymous || (!!data.donorName && data.donorName.trim().length > 0),
  { message: 'Nome do doador é obrigatório para doações não anônimas.', path: ['donorName'] },
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
      throw new AppError('Unidade não encontrada.', 404)
    }

    return this.repository.create({ ...data, unitId: unit.id })
  }

  async listByHost(unitId: string, page = '1', limit = '20') {
    const pageNum = Math.max(1, parseInt(String(page), 10))
    const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)))
    const skip = (pageNum - 1) * limitNum

    const [donations, total] = await this.repository.listByUnit(unitId, skip, limitNum)

    return { data: donations, total, page: pageNum, limit: limitNum }
  }

  async delete(id: string, authHost: { unitId: string, role: 'host' | 'admin' }) {
    const donation = await this.repository.findById(id)

    if (!donation) {
      throw new AppError('Doação não encontrada.', 404)
    }

    if (donation.unitId !== authHost.unitId && authHost.role !== 'admin') {
      throw new AppError('Sem permissão para remover esta doação.', 403)
    }

    await this.repository.delete(id)
  }
}
