import React from 'react'
import { createRoot } from 'react-dom/client'

import Router from './app/router'

// Elemento raiz definido no index.html (id="root").
const rootEl = document.getElementById('root') as HTMLElement

createRoot(rootEl).render(
  // StrictMode ajuda a detectar efeitos colaterais durante desenvolvimento.
  <React.StrictMode>
    {/* Router centraliza todas as rotas do aplicativo */}
    <Router />
  </React.StrictMode>
)
