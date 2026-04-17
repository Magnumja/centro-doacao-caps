import { z } from 'zod'
import { AppError } from '../errors/app-error'

const telemetrySchema = z.object({
  eventName: z.string().min(2).max(80),
  category: z.enum(['carousel', 'scroll', 'navigation', 'theme', 'interaction']),
  value: z.number().min(0).max(100).optional(),
  metadata: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
  at: z.string().datetime().optional(),
})

type TelemetryEvent = z.infer<typeof telemetrySchema>

export class TelemetryService {
  private readonly maxEvents = 1000
  private readonly events: TelemetryEvent[] = []

  track(payload: unknown): void {
    const parsed = telemetrySchema.safeParse(payload)
    if (!parsed.success) {
      throw new AppError('Payload de telemetria inválido.', 400, parsed.error.flatten().fieldErrors)
    }

    this.events.push(parsed.data)
    if (this.events.length > this.maxEvents) {
      this.events.shift()
    }
  }

  summary() {
    const byCategory = this.events.reduce<Record<string, number>>((acc, event) => {
      acc[event.category] = (acc[event.category] ?? 0) + 1
      return acc
    }, {})

    return {
      total: this.events.length,
      byCategory,
      lastEvents: this.events.slice(-10),
    }
  }
}

export const telemetryService = new TelemetryService()
