import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { AppError } from '../errors/app-error'
import { ValidationError } from '../errors/validation-error'
import { DonorsRepository } from '../repositories/donors-repository'

const CATEGORY_LABELS: Record<string, string> = {
  roupa: 'Roupas',
  comida: 'Alimentos',
  utensilios: 'Utensílios',
}

// Hash fixo usado quando o e-mail não existe: o tempo de resposta fica igual ao de uma
// senha errada, sem revelar quais e-mails têm conta.
const DUMMY_HASH = '$2b$12$C6UzMDM.H6dfI/f/IKxGhu1Uc1M4b5M7.l8F/9QnWMnGm6wib2MSe'

const emailSchema = z.string().trim().toLowerCase().email('Informe um e-mail válido.').max(200)

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome.').max(120),
  email: emailSchema,
  password: z.string().min(8, 'A senha precisa ter pelo menos 8 caracteres.').max(128),
})

const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Informe sua senha.').max(128),
})

export type DonorProfile = { id: string, name: string, email: string, createdAt: Date }

export type DonorDonationGroup = {
  id: string
  unit: { slug: string, title: string }
  date: string
  time: string
  isAnonymous: boolean
  registeredAt: Date
  items: Array<{ label: string, quantity: string }>
}

export class DonorsService {
  constructor(private readonly repository = new DonorsRepository()) {}

  async register(payload: unknown): Promise<DonorProfile> {
    const parsed = registerSchema.safeParse(payload)
    if (!parsed.success) throw new ValidationError(parsed.error)

    const { name, email, password } = parsed.data
    if (await this.repository.findByEmail(email)) {
      throw new AppError('Já existe uma conta com este e-mail. Entre com sua senha.', 409)
    }

    const hash = await bcrypt.hash(password, 12)
    return this.repository.create({ name, email, password: hash })
  }

  async login(payload: unknown): Promise<DonorProfile> {
    const parsed = loginSchema.safeParse(payload)
    if (!parsed.success) throw new ValidationError(parsed.error)

    const donor = await this.repository.findByEmail(parsed.data.email)
    const passwordMatch = await bcrypt.compare(parsed.data.password, donor?.password ?? DUMMY_HASH)

    if (!donor || !passwordMatch) {
      throw new AppError('E-mail ou senha incorretos.', 401)
    }

    return { id: donor.id, name: donor.name, email: donor.email, createdAt: donor.createdAt }
  }

  async getProfile(donorId: string): Promise<DonorProfile> {
    const donor = await this.repository.findProfile(donorId)
    if (!donor) throw new AppError('Conta não encontrada.', 404)
    return donor
  }

  // Agrupa as linhas (um item por linha no banco) em intenções de doação.
  async listDonations(donorId: string, limit = 20): Promise<DonorDonationGroup[]> {
    const rows = await this.repository.listDonations(donorId, limit * 10)
    const groups = new Map<string, DonorDonationGroup>()

    for (const row of rows) {
      const key = row.groupId ?? row.id
      const item = { label: row.itemLabel ?? CATEGORY_LABELS[row.category] ?? row.category, quantity: row.quantity }
      const existing = groups.get(key)

      if (existing) {
        existing.items.push(item)
        continue
      }

      groups.set(key, {
        id: key,
        unit: row.unit,
        date: row.date,
        time: row.time,
        isAnonymous: row.isAnonymous,
        registeredAt: row.registeredAt,
        items: [item],
      })
    }

    return [...groups.values()].slice(0, limit)
  }
}
