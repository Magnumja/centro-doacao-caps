import React, { useEffect, useState } from 'react'
import { FaBars, FaTimes } from 'react-icons/fa'
import { NavLink, Outlet, useLocation } from 'react-router-dom'

import { isLocalAuthBypassEnabled } from '../lib/auth'
import '../Styles/Layout.css'
import ThemeToggle from './ui/ThemeToggle'
import logo from '../public/logosesau.png'

export default function Layout(): React.ReactElement {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()
  const hasAdminSession = typeof window !== 'undefined' && !!localStorage.getItem('loggedHost')
  const canOpenAdminDirectly = hasAdminSession || isLocalAuthBypassEnabled()

  const navigationItems = [
    { to: '/', label: 'Início' },
    { to: '/caps', label: 'Unidades CAPS' },
    { to: '/donate', label: 'Doações' },
    { to: '/suas-doacoes', label: 'Suas Doações' },
    { to: canOpenAdminDirectly ? '/admin/dashboard' : '/admin/login', label: 'Área Admin' },
    { to: '/sobre-o-projeto', label: 'Sobre o Projeto' },
  ]

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [location.pathname])

  useEffect(() => {
    if (!isMobileMenuOpen) {
      return undefined
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') {
        setIsMobileMenuOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <a className="skip-link" href="#main-content">Pular para o conteúdo principal</a>
      <a className="skip-link" href="#primary-navigation">Pular para navegação</a>

      <div className="site-banner">
        <div className="site-banner__content">
          <img className="site-banner__logo" src={logo} alt="Logo SESAU" />
          <div className="site-banner__text">
            <h1 className="site-banner__title">Centro de Doação CAPS</h1>
            <p className="site-banner__desc">Rede de Atenção Psicossocial - Campo Grande (MS)</p>
            <span className="site-banner__kicker">Secretaria Municipal de Saúde</span>
          </div>
        </div>
      </div>

      <header className="health-header">
        <div className="health-header__inner">
          <button
            type="button"
            className="mobile-nav-toggle"
            aria-expanded={isMobileMenuOpen}
            aria-controls="primary-navigation"
            aria-label={isMobileMenuOpen ? 'Fechar menu principal' : 'Abrir menu principal'}
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            {isMobileMenuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
            <span>Menu</span>
          </button>

          <button
            type="button"
            className={`mobile-nav-backdrop${isMobileMenuOpen ? ' mobile-nav-backdrop--visible' : ''}`}
            aria-label="Fechar menu principal"
            aria-hidden={!isMobileMenuOpen}
            tabIndex={isMobileMenuOpen ? 0 : -1}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <nav
            id="primary-navigation"
            className={`health-nav${isMobileMenuOpen ? ' health-nav--open' : ''}`}
            aria-label="Menu principal"
          >
            <div className="health-nav__mobile-header">
              <strong>Menu</strong>
              <button
                type="button"
                aria-label="Fechar menu principal"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <FaTimes aria-hidden="true" />
              </button>
            </div>

            {navigationItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={() => setIsMobileMenuOpen(false)}
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
