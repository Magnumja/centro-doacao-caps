import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import { isLocalAuthBypassEnabled } from '../lib/auth'
import '../Styles/Layout.css'
import ThemeToggle from './ui/ThemeToggle'
import logo from '../public/logosesau.png'

export default function Layout(): React.ReactElement {
  const hasAdminSession = typeof window !== 'undefined' && !!localStorage.getItem('loggedHost')
  const canOpenAdminDirectly = hasAdminSession || isLocalAuthBypassEnabled()

  const navigationItems = [
    { to: '/', label: 'Início' },
    { to: '/caps', label: 'Unidades CAPS' },
    { to: '/donate', label: 'Doações' },
    { to: '/suas-doacoes', label: 'Suas Doações' },
    { to: canOpenAdminDirectly ? '/admin/dashboard' : '/admin/login', label: 'Área Admin' },
  ]

  return (
    <>
      <a className="skip-link" href="#main-content">Pular para o conteúdo principal</a>
      <a className="skip-link" href="#primary-navigation">Pular para navegação</a>

      <div className="site-banner">
        <div className="site-banner__content">
          <img className="site-banner__logo" src={logo} alt="Logo SESAU" />
          <div className="site-banner__text">
            <h1 className="site-banner__title">Centro de Doação CAPS</h1>
            <p className="site-banner__desc">Rede de Atenção Psicossocial — Campo Grande (MS)</p>
            <span className="site-banner__kicker">Secretaria Municipal de Saúde</span>
          </div>
        </div>
      </div>

      <header className="health-header">
        <div className="health-header__inner">
          <nav id="primary-navigation" className="health-nav" aria-label="Menu principal">
            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `health-nav__link${isActive ? ' health-nav__link--active' : ''}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </>
  )
}
