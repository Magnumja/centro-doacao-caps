import React from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'

import Home from '../pages/Home'
import CapsPage from '../pages/CapsPage'
import Donate from '../pages/Donate'
import Login from '../pages/admin/Login'
import Dashboard from '../pages/admin/Dashboard'
import Layout from '../components/Layout'

export default function Router(): React.ReactElement {
  return (
    // HashRouter evita erro de refresh em hospedagens estáticas sem rewrite.
    <HashRouter>
      <Routes>
        {/*
          Layout é a rota "pai" para compartilhar banner/menu em todas as telas filhas.
          Cada <Route /> abaixo é renderizada dentro do <Outlet /> do Layout.
        */}
        <Route element={<Layout />}>
          {/* Página inicial */}
          <Route path="/" element={<Home />} />

          {/* Compatibilidade com o caminho antigo /home */}
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Fluxo de doação por unidade (aceita query string como ?unit=c1) */}
          <Route path="/caps/*" element={<CapsPage />} />

          {/* Vitrine pública de necessidades */}
          <Route path="/donate" element={<Donate />} />

          {/* Entrada da área administrativa */}
          <Route path="/admin/login" element={<Login />} />

          {/* Área administrativa (telas/tabs internas) */}
          <Route path="/admin/*" element={<Dashboard />} />

          {/* Fallback para qualquer rota não mapeada */}
          <Route path="*" element={<div className="page-block"><h2>Rota não encontrada</h2></div>} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
