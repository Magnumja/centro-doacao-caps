import { Request, Response } from 'express'
import { NeedsService } from '../services/needs-service'

export class NeedsController {
  constructor(private readonly service = new NeedsService()) {}

  list = async (req: Request, res: Response): Promise<void> => {
    const priority = req.query.priority as 'alta' | 'media' | undefined
    const unitId = req.query.unitId ? String(req.query.unitId) : undefined

    const needs = await this.service.list({ priority, unitId })
    res.json(needs)
  }

  create = async (req: Request, res: Response): Promise<void> => {
    const need = await this.service.create(req.body, req.authHost!.unitId)
    res.status(201).json(need)
  }
}
