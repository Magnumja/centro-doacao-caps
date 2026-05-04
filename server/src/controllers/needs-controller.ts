import { Request, Response } from 'express'
import { z } from 'zod'
import { NeedsService } from '../services/needs-service'
import { ValidationError } from '../errors/validation-error'
import { fallbackNeeds, mapFallbackNeed } from '../data/public-fallback'

const priorityQuerySchema = z.enum(['alta', 'media', 'baixa'])

export class NeedsController {
  constructor(private readonly service = new NeedsService()) {}

  list = async (req: Request, res: Response): Promise<void> => {
    let priority: 'alta' | 'media' | 'baixa' | undefined
    if (req.query.priority !== undefined) {
      const parsedPriority = priorityQuerySchema.safeParse(req.query.priority)
      if (!parsedPriority.success) {
        throw new ValidationError(parsedPriority.error)
      }
      priority = parsedPriority.data
    }

    const unitId = req.query.unitId ? String(req.query.unitId) : undefined
    const paginate = req.query.paginate === 'true'

    if (process.env.API_MOCK_MODE === 'true') {
      let needs = fallbackNeeds.map(mapFallbackNeed)

      if (priority) {
        needs = needs.filter((need) => need.priority === priority)
      }

      if (unitId) {
        needs = needs.filter((need) => need.unitId === unitId || need.unit?.slug === unitId)
      }

      if (paginate) {
        const page = Math.max(1, Number.parseInt(String(req.query.page ?? '1'), 10) || 1)
        const limit = Math.min(60, Math.max(1, Number.parseInt(String(req.query.limit ?? '12'), 10) || 12))
        const skip = (page - 1) * limit
        const data = needs.slice(skip, skip + limit)

        res.json({ data, page, limit, total: needs.length, hasMore: skip + data.length < needs.length })
        return
      }

      res.json(needs)
      return
    }

    if (paginate) {
      const result = await this.service.listPaginated(
        { priority, unitId },
        req.query.page as string | undefined,
        req.query.limit as string | undefined,
      )
      res.json(result)
      return
    }

    const needs = await this.service.list({ priority, unitId })
    res.json(needs)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const need = await this.service.create(req.body, req.authHost!.unitId)
    res.status(201).json(need)
  }
}
