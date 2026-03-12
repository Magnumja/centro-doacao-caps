import React from 'react'
import { createRoot } from 'react-dom/client'

import Router from './app/router'

const rootEl = document.getElementById('root') as HTMLElement

createRoot(rootEl).render(
  <React.StrictMode>
    <Router />
  </React.StrictMode>
)
