import React from 'react'
import { createRoot } from 'react-dom/client'
import Router from './app/router'
import Login from './pages/admin/Login'
import Home from './pages/Home'

const rootEl = document.getElementById('root') as HTMLElement

createRoot(rootEl).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
)
