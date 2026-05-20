import api from '../lib/api'

type TelemetryCategory = 'carousel' | 'scroll' | 'navigation' | 'theme' | 'interaction' | 'performance'
const env = (import.meta as any).env
const telemetryEnabled = env?.DEV ? env?.VITE_ENABLE_TELEMETRY === 'true' : env?.VITE_ENABLE_TELEMETRY !== 'false'

export async function trackEvent(payload: {
  eventName: string
  category: TelemetryCategory
  value?: number
  metadata?: Record<string, string | number | boolean>
}): Promise<void> {
  if (!telemetryEnabled) {
    return
  }

  const body = { ...payload, at: new Date().toISOString() }

  try {
    await api.post('/api/telemetry', body)
  } catch {
    // Telemetria nunca deve quebrar UX
  }
}
