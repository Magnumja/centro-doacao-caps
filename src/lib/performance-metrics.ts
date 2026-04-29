import { trackEvent } from '../services/telemetry-service'

let installed = false

type MetricMetadata = Record<string, string | number | boolean>

function sendPerformanceMetric(eventName: string, value: number, metadata: MetricMetadata = {}): void {
  if (!Number.isFinite(value) || value < 0) {
    return
  }

  void trackEvent({
    eventName,
    category: 'performance',
    value: Math.round(value),
    metadata,
  })
}

function observePerformanceEntry(
  type: string,
  onEntry: (entry: PerformanceEntry) => void,
): PerformanceObserver | null {
  if (typeof PerformanceObserver === 'undefined') {
    return null
  }

  try {
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(onEntry)
    })

    observer.observe({ type, buffered: true })
    return observer
  } catch {
    return null
  }
}

export function installPerformanceMetrics(): void {
  if (installed || typeof window === 'undefined') {
    return
  }

  installed = true

  window.addEventListener('load', () => {
    const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined
    if (!navigationEntry) {
      return
    }

    sendPerformanceMetric('page_load_time', navigationEntry.loadEventEnd - navigationEntry.startTime, {
      page: window.location.hash || window.location.pathname,
    })
  }, { once: true })

  observePerformanceEntry('paint', (entry) => {
    if (entry.name === 'first-contentful-paint') {
      sendPerformanceMetric('first_contentful_paint', entry.startTime, {
        page: window.location.hash || window.location.pathname,
      })
    }
  })

  observePerformanceEntry('largest-contentful-paint', (entry) => {
    sendPerformanceMetric('largest_contentful_paint', entry.startTime, {
      page: window.location.hash || window.location.pathname,
    })
  })

  let cumulativeLayoutShift = 0
  observePerformanceEntry('layout-shift', (entry) => {
    const layoutShift = entry as PerformanceEntry & { value?: number, hadRecentInput?: boolean }
    if (layoutShift.hadRecentInput || typeof layoutShift.value !== 'number') {
      return
    }

    cumulativeLayoutShift += layoutShift.value
    sendPerformanceMetric('cumulative_layout_shift', cumulativeLayoutShift * 1000, {
      page: window.location.hash || window.location.pathname,
      scaledBy: 1000,
    })
  })
}
