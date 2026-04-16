import { ZodError } from 'zod'
import { AppError } from './app-error'

export class ValidationError extends AppError {
  constructor(zodError: ZodError) {
    super('Dados inválidos.', 400, zodError.flatten().fieldErrors)
    this.name = 'ValidationError'
  }
}
