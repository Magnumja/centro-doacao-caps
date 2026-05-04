import { Request, Response } from 'express'
import { z } from 'zod'
import { NeedsService } from '../services/needs-service'
import { ValidationError } from '../errors/validation-error'

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
