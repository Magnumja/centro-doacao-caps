import { Router, Request, Response } from 'express'
import { z } from 'zod'
import prisma from '../lib/prisma'
import { requireAuth } from '../middleware/auth'
import { asyncHandler } from '../utils/async-handler'

const router = Router()
router.use(requireAuth)

const upsertResidentSchema = z.object({
  name: z.string().min(2, 'Nome obrigatório.').max(150),
  emergencyContact: z.string().max(50).optional(),
  entryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD.'),
  status: z.enum(['ativo', 'inativo', 'transferido']).default('ativo'),
})

router.get('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const residents = await prisma.resident.findMany({
    where: { unitId: req.authHost!.unitId },
    orderBy: { name: 'asc' },
  })

  res.json(residents)
}))

router.post('/', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = upsertResidentSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors })
    return
  }

  const resident = await prisma.resident.create({
    data: { ...parsed.data, unitId: req.authHost!.unitId },
  })

  res.status(201).json(resident)
}))

router.put('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const parsed = upsertResidentSchema.safeParse(req.body)

  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten().fieldErrors })
    return
  }

  const resident = await prisma.resident.findUnique({ where: { id: req.params.id } })

  if (!resident) {
    res.status(404).json({ error: 'Residente não encontrado.' })
    return
  }

  if (resident.unitId !== req.authHost!.unitId && req.authHost!.role !== 'admin') {
    res.status(403).json({ error: 'Sem permissão para editar este residente.' })
    return
  }

  const updated = await prisma.resident.update({
    where: { id: req.params.id },
    data: parsed.data,
  })

  res.json(updated)
}))

router.delete('/:id', asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const resident = await prisma.resident.findUnique({ where: { id: req.params.id } })

  if (!resident) {
    res.status(404).json({ error: 'Residente não encontrado.' })
    return
  }

  if (resident.unitId !== req.authHost!.unitId && req.authHost!.role !== 'admin') {
    res.status(403).json({ error: 'Sem permissão para remover este residente.' })
    return
  }

  await prisma.resident.delete({ where: { id: req.params.id } })
  res.status(204).send()
}))

export default router
