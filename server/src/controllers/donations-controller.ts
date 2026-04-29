import { Request, Response } from 'express'
import { DonationsService } from '../services/donations-service'

export class DonationsController {
  constructor(private readonly service = new DonationsService()) {}

  create = async (req: Request, res: Response): Promise<void> => {
    const donation = await this.service.create(req.body)
    res.status(201).json(donation)
  }

  list = async (req: Request, res: Response): Promise<void> => {
    const result = await this.service.listByHost(
      req.authHost!.unitId,
      req.query.page as string | undefined,
      req.query.limit as string | undefined,
    )
    res.json(result)
  }

  remove = async (req: Request, res: Response): Promise<void> => {
    await this.service.delete(req.params.id, req.authHost!)
    res.status(204).send()
  }
}
