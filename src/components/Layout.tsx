import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import '../Styles/Layout.css'

const navigationItems = [
  { to: '/', label: 'Início' },
  { to: '/caps', label: 'Unidades CAPS' },
  { to: '/donate', label: 'Doações' },
  { to: '/admin/login', label: 'Área Admin' }
]

export default function Layout(): React.ReactElement {
  return (
    <>
      <div className="site-banner">
        <div className="site-banner__content">
          <img
            className="site-banner__logo"
            src="/logosesau.png"
            alt="Logo SESAU"
          />
          <div className="site-banner__text">
            <h1 className="site-banner__title">Centro de Doacao CAPS</h1>
            <p className="site-banner__desc">Rede de Atencao Psicossocial — Campo Grande (MS)</p>
            <span className="site-banner__kicker">Secretaria Municipal de Saude</span>
          </div>
        </div>
      </div>

      <header className="health-header">
        <div className="health-header__inner">
          <nav className="health-nav" aria-label="Menu principal">
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
        </div>
      </header>

      <Outlet />
    </>
  )
}