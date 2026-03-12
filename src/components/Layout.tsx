import React from 'react'
import { NavLink, Outlet } from 'react-router-dom'

import '../Styles/Layout.css'

const navigationItems = [
  { to: '/', label: 'Início' },
  { to: '/caps', label: 'Unidades CAPS' },
  { to: '/donate', label: 'Doações' },
  { to: '/thanks', label: 'Agradecimentos' },
  { to: '/admin/login', label: 'Área Admin' }
]

export default function Layout(): React.ReactElement {
  return (
    <>
      <header className="health-header">
        <div className="health-header__inner">
          <div className="health-brand">
            <img
              className="health-brand__logo"
              src="/SESAU.png"
              alt="Logo da rede CAPS"
            />
            <div className="health-brand__text">
              <span className="health-brand__kicker">Rede de Atenção Psicossocial</span>
              <h1>Centro de Doação CAPS</h1>
            </div>
          </div>

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