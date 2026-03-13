import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

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

export default router
