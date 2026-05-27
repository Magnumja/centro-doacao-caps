import React from 'react'
import { createRoot } from 'react-dom/client'

import Router from './app/router'
import { installPerformanceMetrics } from './lib/performance-metrics'

const rootEl = document.getElementById('root') as HTMLElement

installPerformanceMetrics()

createRoot(rootEl).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>,
)
