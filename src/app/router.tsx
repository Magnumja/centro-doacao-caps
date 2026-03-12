import React from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import Home from '../pages/Home'
import CapsPage from '../pages/CapsPage'
import Donate from '../pages/Donate'
import Thanks from '../pages/Thanks'
import Login from '../pages/admin/Login'
import Dashboard from '../pages/admin/Dashboard'
import Layout from '../components/Layout'

export default function Router(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="/caps/*" element={<CapsPage />} />
          <Route path="/donate" element={<Donate />} />
          <Route path="/thanks" element={<Thanks />} />
          <Route path="/admin/login" element={<Login />} />
          <Route path="/admin/*" element={<Dashboard />} />
          <Route path="*" element={<div className="page-block"><h2>Rota nao encontrada</h2></div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
