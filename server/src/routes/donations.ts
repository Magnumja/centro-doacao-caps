import { Router, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router = Router()

// Schema de validação de nova doação (enviado pelo formulário público).
const createDonationSchema = z.object({
  unitSlug: z.string().min(1, 'Unidade obrigatória.'),
  category: z.enum(['roupa', 'comida', 'utensilios'], { message: 'Categoria inválida.' }),
  quantity: z.string().min(1, 'Quantidade obrigatória.').max(100),
  isAnonymous: z.boolean(),
  donorName: z.string().max(120).optional(),
  donorEmail: z.string().email('E-mail inválido.').max(200).optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD.'),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Hora deve estar no formato HH:MM.'),
}).refine(
  (data) => data.isAnonymous || (!!data.donorName && data.donorName.trim().length > 0),
  { message: 'Nome do doador é obrigatório para doações não anônimas.', path: ['donorName'] },
)

// POST /donations
// Registra uma nova doação pública — rota aberta (não requer auth).
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = createDonationSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors })
    return
  }

  const { unitSlug, ...data } = parsed.data

  const unit = await prisma.unit.findUnique({ where: { slug: unitSlug } })
  if (!unit) {
    res.status(404).json({ error: 'Unidade não encontrada.' })
    return
  }

  const donation = await prisma.donation.create({
    data: {
      unitId: unit.id,
      category: data.category,
      quantity: data.quantity,
      isAnonymous: data.isAnonymous,
      donorName: data.isAnonymous ? null : data.donorName,
      donorEmail: data.isAnonymous ? null : data.donorEmail,
      date: data.date,
      time: data.time,
    },
  })

  res.status(201).json(donation)
})

// GET /donations
// Lista doações da unidade do host logado; requer autenticação.
router.get('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const { page = '1', limit = '20' } = req.query

  const pageNum = Math.max(1, parseInt(String(page), 10))
  const limitNum = Math.min(100, Math.max(1, parseInt(String(limit), 10)))
  const skip = (pageNum - 1) * limitNum

  const [donations, total] = await prisma.$transaction([
    prisma.donation.findMany({
      where: { unitId: req.authHost!.unitId },
      orderBy: { registeredAt: 'desc' },
      skip,
      take: limitNum,
    }),
    prisma.donation.count({ where: { unitId: req.authHost!.unitId } }),
  ])

  res.json({ data: donations, total, page: pageNum, limit: limitNum })
})

// DELETE /donations/:id
// Remove uma doação — somente o host responsável pela unidade pode remover.
router.delete('/:id', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const donation = await prisma.donation.findUnique({ where: { id: req.params.id } })

  if (!donation) {
    res.status(404).json({ error: 'Doação não encontrada.' })
    return
  }

  // Garante que o host só apaga doações da própria unidade.
  if (donation.unitId !== req.authHost!.unitId && req.authHost!.role !== 'admin') {
    res.status(403).json({ error: 'Sem permissão para remover esta doação.' })
    return
  }

  await prisma.donation.delete({ where: { id: req.params.id } })
  res.status(204).send()
})

export default router
