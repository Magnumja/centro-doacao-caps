import React, { Suspense, lazy } from 'react'
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'

import Home from '../pages/Home'
import AboutProject from '../pages/AboutProject'
import CapsPage from '../pages/CapsPage'
import Donate from '../pages/Donate'
import YourDonations from '../pages/YourDonations'
import NotFound from '../pages/NotFound'
import Layout from '../components/Layout'

// Área administrativa em arquivos separados: o visitante comum não baixa esse código.
const Login = lazy(() => import('../pages/admin/Login'))
const Dashboard = lazy(() => import('../pages/admin/Dashboard'))

function AdminFallback(): React.ReactElement {
  return (
    <section className="page-block" aria-busy="true">
      <p className="home-urgent-empty" role="status">Carregando painel...</p>
    </section>
  )
}

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
          <Route path="/sobre-o-projeto" element={<AboutProject />} />

          {/* Fluxo de doação: /caps (lista), /caps/:unidade e /caps/:unidade?pedido=ID */}
          <Route path="/caps/*" element={<CapsPage />} />

          {/* Vitrine pública de necessidades */}
          <Route path="/donate" element={<Donate />} />
          <Route path="/suas-doacoes" element={<YourDonations />} />

          {/* Entrada da área administrativa */}
          <Route path="/admin/login" element={<Suspense fallback={<AdminFallback />}><Login /></Suspense>} />

          {/* Área administrativa (telas/tabs internas) */}
          <Route path="/admin/*" element={<Suspense fallback={<AdminFallback />}><Dashboard /></Suspense>} />

          {/* Fallback para qualquer rota não mapeada */}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
