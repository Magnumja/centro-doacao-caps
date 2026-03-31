import { Router, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'

const router = Router()

const createNeedSchema = z.object({
  title: z.string().min(2, 'Titulo obrigatorio.').max(120),
  amount: z.number().int().positive('Quantidade deve ser maior que zero.'),
  description: z.string().min(5, 'Descricao obrigatoria.').max(600),
  category: z.string().min(2, 'Categoria obrigatoria.').max(80),
  priority: z.enum(['alta', 'media']),
})

// GET /needs
// Lista todas as necessidades públicas; aceita filtro por prioridade e unitId.
router.get('/', async (req: Request, res: Response): Promise<void> => {
  const { priority, unitId } = req.query

  const needs = await prisma.need.findMany({
    where: {
      ...(priority ? { priority: priority as 'alta' | 'media' } : {}),
      ...(unitId ? { unitId: String(unitId) } : {}),
    },
    include: {
      unit: { select: { id: true, slug: true, title: true } },
    },
    orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
  })

  res.json(needs)
})

// POST /needs
// Cria necessidade da unidade do host autenticado.
router.post('/', requireAuth, async (req: Request, res: Response): Promise<void> => {
  const parsed = createNeedSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors })
    return
  }

  const need = await prisma.need.create({
    data: {
      ...parsed.data,
      unitId: req.authHost!.unitId,
    },
  })

  res.status(201).json(need)
})

export default router
