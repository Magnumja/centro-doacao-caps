import React from 'react'
import { createRoot } from 'react-dom/client'

import Router from './app/router'
import { ThemeProvider } from './theme/ThemeProvider'

const rootEl = document.getElementById('root') as HTMLElement

createRoot(rootEl).render(
  <React.StrictMode>
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  </React.StrictMode>,
)
