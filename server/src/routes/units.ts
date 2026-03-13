import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'

const router = Router()

// GET /units
// Lista todas as unidades públicas (sem dados sensíveis de residentes/hosts).
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  const units = await prisma.unit.findMany({
    orderBy: { title: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      unitType: true,
      address: true,
      contact: true,
      description: true,
      capacity: true,
      privacyNote: true,
      lat: true,
      lng: true,
      photo: true,
    },
  })

  res.json(units)
})

// GET /units/:slug
// Retorna uma unidade específica pelo slug (ex.: c1, r1).
router.get('/:slug', async (req: Request, res: Response): Promise<void> => {
  const unit = await prisma.unit.findUnique({
    where: { slug: req.params.slug },
    select: {
      id: true,
      slug: true,
      title: true,
      unitType: true,
      address: true,
      contact: true,
      description: true,
      capacity: true,
      privacyNote: true,
      lat: true,
      lng: true,
      photo: true,
      needs: {
        select: { id: true, title: true, amount: true, description: true, category: true, priority: true },
      },
    },
  })

  if (!unit) {
    res.status(404).json({ error: 'Unidade não encontrada.' })
    return
  }

  res.json(unit)
})

export default router
