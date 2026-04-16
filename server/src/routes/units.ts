import { Router, Request, Response } from 'express'
import prisma from '../lib/prisma'
import { asyncHandler } from '../utils/async-handler'

const router = Router()

router.get('/', asyncHandler(async (_req: Request, res: Response): Promise<void> => {
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
}))

router.get('/:slug', asyncHandler(async (req: Request, res: Response): Promise<void> => {
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
}))

export default router
