import { randomUUID } from 'node:crypto'
import { z } from 'zod'
import { fallbackUnits } from '../data/public-fallback'
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

// Uma intenção de doação com vários itens, gravada de uma vez (tudo ou nada).
const createBatchSchema = z.object({
  unitSlug: z.string().trim().min(1, 'Unidade obrigatoria.').max(80).regex(/^[a-z0-9-]+$/i, 'Unidade invalida.'),
  items: z.array(z.object({
    category: z.enum(['roupa', 'comida', 'utensilios'], { message: 'Categoria invalida.' }),
    label: z.string().trim().min(1).max(60),
    quantity: z.string().trim().min(1, 'Quantidade obrigatoria.').max(100),
  })).min(1, 'Escolha ao menos um item.').max(10, 'Registre no maximo 10 itens por vez.'),
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

  async create(payload: unknown, donorId?: string) {
    const parsed = createDonationSchema.safeParse(payload)
    if (!parsed.success) {
      throw new ValidationError(parsed.error)
    }

    const { unitSlug, ...data } = parsed.data

    // Modo de demonstração local (sem banco; nunca ativo em produção): valida igual,
    // mas não persiste, para o fluxo de doação poder ser testado de ponta a ponta.
    if (process.env.API_MOCK_MODE === 'true') {
      const fallbackUnit = fallbackUnits.find((candidate) => candidate.slug === unitSlug)
      if (!fallbackUnit) {
        throw new AppError('Unidade nao encontrada.', 404)
      }

      return { id: randomUUID(), ...data, unitId: fallbackUnit.id, registeredAt: new Date().toISOString() }
    }

    const unit = await this.repository.findUnitBySlug(unitSlug)

    if (!unit) {
      throw new AppError('Unidade nao encontrada.', 404)
    }

    return this.repository.create({ ...data, unitId: unit.id, donorId })
  }

  async createBatch(payload: unknown, donorId?: string) {
    const parsed = createBatchSchema.safeParse(payload)
    if (!parsed.success) {
      throw new ValidationError(parsed.error)
    }

    const { unitSlug, items, ...shared } = parsed.data
    const groupId = randomUUID()

    if (process.env.API_MOCK_MODE === 'true') {
      const fallbackUnit = fallbackUnits.find((candidate) => candidate.slug === unitSlug)
      if (!fallbackUnit) {
        throw new AppError('Unidade nao encontrada.', 404)
      }
      return { groupId, count: items.length }
    }

    const unit = await this.repository.findUnitBySlug(unitSlug)
    if (!unit) {
      throw new AppError('Unidade nao encontrada.', 404)
    }

    const count = await this.repository.createGroup(items.map((item) => ({
      ...shared,
      category: item.category,
      itemLabel: item.label,
      quantity: item.quantity,
      unitId: unit.id,
      groupId,
      donorId,
    })))

    return { groupId, count }
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
