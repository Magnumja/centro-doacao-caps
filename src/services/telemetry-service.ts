import api from '../lib/api'

type TelemetryCategory = 'carousel' | 'scroll' | 'navigation' | 'theme' | 'interaction'

export async function trackEvent(payload: {
  eventName: string
  category: TelemetryCategory
  value?: number
  metadata?: Record<string, string | number | boolean>
}): Promise<void> {
  const body = { ...payload, at: new Date().toISOString() }

  try {
    if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
      const endpoint = `${(import.meta as any).env?.VITE_API_URL ?? ''}/api/telemetry`
      const sent = navigator.sendBeacon(endpoint, new Blob([JSON.stringify(body)], { type: 'application/json' }))
      if (sent) {
        return
      }
    }

    await api.post('/api/telemetry', body)
  } catch {
    // Telemetria nunca deve quebrar UX
  }
}
