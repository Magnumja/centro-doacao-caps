import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { isLocalAuthBypassEnabled } from '../lib/auth'
import '../Styles/Layout.css'
import logo from '../public/logosesau.png'

export default function Layout(): React.ReactElement {
  const hasAdminSession = typeof window !== 'undefined' && !!localStorage.getItem('loggedHost')
  const canOpenAdminDirectly = hasAdminSession || isLocalAuthBypassEnabled()

  // Itens exibidos no menu principal da aplicação.
  const navigationItems = [
    { to: '/', label: 'Início' },
    { to: '/caps', label: 'Unidades CAPS' },
    { to: '/donate', label: 'Doações' },
    { to: canOpenAdminDirectly ? '/admin/dashboard' : '/admin/login', label: 'Área Admin' },
  ]

  return (
    <>
      {/* Banner institucional fixo no topo do site */}
      <div className="site-banner">
        <div className="site-banner__content">
          <img
            className="site-banner__logo"
            src={logo}
            alt="Logo SESAU"
          />
          <div className="site-banner__text">
            <h1 className="site-banner__title">Centro de Doação CAPS</h1>
            <p className="site-banner__desc">Rede de Atenção Psicossocial — Campo Grande (MS)</p>
            <span className="site-banner__kicker">Secretaria Municipal de Saúde</span>
          </div>
        </div>
      </div>

      {/* Cabeçalho com links de navegação */}
      <header className="health-header">
        <div className="health-header__inner">
          <nav className="health-nav" aria-label="Menu principal">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                // Só marca "Início" como ativo quando caminho é exatamente '/'.
                end={item.to === '/'}
                className={({ isActive }) =>
                  `health-nav__link${isActive ? ' health-nav__link--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>

      {/* Área onde a rota filha é renderizada */}
      <Outlet />
    </>
  )
}
