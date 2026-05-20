import { NextFunction, Request, Response } from 'express'
import { AppError } from '../errors/app-error'

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({ error: 'Rota não encontrada.' })
}

function safeDetails(details: unknown): unknown {
  if (details === undefined || details === null) return undefined
  if (details instanceof Error) return undefined
  return details
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message, details: safeDetails(err.details) })
    return
  }

  console.error('Erro não tratado:', err)
  res.status(500).json({ error: 'Erro interno no servidor.' })
}
