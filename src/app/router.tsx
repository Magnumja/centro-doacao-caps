import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import CapsPage from '../pages/CapsPage'
import Donate from '../pages/Donate'
import Thanks from '../pages/Thanks'
import Login from '../pages/admin/Login'
import Dashboard from '../pages/admin/Dashboard'

export default function Router(): JSX.Element {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/caps/*" element={<CapsPage />} />
        <Route path="/donate" element={<Donate />} />
        <Route path="/thanks" element={<Thanks />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/*" element={<Dashboard />} />
        <Route path="*" element={<div style={{ padding: 24 }}><h2>Rota não encontrada</h2></div>} />
      </Routes>
    </BrowserRouter>
  )
}
